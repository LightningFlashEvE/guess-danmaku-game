export interface RuntimeRound {
  id: string;
  wordId: string;
  answerWord: string;
  aliases: string[];
  similarWords: Record<string, number>;
  answerEmbedding: number[] | null;
  category: string;
  subCategory?: string | null;
  difficulty: number;
  hint1?: string | null;
  hint2?: string | null;
  hint3?: string | null;
  durationSeconds: number;
  startedAt: number; // epoch ms
  status: 'running' | 'ended';
  /** 本轮已处理过的 `${playerId}:${guessWord}`，用于同词去重 */
  seenGuesses: Set<string>;
}

export interface StartRoundOptions {
  category?: string;
  difficultyMin?: number;
  difficultyMax?: number;
  durationSeconds?: number;
}

export interface ScoreSettlementRow {
  playerId: string;
  nickname: string;
  scoreAdded: number;
  rank: number;
  isCorrect: boolean;
}
