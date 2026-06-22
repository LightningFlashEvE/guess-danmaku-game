import type { Guess } from '@prisma/client';
import { prisma } from '../../prisma.js';

export interface CreateGuessInput {
  roundId: string;
  playerId: string;
  nickname: string;
  rawText: string;
  guessWord: string;
  similarity: number;
  isCorrect: boolean;
}

export class GuessesService {
  /**
   * 创建一条猜词记录。若同一用户在本轮已有更高（或相等）相似度，则不更新，返回已有记录。
   * 否则更新为更高相似度（实现「只保留最高相似度」）。
   */
  async createOrUpdate(input: CreateGuessInput): Promise<{ guess: Guess; isBest: boolean }> {
    const existing = await prisma.guess.findFirst({
      where: { roundId: input.roundId, playerId: input.playerId },
      orderBy: { similarity: 'desc' },
    });

    if (existing && existing.similarity >= input.similarity) {
      return { guess: existing, isBest: false };
    }

    if (existing) {
      const updated = await prisma.guess.update({
        where: { id: existing.id },
        data: {
          rawText: input.rawText,
          guessWord: input.guessWord,
          similarity: input.similarity,
          isCorrect: input.isCorrect,
        },
      });
      return { guess: updated, isBest: true };
    }

    const created = await prisma.guess.create({ data: input });
    return { guess: created, isBest: true };
  }

  /**
   * 获取本轮每个玩家的最佳猜测，按相似度降序。
   */
  async bestPerPlayer(roundId: string, limit = 50): Promise<Guess[]> {
    const all = await prisma.guess.findMany({
      where: { roundId },
      orderBy: [{ similarity: 'desc' }, { createdAt: 'asc' }],
    });
    const seen = new Set<string>();
    const best: Guess[] = [];
    for (const g of all) {
      if (seen.has(g.playerId)) continue;
      seen.add(g.playerId);
      best.push(g);
      if (best.length >= limit) break;
    }
    return best;
  }

  async updateScore(guessId: string, scoreAdded: number): Promise<void> {
    await prisma.guess.update({ where: { id: guessId }, data: { scoreAdded } });
  }
}

export const guessesService = new GuessesService();
