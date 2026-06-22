import {
  cleanDanmakuText,
  extractGuessWord,
} from '../../utils/text-cleaner.js';
import { cosineSimilarity } from '../../utils/similarity.js';
import { calculateDisplaySimilarity } from '../../utils/closeness.js';
import { embeddingService } from '../embedding/embedding.service.js';
import { playersService } from '../players/players.service.js';
import { guessesService } from '../guesses/guesses.service.js';
import { configService } from '../config/config.service.js';
import { gameService } from '../game/game.service.js';
import { gameGateway } from '../game/game.gateway.js';
import { rateLimiter } from './rate-limiter.js';
import { config } from '../../config.js';
import type { DanmakuMessage } from '../../types.js';
import type { RuntimeRound } from '../game/game.types.js';

export interface DanmakuResult {
  accepted: boolean;
  reason?: string;
  guessWord?: string;
  /** 0~100 的接近度展示分数 */
  displaySimilarity?: number;
  similarity?: number;
  isCorrect?: boolean;
}

export class DanmakuService {
  /**
   * 计算猜测词与当前轮答案的接近度，返回 0~100 展示分数。
   */
  private async calculateDisplayScore(guessWord: string, round: RuntimeRound): Promise<number> {
    let embeddingScore = 0;
    if (round.answerEmbedding) {
      try {
        const guessEmb = await embeddingService.embed(guessWord);
        embeddingScore = Math.max(0, cosineSimilarity(guessEmb, round.answerEmbedding));
      } catch {
        embeddingScore = 0;
      }
    }

    return calculateDisplaySimilarity({
      answerWord: round.answerWord,
      guessWord,
      aliases: round.aliases,
      similarWords: round.similarWords,
      embeddingScore,
    });
  }

  /**
   * 处理一条弹幕消息（核心猜词流程）。
   * skipRateLimit 用于调试/手动模拟弹幕。
   */
  async receiveMessage(message: DanmakuMessage, skipRateLimit = false): Promise<DanmakuResult> {
    const round = gameService.getRuntime();
    if (!round) {
      return { accepted: false, reason: '当前没有进行中的游戏' };
    }

    const cleanText = cleanDanmakuText(message.content);
    const guessWord = extractGuessWord(cleanText);
    if (!guessWord) {
      return { accepted: false, reason: '无效猜测（已被过滤）' };
    }

    // 限流防刷
    if (!skipRateLimit) {
      const userKey = `${message.platform}:${message.platformUid}`;
      const limit = rateLimiter.check(userKey, guessWord);
      if (!limit.allowed) {
        return { accepted: false, reason: limit.reason };
      }
    }

    const player = await playersService.findOrCreate({
      platform: message.platform,
      platformUid: message.platformUid,
      nickname: message.nickname,
      avatar: message.avatar,
    });

    // 同一玩家本轮同一词只处理一次
    if (gameService.checkAndMarkGuess(player.id, guessWord)) {
      return { accepted: false, reason: '本轮已猜过该词' };
    }

    const cfg = await configService.get();
    const displayScore = await this.calculateDisplayScore(guessWord, round);
    const similarity = displayScore / 100;
    const isCorrect =
      guessWord === round.answerWord ||
      round.aliases.includes(guessWord) ||
      similarity >= cfg.correctThreshold;

    const { guess, isBest } = await guessesService.createOrUpdate({
      roundId: round.id,
      playerId: player.id,
      nickname: player.nickname,
      rawText: message.content,
      guessWord,
      similarity,
      isCorrect,
    });

    await playersService.recordGuess(player.id);
    gameService.noteTopSimilarity(similarity, guessWord);

    // 推送单条猜词
    const guessDto = gameService.buildGuessDto({
      id: guess.id,
      playerId: player.id,
      nickname: player.nickname,
      totalScore: player.totalScore,
      guessWord,
      similarity,
      isCorrect,
      createdAt: guess.createdAt,
    });
    gameGateway.guessAdded(guessDto);

    // 仅在产生新的最佳成绩时刷新排行榜，降低无效推送
    if (isBest) {
      await gameService.pushRankingUpdate();
    }

    if (isCorrect) {
      await gameService.endRoundByWinner(round.id, player.id, player.nickname);
    }

    return { accepted: true, guessWord, displaySimilarity: displayScore, similarity, isCorrect };
  }
}

export const danmakuService = new DanmakuService();
export const ingestToken = config.ingestToken; // 供 controller 校验
