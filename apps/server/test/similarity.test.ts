import { describe, it, expect } from 'vitest';
import {
  cosineSimilarity,
  literalSimilarity,
  combinedSimilarity,
  toDisplaySimilarity,
} from '../src/utils/similarity.js';

describe('cosineSimilarity', () => {
  it('相同向量相似度为 1', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it('正交向量相似度为 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('反向向量相似度为 -1', () => {
    expect(cosineSimilarity([1, 1], [-1, -1])).toBeCloseTo(-1);
  });

  it('长度不一致返回 0', () => {
    expect(cosineSimilarity([1, 2], [1])).toBe(0);
  });

  it('零向量返回 0', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

describe('literalSimilarity', () => {
  it('完全相同为 1', () => {
    expect(literalSimilarity('柳树', '柳树')).toBe(1);
  });
  it('共享字符有部分相似度', () => {
    expect(literalSimilarity('松树', '柳树')).toBeGreaterThan(0);
  });
  it('无共享字符为 0', () => {
    expect(literalSimilarity('猫', '狗')).toBe(0);
  });
});

describe('combinedSimilarity', () => {
  it('按权重组合且夹在 0~1', () => {
    const s = combinedSimilarity({ semantic: 1, literal: 1, aliasHit: 1 });
    expect(s).toBeCloseTo(1);
  });
  it('负数被夹到 0', () => {
    const s = combinedSimilarity({ semantic: -5, literal: 0, aliasHit: 0 });
    expect(s).toBe(0);
  });
});

describe('toDisplaySimilarity', () => {
  it('0.312 -> 31.2', () => {
    expect(toDisplaySimilarity(0.312)).toBe('31.2');
  });
});
