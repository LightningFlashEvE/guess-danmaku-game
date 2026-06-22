import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { fail } from './utils/http.js';
import { gameRouter } from './modules/game/game.controller.js';
import { danmakuRouter } from './modules/danmaku/danmaku.controller.js';
import { wordsRouter } from './modules/words/words.controller.js';
import { playersRouter } from './modules/players/players.controller.js';
import { configRouter } from './modules/config/config.controller.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

  app.use('/api/game', gameRouter);
  app.use('/api/danmaku', danmakuRouter);
  app.use('/api/words', wordsRouter);
  app.use('/api/players', playersRouter);
  app.use('/api/config', configRouter);

  // 404
  app.use((req, res) => fail(res, `未找到路由: ${req.method} ${req.path}`, 404));

  // 统一错误处理
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
    fail(res, err.message || '服务器内部错误', 500);
  });

  return app;
}
