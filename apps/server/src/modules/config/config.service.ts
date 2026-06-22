import type { GameConfig } from '@prisma/client';
import { prisma } from '../../prisma.js';
import { config as envConfig } from '../../config.js';

export class ConfigService {
  /**
   * 获取游戏配置，不存在则使用环境变量默认值创建。
   */
  async get(): Promise<GameConfig> {
    const existing = await prisma.gameConfig.findFirst();
    if (existing) return existing;

    return prisma.gameConfig.create({
      data: {
        roundDurationSeconds: envConfig.game.defaultRoundDurationSeconds,
        correctThreshold: envConfig.game.correctThreshold,
        topRankLimit: envConfig.game.topRankLimit,
        hintEnabled: false,
        autoNextRound: true,
      },
    });
  }

  async update(patch: Partial<Omit<GameConfig, 'id' | 'createdAt' | 'updatedAt'>>): Promise<GameConfig> {
    const current = await this.get();
    return prisma.gameConfig.update({
      where: { id: current.id },
      data: patch,
    });
  }
}

export const configService = new ConfigService();
