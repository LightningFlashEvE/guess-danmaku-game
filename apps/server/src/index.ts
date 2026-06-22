import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { createApp } from './app.js';
import { gameGateway } from './modules/game/game.gateway.js';
import { gameService } from './modules/game/game.service.js';

async function bootstrap() {
  const app = createApp();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
      credentials: true,
    },
  });

  gameGateway.setServer(io);

  io.on('connection', async (socket) => {
    // 新连接立即同步当前完整状态
    try {
      socket.emit('game:state', await gameService.getState());
    } catch {
      // 忽略
    }
  });

  httpServer.listen(config.serverPort, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] HTTP + WebSocket 已启动: http://localhost:${config.serverPort}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('启动失败', err);
  process.exit(1);
});
