import { describe, it, expect } from 'vitest';
import { computeSettlement } from '../src/utils/score.js';

describe('computeSettlement 积分结算', () => {
  it('猜中者排第一并获得猜中+第一名+参与奖', () => {
    const result = computeSettlement([
      { playerId: 'a', nickname: 'A', similarity: 0.4, isCorrect: false },
      { playerId: 'b', nickname: 'B', similarity: 1, isCorrect: true },
      { playerId: 'c', nickname: 'C', similarity: 0.6, isCorrect: false },
    ]);
    expect(result[0].playerId).toBe('b');
    expect(result[0].scoreAdded).toBe(20 + 300 + 500); // 820
    expect(result[0].rank).toBe(1);
  });

  it('无人猜中时按相似度排名分配奖励', () => {
    const result = computeSettlement([
      { playerId: 'a', nickname: 'A', similarity: 0.3, isCorrect: false },
      { playerId: 'b', nickname: 'B', similarity: 0.7, isCorrect: false },
      { playerId: 'c', nickname: 'C', similarity: 0.5, isCorrect: false },
      { playerId: 'd', nickname: 'D', similarity: 0.1, isCorrect: false },
    ]);
    expect(result.map((r) => r.playerId)).toEqual(['b', 'c', 'a', 'd']);
    expect(result[0].scoreAdded).toBe(320); // 第一名 300 + 20
    expect(result[1].scoreAdded).toBe(220); // 第二名 200 + 20
    expect(result[2].scoreAdded).toBe(120); // 第三名 100 + 20
    expect(result[3].scoreAdded).toBe(20); // 参与奖
  });

  it('空输入返回空', () => {
    expect(computeSettlement([])).toEqual([]);
  });
});
