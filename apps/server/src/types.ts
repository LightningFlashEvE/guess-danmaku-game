export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type RoundStatus = 'waiting' | 'running' | 'ended';

export interface DanmakuMessage {
  platform: 'debug' | 'bilibili' | 'douyin' | 'kuaishou';
  platformUid: string;
  nickname: string;
  avatar?: string;
  content: string;
  giftName?: string;
  giftValue?: number;
  timestamp: number;
}

export interface CurrentRoundDto {
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

export interface CorrectGuesserDto {
  nickname: string;
  guessWord: string;
}

export interface LastRoundDto {
  id: string;
  answerWord: string;
  category: string;
  winnerNickname?: string | null;
  correctGuessers: CorrectGuesserDto[];
  endedAt?: string | null;
}

export interface RoundGuessDto {
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

export interface PlayerRankDto {
  playerId: string;
  nickname: string;
  totalScore: number;
  rankName: string;
  rankLevel: number;
  progressCurrent: number;
  progressTotal: number;
}

export interface GameStateDto {
  currentRound: CurrentRoundDto | null;
  lastRound: LastRoundDto | null;
  roundRanking: RoundGuessDto[];
  playerRanking: PlayerRankDto[];
  realtimeGuesses: RoundGuessDto[];
  remainingSeconds: number;
}
