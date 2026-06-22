import { describe, it, expect } from 'vitest';
import {
  parseSimilarWords,
  normalizeEmbeddingScore,
  calculateDisplaySimilarity,
} from '../src/utils/closeness.js';

describe('parseSimilarWords', () => {
  it('| 分隔默认 70 分', () => {
    expect(parseSimilarWords('松树|榕树')).toEqual({ 松树: 70, 榕树: 70 });
  });
  it('| 分隔支持可选分数', () => {
    expect(parseSimilarWords('松树:68|榕树')).toEqual({ 松树: 68, 榕树: 70 });
  });
  it('JSON 格式', () => {
    expect(parseSimilarWords('{"松树":68,"榕树":78}')).toEqual({ 松树: 68, 榕树: 78 });
  });
  it('空值返回空对象', () => {
    expect(parseSimilarWords(null)).toEqual({});
  });
});

describe('normalizeEmbeddingScore (bge-m3 标定)', () => {
  it('无关词余弦(0.45)被压低 <=20', () => {
    expect(normalizeEmbeddingScore(0.45)).toBeLessThanOrEqual(20);
  });
  it('极低相似度接近 0', () => {
    expect(normalizeEmbeddingScore(0.2)).toBeLessThanOrEqual(5);
  });
  it('强相关(0.74)落在较高区间 >60', () => {
    expect(normalizeEmbeddingScore(0.74)).toBeGreaterThan(60);
  });
  it('高相似度封顶 95', () => {
    expect(normalizeEmbeddingScore(1)).toBeLessThanOrEqual(95);
    expect(normalizeEmbeddingScore(1)).toBeGreaterThanOrEqual(85);
  });
  it('单调不减', () => {
    expect(normalizeEmbeddingScore(0.7)).toBeGreaterThan(normalizeEmbeddingScore(0.5));
  });
});

describe('calculateDisplaySimilarity', () => {
  const base = { aliases: ['垂柳'], similarWords: { 松树: 72 }, embeddingScore: 0.9 };

  it('完全命中答案为 100', () => {
    expect(
      calculateDisplaySimilarity({ answerWord: '柳树', guessWord: '柳树', ...base }),
    ).toBe(100);
  });
  it('命中别名为 98', () => {
    expect(
      calculateDisplaySimilarity({ answerWord: '柳树', guessWord: '垂柳', aliases: ['垂柳'], similarWords: {}, embeddingScore: 0 }),
    ).toBe(98);
  });
  it('命中人工相似词取较高者（max 规则）', () => {
    const r = calculateDisplaySimilarity({ answerWord: '柳树', guessWord: '松树', aliases: [], similarWords: { 松树: 72 }, embeddingScore: 0.1 });
    expect(r).toBe(72);
  });
  it('无命中走归一化 embedding', () => {
    const r = calculateDisplaySimilarity({ answerWord: '柳树', guessWord: '汽车', aliases: [], similarWords: {}, embeddingScore: 0.2 });
    expect(r).toBeLessThanOrEqual(15);
  });
  it('保留 1 位小数且 0~100', () => {
    const r = calculateDisplaySimilarity({ answerWord: '柳树', guessWord: '某词', aliases: [], similarWords: {}, embeddingScore: 0.55 });
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(100);
    expect(Math.round(r * 10) / 10).toBe(r);
  });
});
