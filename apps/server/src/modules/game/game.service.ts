import type { GameRound, Word } from '@prisma/client';
import { prisma } from '../../prisma.js';
import { calculateRankName } from '../../utils/rank.js';
import { toDisplaySimilarity } from '../../utils/similarity.js';
import { embeddingService } from '../embedding/embedding.service.js';
import { configService } from '../config/config.service.js';
import { rankingService } from '../ranking/ranking.service.js';
import { guessesService } from '../guesses/guesses.service.js';
import { playersService } from '../players/players.service.js';
import { gameGateway } from './game.gateway.js';
import { computeSettlement } from '../../utils/score.js';
import { parseSimilarWords } from '../../utils/closeness.js';
import { isTwoCharWord } from '../../utils/word-length.js';
import { config } from '../../config.js';
import type { RuntimeRound, ScoreSettlementRow, StartRoundOptions } from './game.types.js';
import type {
  CurrentRoundDto,
  GameStateDto,
  LastRoundDto,
} from '../../types.js';

const RECENT_LIMIT = 20;

function onlyTwoCharWords(words: Word[]): Word[] {
  return words.filter((w) => isTwoCharWord(w.word));
}

export class GameService {
  private runtime: RuntimeRound | null = null;
  private lastRound: LastRoundDto | null = null;
  private recentWordIds: string[] = [];
  private timer: NodeJS.Timeout | null = null;
  private topSimilarity = 0;
  private topGuessWord = '';

  getRuntime(): RuntimeRound | null {
    return this.runtime && this.runtime.status === 'running' ? this.runtime : null;
  }

