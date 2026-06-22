import type { GiftEvent } from '@prisma/client';
import { prisma } from '../../prisma.js';

export interface RecordGiftInput {
  platform: string;
  roomId?: string;
  platformUid: string;
  nickname: string;
  giftName: string;
  giftCount?: number;
  giftValue?: number;
}

export class GiftsService {
  /**
   * 记录一条礼物事件。MVP 阶段礼物不影响猜词相似度，仅落库并预留贡献榜。
   */
  async record(input: RecordGiftInput): Promise<GiftEvent> {
    return prisma.giftEvent.create({
      data: {
        platform: input.platform,
        roomId: input.roomId,
        platformUid: input.platformUid,
        nickname: input.nickname,
        giftName: input.giftName,
        giftCount: input.giftCount ?? 1,
        giftValue: input.giftValue ?? 0,
      },
    });
  }

  /**
   * 贡献榜（按礼物价值累计）。预留接口，供后续 OBS 展示。
   */
  async contributionTop(limit = 15): Promise<{ platformUid: string; nickname: string; total: number }[]> {
    const grouped = await prisma.giftEvent.groupBy({
      by: ['platformUid', 'nickname'],
      _sum: { giftValue: true },
      orderBy: { _sum: { giftValue: 'desc' } },
      take: limit,
    });
    return grouped.map((g) => ({
      platformUid: g.platformUid,
      nickname: g.nickname,
      total: g._sum.giftValue ?? 0,
    }));
  }
}

export const giftsService = new GiftsService();
