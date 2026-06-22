import { create } from 'zustand';
import { getSocket } from '../lib/socket';
import { api } from '../lib/api';
import type {
  CurrentRound,
  GameState,
  LastRound,
  PlayerRank,
  RoundGuess,
} from '../types';

interface GameStore extends GameState {
  connected: boolean;
  recentGuesses: RoundGuess[];
  initialized: boolean;
  connect: () => void;
  refresh: () => Promise<void>;
}

const MAX_RECENT = 40;

export const useGameStore = create<GameStore>((set, get) => ({
  currentRound: null,
  lastRound: null,
  roundRanking: [],
  playerRanking: [],
  realtimeGuesses: [],
  remainingSeconds: 0,
  recentGuesses: [],
  connected: false,
  initialized: false,

  connect: () => {
    if (get().initialized) return;
    set({ initialized: true });

    const socket = getSocket();

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('game:state', (state: GameState) => {
      set({
        currentRound: state.currentRound,
        lastRound: state.lastRound,
        roundRanking: state.roundRanking,
        playerRanking: state.playerRanking,
        remainingSeconds: state.remainingSeconds,
      });
    });

    socket.on('game:roundStarted', (round: CurrentRound) => {
      set({ currentRound: round, roundRanking: [], recentGuesses: [], remainingSeconds: round.remainingSeconds });
    });

    socket.on(
      'game:roundEnded',
      (result: {
        answerWord: string;
        category?: string;
        winnerNickname?: string | null;
        correctGuessers?: { nickname: string; guessWord: string }[];
      }) => {
        const last: LastRound = {
          id: 'last',
          answerWord: result.answerWord,
          category: result.category ?? '',
          winnerNickname: result.winnerNickname ?? null,
          correctGuessers: result.correctGuessers ?? [],
          endedAt: new Date().toISOString(),
        };
        set({ currentRound: null, lastRound: last, roundRanking: [], remainingSeconds: 0 });
      },
    );

    socket.on('game:guessAdded', (guess: RoundGuess) => {
      const list = [guess, ...get().recentGuesses].slice(0, MAX_RECENT);
      set({ recentGuesses: list });
    });

    socket.on('game:rankingUpdated', (ranking: RoundGuess[]) => {
      set({ roundRanking: ranking });
    });

    socket.on('game:playerRankingUpdated', (ranking: PlayerRank[]) => {
      set({ playerRanking: ranking });
    });

    socket.on('game:timer', ({ remainingSeconds }: { remainingSeconds: number }) => {
      const cur = get().currentRound;
      set({
        remainingSeconds,
        currentRound: cur ? { ...cur, remainingSeconds } : cur,
      });
    });
  },

  refresh: async () => {
    try {
      const state = await api.get<GameState>('/game/state');
      set({
        currentRound: state.currentRound,
        lastRound: state.lastRound,
        roundRanking: state.roundRanking,
        playerRanking: state.playerRanking,
        remainingSeconds: state.remainingSeconds,
      });
    } catch {
      // 忽略
    }
  },
}));