  // ---------- 选词 ----------
  private async pickWord(options: StartRoundOptions): Promise<Word> {
    const cfg = await configService.get();
    const category = options.category ?? cfg.defaultCategory ?? undefined;
    const difficultyMin = options.difficultyMin ?? 1;
    const difficultyMax = options.difficultyMax ?? 3;

    const candidates = await prisma.word.findMany({
      where: {
        enabled: true,
        ...(category ? { category } : {}),
        difficulty: { gte: difficultyMin, lte: difficultyMax },
        id: { notIn: this.recentWordIds },
      },
    });

    let pool = onlyTwoCharWords(candidates);
    if (pool.length === 0) {
      // 放宽：忽略最近出现限制
      pool = onlyTwoCharWords(
        await prisma.word.findMany({
          where: {
            enabled: true,
            ...(category ? { category } : {}),
            difficulty: { gte: difficultyMin, lte: difficultyMax },
          },
        }),
      );
    }
    if (pool.length === 0) {
      throw new Error('没有符合条件的两字词条，请先在词库中添加并启用两字词');
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ---------- 开始一轮 ----------
  async startRound(options: StartRoundOptions = {}): Promise<CurrentRoundDto> {
    if (this.getRuntime()) {
      await this.endRound('manual');
    }

    const cfg = await configService.get();
    const word = await this.pickWord(options);
    const durationSeconds = options.durationSeconds ?? cfg.roundDurationSeconds;

    // 确保有 embedding（mock provider 可即时生成）
    let answerEmbedding = embeddingService.deserialize(word.embedding);
    if (!answerEmbedding) {
      try {
        answerEmbedding = await embeddingService.embed(word.word);
        await prisma.word.update({
          where: { id: word.id },
          data: { embedding: embeddingService.serialize(answerEmbedding) },
        });
      } catch {
        answerEmbedding = null;
      }
    }

    const round = await prisma.gameRound.create({
      data: {
        wordId: word.id,
        answerWord: word.word,
        category: word.category,
        subCategory: word.subCategory,
        difficulty: word.difficulty,
        durationSeconds,
        status: 'running',
        startedAt: new Date(),
      },
    });

    this.runtime = {
      id: round.id,
      wordId: word.id,
      answerWord: word.word,
      aliases: (word.aliases ?? '').split('|').map((a) => a.trim()).filter(Boolean),
      similarWords: parseSimilarWords(word.similarWords),
      answerEmbedding,
      category: word.category,
      subCategory: word.subCategory,
      difficulty: word.difficulty,
      hint1: cfg.hintEnabled ? word.hint1 : null,
      hint2: cfg.hintEnabled ? word.hint2 : null,
      hint3: cfg.hintEnabled ? word.hint3 : null,
      durationSeconds,
      startedAt: Date.now(),
      status: 'running',
      seenGuesses: new Set<string>(),
    };
    this.topSimilarity = 0;
    this.topGuessWord = '';

    this.recentWordIds.push(word.id);
    if (this.recentWordIds.length > RECENT_LIMIT) this.recentWordIds.shift();

    this.startTimer();

    const dto = this.getCurrentRoundDto()!;
    gameGateway.roundStarted(dto);
    await this.broadcastState();
    return dto;
  }

  // ---------- 计时器 ----------
  private startTimer(): void {
    this.clearTimer();
    this.timer = setInterval(() => {
      const remaining = this.getRemainingSeconds();
      gameGateway.timer(remaining);
      if (remaining <= 0) {
        void this.endRound('timeout');
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private getRemainingSeconds(): number {
    if (!this.runtime || this.runtime.status !== 'running') return 0;
    const elapsed = (Date.now() - this.runtime.startedAt) / 1000;
    return Math.max(0, Math.ceil(this.runtime.durationSeconds - elapsed));
  }

  // ---------- 同词去重（供 danmaku 调用） ----------
  /** 若该玩家本轮已猜过同一个词返回 true，否则登记并返回 false */
  checkAndMarkGuess(playerId: string, guessWord: string): boolean {
    const r = this.getRuntime();
    if (!r) return false;
    const key = `${playerId}:${guessWord}`;
    if (r.seenGuesses.has(key)) return true;
    r.seenGuesses.add(key);
    return false;
  }

  // ---------- 记录最高相似度（供 danmaku 调用） ----------
  noteTopSimilarity(similarity: number, guessWord: string): void {
    if (similarity > this.topSimilarity) {
      this.topSimilarity = similarity;
      this.topGuessWord = guessWord;
    }
  }

  // ---------- 结束一轮 ----------
  async endRoundByWinner(roundId: string, playerId: string, nickname: string): Promise<void> {
    if (!this.runtime || this.runtime.id !== roundId) return;
    await this.endRound('winner', { playerId, nickname });
  }

  async endRound(
    reason: 'timeout' | 'manual' | 'winner' | 'skip',
    winner?: { playerId: string; nickname: string },
  ): Promise<{ settlement: ScoreSettlementRow[]; answerWord: string } | null> {
    const runtime = this.runtime;
    if (!runtime || runtime.status !== 'running') return null;

    this.clearTimer();
    runtime.status = 'ended';

    const settlement = reason === 'skip' ? [] : await this.settleScores(runtime.id, winner);

    let winnerPlayerId = winner?.playerId ?? null;
    let winnerNickname = winner?.nickname ?? null;
    if (!winnerPlayerId && settlement.length > 0) {
      winnerPlayerId = settlement[0].playerId;
      winnerNickname = settlement[0].nickname;
    }

    const updated = await prisma.gameRound.update({
      where: { id: runtime.id },
      data: {
        status: 'ended',
        endedAt: new Date(),
        winnerPlayerId,
        winnerNickname,
      },
    });

    const correctGuessers = await this.fetchCorrectGuessers(runtime.id);

    this.lastRound = this.toLastRoundDto(updated, correctGuessers);
    this.runtime = null;

    gameGateway.roundEnded({
      roundId: updated.id,
      answerWord: updated.answerWord,
      category: updated.category,
      reason,
      winnerNickname,
      correctGuessers,
      settlement,
    });
    await this.broadcastState();

    // 公布答案后自动下一轮（手动结束 / 跳过除外）
    const cfg = await configService.get();
    if (cfg.autoNextRound && reason !== 'manual' && reason !== 'skip') {
      const delayMs = config.interRoundDelaySeconds * 1000;
      setTimeout(() => {
        void this.startRound().catch(() => undefined);
      }, delayMs);
    }

    return { settlement, answerWord: updated.answerWord };
  }

  async skipRound(): Promise<void> {
    await this.endRound('skip');
  }

  /**
   * 清空本轮排行榜（删除当前轮的所有猜词记录）。
   */
  async clearCurrentRanking(): Promise<void> {
    const runtime = this.getRuntime();
    if (!runtime) return;
    await prisma.guess.deleteMany({ where: { roundId: runtime.id } });
    this.topSimilarity = 0;
    this.topGuessWord = '';
    await this.pushRankingUpdate();
    await this.broadcastState();
  }

  // ---------- 积分结算 ----------
  private async settleScores(
    roundId: string,
    winner?: { playerId: string; nickname: string },
  ): Promise<ScoreSettlementRow[]> {
    const best = await guessesService.bestPerPlayer(roundId, 9999);
    if (best.length === 0) return [];

    const guessIdByPlayer = new Map(best.map((g) => [g.playerId, g.id]));
    const settlement = computeSettlement(
      best.map((g) => ({
        playerId: g.playerId,
        nickname: g.nickname,
        similarity: g.similarity,
        isCorrect: g.isCorrect,
      })),
    );

    const rows: ScoreSettlementRow[] = [];
    for (const row of settlement) {
      await playersService.settle(row.playerId, row.scoreAdded, row.isCorrect);
      const guessId = guessIdByPlayer.get(row.playerId);
      if (guessId) await guessesService.updateScore(guessId, row.scoreAdded);
      rows.push(row);
    }
    return rows;
  }

  // ---------- DTO ----------
  getCurrentRoundDto(): CurrentRoundDto | null {
    const r = this.runtime;
    if (!r || r.status !== 'running') return null;
    const len = Array.from(r.answerWord).length;
    return {
      id: r.id,
      maskedWord: Array.from({ length: len }, () => '_').join(' '),
      wordLength: len,
      category: r.category,
      subCategory: r.subCategory,
      difficulty: r.difficulty,
      hint1: r.hint1,
      hint2: r.hint2,
      hint3: r.hint3,
      status: 'running',
      durationSeconds: r.durationSeconds,
      remainingSeconds: this.getRemainingSeconds(),
      topSimilarity: Math.round(this.topSimilarity * 1000) / 10,
      topGuessWord: this.topGuessWord || undefined,
    };
  }

  getLastRound(): LastRoundDto | null {
    return this.lastRound;
  }

  private async fetchCorrectGuessers(roundId: string) {
    const rows = await prisma.guess.findMany({
      where: { roundId, isCorrect: true },
      orderBy: { createdAt: 'asc' },
    });
    const seen = new Set<string>();
    const result: { nickname: string; guessWord: string }[] = [];
    for (const g of rows) {
      if (seen.has(g.playerId)) continue;
      seen.add(g.playerId);
      result.push({ nickname: g.nickname, guessWord: g.guessWord });
    }
    return result;
  }

  private toLastRoundDto(
    round: GameRound,
    correctGuessers: { nickname: string; guessWord: string }[],
  ): LastRoundDto {
    return {
      id: round.id,
      answerWord: round.answerWord,
      category: round.category,
      winnerNickname: round.winnerNickname,
      correctGuessers,
      endedAt: round.endedAt?.toISOString() ?? null,
    };
  }

  /** 仅主播可见：当前答案 */
  getCurrentAnswer(): string | null {
    return this.getRuntime()?.answerWord ?? null;
  }

  async getState(): Promise<GameStateDto> {
    const current = this.getCurrentRoundDto();
    const roundRanking = current ? await rankingService.getRoundRanking(current.id) : [];
    const playerRanking = await rankingService.getPlayerRanking();
    return {
      currentRound: current,
      lastRound: this.lastRound,
      roundRanking,
      playerRanking,
      realtimeGuesses: roundRanking.slice(0, 10),
      remainingSeconds: this.getRemainingSeconds(),
    };
  }

  async broadcastState(): Promise<void> {
    gameGateway.broadcastState(await this.getState());
  }

  // 供 danmaku 在每次猜词后刷新排行榜推送
  async pushRankingUpdate(): Promise<void> {
    const current = this.getCurrentRoundDto();
    if (current) {
      const ranking = await rankingService.getRoundRanking(current.id);
      gameGateway.rankingUpdated(ranking);
    }
    const playerRanking = await rankingService.getPlayerRanking();
    gameGateway.playerRankingUpdated(playerRanking);
  }

  // 工具：把单条 guess 转成展示 DTO 用于 guessAdded 推送
  buildGuessDto(params: {
    id: string;
    playerId: string;
    nickname: string;
    totalScore: number;
    guessWord: string;
    similarity: number;
    isCorrect: boolean;
    createdAt: Date;
  }) {
    return {
      id: params.id,
      playerId: params.playerId,
      nickname: params.nickname,
      rankName: calculateRankName(params.totalScore),
      guessWord: params.guessWord,
      similarity: params.similarity,
      displaySimilarity: toDisplaySimilarity(params.similarity),
      isCorrect: params.isCorrect,
      createdAt: params.createdAt.toISOString(),
    };
  }
}

export const gameService = new GameService();
