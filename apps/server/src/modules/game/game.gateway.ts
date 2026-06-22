import type { Server } from 'socket.io';
import type {
  GameStateDto,
  PlayerRankDto,
  RoundGuessDto,
} from '../../types.js';

/**
 * Socket.IO 网关：统一封装所有对前端的推送事件。
 */
export class GameGateway {
  private io: Server | null = null;

  setServer(io: Server): void {
    this.io = io;
  }

  broadcastState(state: GameStateDto): void {
    this.io?.emit('game:state', state);
  }

  roundStarted(current: GameStateDto['currentRound']): void {
    this.io?.emit('game:roundStarted', current);
  }

  roundEnded(result: unknown): void {
    this.io?.emit('game:roundEnded', result);
  }

  guessAdded(guess: RoundGuessDto): void {
    this.io?.emit('game:guessAdded', guess);
  }

  rankingUpdated(ranking: RoundGuessDto[]): void {
    this.io?.emit('game:rankingUpdated', ranking);
  }

  playerRankingUpdated(ranking: PlayerRankDto[]): void {
    this.io?.emit('game:playerRankingUpdated', ranking);
  }

  timer(remainingSeconds: number): void {
    this.io?.emit('game:timer', { remainingSeconds });
  }
}

export const gameGateway = new GameGateway();
