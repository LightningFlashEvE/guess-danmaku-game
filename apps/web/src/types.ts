export type RoundStatus = 'waiting' | 'running' | 'ended';

export interface CurrentRound {
  id: string;
  maskedWord: string;
  wordLength: number;
  category: string;
  subCategory?: string | null;
  difficulty: number;
  hint1?: string | null;
  hint2?: string | null;
  hint3?: string | null;
  status: RoundStatus;
  durationSeconds: number;
  remainingSeconds: number;
  topSimilarity: number;
  topGuessWord?: string;
}

export interface CorrectGuesser {
  nickname: string;
  guessWord: string;
}

export interface LastRound {
  id: string;
  answerWord: string;
  category: string;
  winnerNickname?: string | null;
  correctGuessers?: CorrectGuesser[];
  endedAt?: string | null;
}

export interface RoundGuess {
  id: string;
  playerId: string;
  nickname: string;
  rankName: string;
  guessWord: string;
  similarity: number;
  displaySimilarity: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface PlayerRank {
  playerId: string;
  nickname: string;
  totalScore: number;
  rankName: string;
  rankLevel: number;
  progressCurrent: number;
  progressTotal: number;
}

export interface GameState {
  currentRound: CurrentRound | null;
  lastRound: LastRound | null;
  roundRanking: RoundGuess[];
  playerRanking: PlayerRank[];
  realtimeGuesses: RoundGuess[];
  remainingSeconds: number;
}

export interface GameConfig {
  id: string;
  roundDurationSeconds: number;
  defaultCategory?: string | null;
  autoNextRound: boolean;
  hintEnabled: boolean;
  correctThreshold: number;
  topRankLimit: number;
}

export interface Word {
  id: string;
  word: string;
  category: string;
  subCategory?: string | null;
  aliases?: string | null;
  similarWords?: string | null;
  wrongButCloseWords?: string | null;
  forbiddenWords?: string | null;
  difficulty: number;
  popularity?: number;
  funScore?: number;
  hint1?: string | null;
  hint2?: string | null;
  hint3?: string | null;
  source?: string | null;
  enabled: boolean;
  embedding?: string | null;
  createdAt: string;
  updatedAt: string;
}
