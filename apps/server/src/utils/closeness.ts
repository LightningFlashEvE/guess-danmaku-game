/**
 * 解析 similarWords 字段，支持两种格式：
 *   格式一： "松树|榕树|柏树|杨树"           -> 每个默认 70 分
 *   格式二： {"松树":68,"榕树":78}            -> 使用人工配置分数
 */
export function parseSimilarWords(raw: string | null | undefined): Record<string, number> {
  if (!raw) return {};
  const text = raw.trim();
  if (!text) return {};

  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text) as Record<string, unknown>;
      const result: Record<string, number> = {};
      for (const [k, v] of Object.entries(obj)) {
        const word = k.trim();
        if (!word) continue;
        const n = Number(v);
        result[word] = Number.isFinite(n) ? clamp(n, 0, 100) : 70;
      }
      return result;
    } catch {
      // 解析失败回退到 | 分隔
    }
  }

  // | 分隔，支持可选分数： "松树:68|榕树|柏树:66"，无分数默认 70
  const result: Record<string, number> = {};
  for (const token of text.split('|')) {
    const t = token.trim();
    if (!t) continue;
    const idx = t.lastIndexOf(':');
    if (idx > 0) {
      const word = t.slice(0, idx).trim();
      const score = Number(t.slice(idx + 1).trim());
      if (word) result[word] = Number.isFinite(score) ? clamp(score, 0, 100) : 70;
    } else {
      result[t] = 70;
    }
  }
  return result;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function lerp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/**
 * 将原始 embedding 余弦相似度（0~1）归一化为 0~95 的接近度分数。
 * 目的：避免无关词轻易超过 50%，只有命中答案/别名才可接近 100。
 *
 * 阈值按 bge-m3（中文）实测分布标定：无关词余弦约 0.40~0.50，
 * 相关词约 0.57~0.74。因此把「地板」放在 0.40 附近，重点拉伸 0.50~0.80 区间。
 * 若更换其他模型，可据其余弦分布调整下列分段。
 */
export function normalizeEmbeddingScore(raw: number): number {
  const r = clamp(raw, 0, 1);
  let s: number;
  if (r < 0.4) s = lerp(r, 0.3, 0.4, 0, 8);
  else if (r < 0.5) s = lerp(r, 0.4, 0.5, 8, 18);
  else if (r < 0.6) s = lerp(r, 0.5, 0.6, 18, 40);
  else if (r < 0.7) s = lerp(r, 0.6, 0.7, 40, 65);
  else if (r < 0.8) s = lerp(r, 0.7, 0.8, 65, 86);
  else s = lerp(r, 0.8, 1.0, 86, 95);
  return clamp(s, 0, 95);
}

export interface CalculateDisplaySimilarityParams {
  answerWord: string;
  guessWord: string;
  aliases: string[];
  similarWords: Record<string, number>;
  /** 原始 embedding 余弦相似度（0~1） */
  embeddingScore: number;
}

/**
 * 直播游戏接近度算法（猜盐风格）。返回 0~100，保留 1 位小数。
 *
 * 规则（取最大值，而非加权平均，直播效果优先）：
 *   1. 完全等于答案 -> 100
 *   2. 命中别名      -> 98
 *   3. 命中人工相似词 -> 人工配置分数
 *   4. 其他          -> normalizeEmbeddingScore
 *   最终接近度 = max(答案命中分, 别名命中分, 人工相似词分, embedding 分)
 */
export function calculateDisplaySimilarity(params: CalculateDisplaySimilarityParams): number {
  const { answerWord, guessWord, aliases, similarWords, embeddingScore } = params;

  const answerScore = guessWord === answerWord ? 100 : 0;
  const aliasScore = aliases.includes(guessWord) ? 98 : 0;
  const manualScore = guessWord in similarWords ? clamp(similarWords[guessWord], 0, 100) : 0;
  const embScore = normalizeEmbeddingScore(embeddingScore);

  const final = Math.max(answerScore, aliasScore, manualScore, embScore);
  return Math.round(clamp(final, 0, 100) * 10) / 10;
}
