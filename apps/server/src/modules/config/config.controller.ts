import { Router } from 'express';
import { asyncHandler, ok } from '../../utils/http.js';
import { configService } from './config.service.js';

export const configRouter = Router();

configRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    ok(res, await configService.get());
  }),
);

configRouter.patch(
  '/',
  asyncHandler(async (req, res) => {
    const allowed = [
      'roundDurationSeconds',
      'defaultCategory',
      'autoNextRound',
      'hintEnabled',
      'correctThreshold',
      'topRankLimit',
    ] as const;
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) patch[key] = req.body[key];
    }
    const updated = await configService.update(patch);
    ok(res, updated, '配置已更新');
  }),
);
