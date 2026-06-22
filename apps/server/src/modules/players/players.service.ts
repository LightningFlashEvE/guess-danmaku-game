import type { Player } from '@prisma/client';
import { prisma } from '../../prisma.js';
import { calculateRank } from '../../utils/rank.js';
import type { PlayerRankDto } from '../../types.js';

export class PlayersService {
  async findOrCreate(params: {
    platform: string;
    platformUid: string;
    nickname: string;
    avatar?: string;
  }): Promise<Player> {
    const { platform, platformUid, nickname, avatar } = params;
    return prisma.player.upsert({
      where: { platform_platformUid: { platform, platformUid } },
      update: { nickname, ...(avatar ? { avatar } : {}) },
      create: { platform, platformUid, nickname, avatar },
    });
  }

  async findById(id: string): Promise<Player | null> {
    return prisma.player.findUnique({ where: { id } });
  }

  /**
   * 结算积分：增加总积分，猜中则同时累加正确次数。不修改 guessNum。
   */
  async settle(playerId: string, score: number, correct: boolean): Promise<Player> {
    return prisma.player.update({
      where: { id: playerId },
      data: {
        totalScore: { increment: score },
        ...(correct ? { correctNum: { increment: 1 } } : {}),
      },
    });
  }

  /**
   * 记录一次有效猜测（用于统计 guessNum）。
   */
  async recordGuess(playerId: string): Promise<void> {
    await prisma.player.update({
      where: { id: playerId },
      data: { guessNum: { increment: 1 } },
    });
  }

  async top(limit = 15): Promise<PlayerRankDto[]> {
    const players = await prisma.player.findMany({
      orderBy: { totalScore: 'desc' },
      take: limit,
    });
    return players.map((p) => this.toRankDto(p));
  }

  toRankDto(player: Player): PlayerRankDto {
    const rank = calculateRank(player.totalScore);
    return {
      playerId: player.id,
      nickname: player.nickname,
      totalScore: player.totalScore,
      rankName: rank.rankName,
      rankLevel: rank.rankLevel,
      progressCurrent: rank.progressCurrent,
      progressTotal: rank.progressTotal,
    };
  }
}

export const playersService = new PlayersService();
