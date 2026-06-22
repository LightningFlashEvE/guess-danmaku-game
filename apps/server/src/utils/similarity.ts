/**
 * 余弦相似度。两个向量长度不一致时返回 0。
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 字面相似度：基于字符集合的 Jaccard 相似度。
 */
export function literalSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const setA = new Set(a.split(''));
  const setB = new Set(b.split(''));
  let inter = 0;
  for (const ch of setA) {
    if (setB.has(ch)) inter++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

/**
 * 综合相似度：语义 * 0.8 + 字面 * 0.1 + 别名命中 * 0.1
 */
export function combinedSimilarity(params: {
  semantic: number;
  literal: number;
  aliasHit: number;
}): number {
  const { semantic, literal, aliasHit } = params;
  const score = semantic * 0.8 + literal * 0.1 + aliasHit * 0.1;
  return Math.max(0, Math.min(1, score));
}

/**
 * 将 0~1 的相似度转换为展示用百分比字符串，保留一位小数。
 * 0.312 -> "31.2"
 */
export function toDisplaySimilarity(similarity: number): string {
  return (Math.round(similarity * 1000) / 10).toFixed(1);
}
