import 'dotenv/config';

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && value !== undefined && value !== '' ? n : fallback;
}

export const config = {
  serverPort: num(process.env.SERVER_PORT, 3001),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  embedding: {
    provider: (process.env.EMBEDDING_PROVIDER || 'mock').toLowerCase(),
    baseUrl: process.env.EMBEDDING_BASE_URL || '',
    apiKey: process.env.EMBEDDING_API_KEY || '',
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  game: {
    defaultRoundDurationSeconds: num(process.env.DEFAULT_ROUND_DURATION_SECONDS, 300),
    correctThreshold: num(process.env.CORRECT_THRESHOLD, 0.98),
    topRankLimit: num(process.env.TOP_RANK_LIMIT, 15),
  },
  // 抖音等外部采集程序调用 ingest/gift 接口所需的鉴权 token
  ingestToken: process.env.INGEST_TOKEN || 'dev-token',
  interRoundDelaySeconds: num(process.env.INTER_ROUND_DELAY_SECONDS, 6),
  rateLimit: {
    userPerSecond: num(process.env.RATE_USER_PER_SECOND, 1),
    userPer10Seconds: num(process.env.RATE_USER_PER_10S, 5),
    duplicateWindowMs: num(process.env.RATE_DUPLICATE_WINDOW_MS, 3000),
    globalPerSecond: num(process.env.RATE_GLOBAL_PER_SECOND, 200),
  },
};

export type AppConfig = typeof config;
