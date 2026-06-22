import { describe, it, expect } from 'vitest';
import { calculateRank, calculateRankName } from '../src/utils/rank.js';

describe('calculateRankName', () => {
  it('0 分为青铜 I', () => {
    expect(calculateRankName(0)).toBe('青铜 I');
  });
  it('150 分为青铜 II', () => {
    expect(calculateRankName(150)).toBe('青铜 II');
  });
  it('30000 分为王者', () => {
    expect(calculateRankName(30000)).toBe('王者');
  });
  it('超过最高阈值仍为王者', () => {
    expect(calculateRankName(99999)).toBe('王者');
  });
  it('负分按 0 处理', () => {
    expect(calculateRankName(-50)).toBe('青铜 I');
  });
});

describe('calculateRank 进度', () => {
  it('青铜 II（150）进度为 50/200', () => {
    const r = calculateRank(150);
    expect(r.rankName).toBe('青铜 II');
    expect(r.progressCurrent).toBe(50);
    expect(r.progressTotal).toBe(200); // 300 - 100
  });
  it('王者进度为 0', () => {
    const r = calculateRank(30000);
    expect(r.progressTotal).toBe(0);
  });
});
