import { Router } from 'express';
import { asyncHandler, ok, fail } from '../../utils/http.js';
import { gameService } from './game.service.js';
import { rankingService } from '../ranking/ranking.service.js';
import { embeddingService } from '../embedding/embedding.service.js';

export const gameRouter = Router();

gameRouter.post(
  '/start',
  asyncHandler(async (req, res) => {
    const { category, difficultyMin, difficultyMax, durationSeconds } = req.body ?? {};
    const dto = await gameService.startRound({ category, difficultyMin, difficultyMax, durationSeconds });
    ok(res, dto, '新一轮已开始');
  }),
);

gameRouter.post(
  '/end',
  asyncHandler(async (_req, res) => {
    const result = await gameService.endRound('manual');
    if (!result) return fail(res, '当前没有进行中的游戏');
    ok(res, result, '本轮已结束');
  }),
);

gameRouter.post(
  '/skip',
  asyncHandler(async (_req, res) => {
    await gameService.skipRound();
    ok(res, { skipped: true }, '已跳过当前词');
  }),
);

gameRouter.post(
  '/clear-ranking',
  asyncHandler(async (_req, res) => {
    await gameService.clearCurrentRanking();
    ok(res, { cleared: true }, '已清空本轮排行榜');
  }),
);

gameRouter.get(
  '/current',
  asyncHandler(async (_req, res) => {
    ok(res, gameService.getCurrentRoundDto());
  }),
);

gameRouter.get(
  '/answer',
  asyncHandler(async (_req, res) => {
    ok(res, { answerWord: gameService.getCurrentAnswer() });
  }),
);

gameRouter.get(
  '/last',
  asyncHandler(async (_req, res) => {
    ok(res, gameService.getLastRound());
  }),
);

gameRouter.get(
  '/state',
  asyncHandler(async (_req, res) => {
    ok(res, await gameService.getState());
  }),
);

gameRouter.get(
  '/ranking/current',
  asyncHandler(async (_req, res) => {
    const current = gameService.getCurrentRoundDto();
    ok(res, current ? await rankingService.getRoundRanking(current.id) : []);
  }),
);

gameRouter.get(
  '/ranking/players',
  asyncHandler(async (_req, res) => {
    ok(res, await rankingService.getPlayerRanking());
  }),
);

gameRouter.get(
  '/status',
  asyncHandler(async (_req, res) => {
    const current = gameService.getCurrentRoundDto();
    ok(res, {
      running: current !== null,
      embeddingProvider: embeddingService.providerName,
      remainingSeconds: current?.remainingSeconds ?? 0,
    });
  }),
);
