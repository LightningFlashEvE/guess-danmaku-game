import { Router, type Request, type Response, type NextFunction } from 'express';
import { asyncHandler, ok, fail } from '../../utils/http.js';
import { danmakuService } from './danmaku.service.js';
import { giftsService } from '../gifts/gifts.service.js';
import { config } from '../../config.js';
import type { DanmakuMessage } from '../../types.js';

export const danmakuRouter = Router();

/** 校验 x-ingest-token，供抖音等外部采集程序调用 */
function requireIngestToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.header('x-ingest-token');
  if (!token || token !== config.ingestToken) {
    fail(res, 'x-ingest-token 无效或缺失', 401);
    return;
  }
  next();
}

const ALLOWED_PLATFORMS: DanmakuMessage['platform'][] = ['debug', 'bilibili', 'douyin', 'kuaishou'];

function normalizePlatform(p: unknown): DanmakuMessage['platform'] {
  return ALLOWED_PLATFORMS.includes(p as DanmakuMessage['platform'])
    ? (p as DanmakuMessage['platform'])
    : 'douyin';
}

danmakuRouter.post(
  '/debug',
  asyncHandler(async (req, res) => {
    const { nickname, content, platformUid } = req.body ?? {};
    if (!nickname || !content) {
      return fail(res, 'nickname 和 content 不能为空');
    }

    const message: DanmakuMessage = {
      platform: 'debug',
      platformUid: platformUid || `debug:${nickname}`,
      nickname: String(nickname),
      content: String(content),
      timestamp: Date.now(),
    };

    const result = await danmakuService.receiveMessage(message, true);
    ok(res, result);
  }),
);

/**
 * 通用弹幕入口（抖音等外部采集程序调用）。
 * 不在此处编写平台采集逻辑，外部程序负责采集后调用本接口。
 */
danmakuRouter.post(
  '/ingest',
  requireIngestToken,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const { platformUid, nickname, content, messageType } = body;

    // 礼物类型走礼物记录
    if (messageType === 'gift') {
      if (!platformUid || !nickname || !body.giftName) {
        return fail(res, 'gift 消息需要 platformUid、nickname、giftName');
      }
      const gift = await giftsService.record({
        platform: normalizePlatform(body.platform),
        roomId: body.roomId ? String(body.roomId) : undefined,
        platformUid: String(platformUid),
        nickname: String(nickname),
        giftName: String(body.giftName),
        giftCount: Number(body.giftCount) || 1,
        giftValue: Number(body.giftValue) || 0,
      });
      return ok(res, { type: 'gift', id: gift.id });
    }

    if (!platformUid || !nickname || !content) {
      return fail(res, 'comment 消息需要 platformUid、nickname、content');
    }

    const message: DanmakuMessage = {
      platform: normalizePlatform(body.platform),
      platformUid: String(platformUid),
      nickname: String(nickname),
      avatar: body.avatar ? String(body.avatar) : undefined,
      content: String(content),
      timestamp: Number(body.timestamp) || Date.now(),
    };

    const result = await danmakuService.receiveMessage(message);
    ok(res, { type: 'comment', ...result });
  }),
);

/**
 * 礼物事件入口（预留贡献榜，MVP 不影响猜词）。
 */
danmakuRouter.post(
  '/gift',
  requireIngestToken,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    if (!body.platformUid || !body.nickname || !body.giftName) {
      return fail(res, '需要 platformUid、nickname、giftName');
    }
    const gift = await giftsService.record({
      platform: normalizePlatform(body.platform),
      roomId: body.roomId ? String(body.roomId) : undefined,
      platformUid: String(body.platformUid),
      nickname: String(body.nickname),
      giftName: String(body.giftName),
      giftCount: Number(body.giftCount) || 1,
      giftValue: Number(body.giftValue) || 0,
    });
    ok(res, { id: gift.id }, '礼物已记录');
  }),
);
