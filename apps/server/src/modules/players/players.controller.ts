import { Router } from 'express';
import { asyncHandler, ok, fail } from '../../utils/http.js';
import { playersService } from './players.service.js';

export const playersRouter = Router();

playersRouter.get(
  '/top',
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 15;
    ok(res, await playersService.top(limit));
  }),
);

playersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const player = await playersService.findById(req.params.id);
    if (!player) return fail(res, '玩家不存在', 404);
    ok(res, playersService.toRankDto(player));
  }),
);
