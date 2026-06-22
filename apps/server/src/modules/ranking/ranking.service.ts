import { prisma } from '../../prisma.js';
import { calculateRankName } from '../../utils/rank.js';
import { toDisplaySimilarity } from '../../utils/similarity.js';
import { guessesService } from '../guesses/guesses.service.js';
import { playersService } from '../players/players.service.js';
import { configService } from '../config/config.service.js';
import type { PlayerRankDto, RoundGuessDto } from '../../types.js';

export class RankingService {
  /**
   * 计算本轮排行榜（每个玩家取最高相似度），按相似度降序。
   */
  async getRoundRanking(roundId: string): Promise<RoundGuessDto[]> {
    const cfg = await configService.get();
    const best = await guessesService.bestPerPlayer(roundId, cfg.topRankLimit);
    if (best.length === 0) return [];

    const playerIds = [...new Set(best.map((g) => g.playerId))];
    const players = await prisma.player.findMany({ where: { id: { in: playerIds } } });
    const scoreMap = new Map(players.map((p) => [p.id, p.totalScore]));

    return best.map((g) => ({
      id: g.id,
      playerId: g.playerId,
      nickname: g.nickname,
      rankName: calculateRankName(scoreMap.get(g.playerId) ?? 0),
      guessWord: g.guessWord,
      similarity: g.similarity,
      displaySimilarity: toDisplaySimilarity(g.similarity),
      isCorrect: g.isCorrect,
      createdAt: g.createdAt.toISOString(),
    }));
  }

  /**
   * 积分排行榜。
   */
  async getPlayerRanking(): Promise<PlayerRankDto[]> {
    const cfg = await configService.get();
    return playersService.top(cfg.topRankLimit);
  }
}

export const rankingService = new RankingService();
