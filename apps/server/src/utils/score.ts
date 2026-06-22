export const PARTICIPATION_SCORE = 20;
export const RANK_BONUS = [300, 200, 100];
export const CORRECT_BONUS = 500;

export interface SettlementInput {
  playerId: string;
  nickname: string;
  similarity: number;
  isCorrect: boolean;
}

export interface SettlementOutput {
  playerId: string;
  nickname: string;
  scoreAdded: number;
  rank: number;
  isCorrect: boolean;
}

/**
 * 计算一轮的积分结算结果（纯函数，便于测试）。
 * 规则：参与奖 +20；第 1/2/3 名分别 +300/+200/+100；猜中额外 +500。
 * 猜中者优先排在最前，其余按相似度降序。
 */
export function computeSettlement(rows: SettlementInput[]): SettlementOutput[] {
  const sorted = [...rows].sort((a, b) => {
    if (a.isCorrect !== b.isCorrect) return a.isCorrect ? -1 : 1;
    return b.similarity - a.similarity;
  });

  return sorted.map((r, i) => {
    let score = PARTICIPATION_SCORE;
    if (i < RANK_BONUS.length) score += RANK_BONUS[i];
    if (r.isCorrect) score += CORRECT_BONUS;
    return {
      playerId: r.playerId,
      nickname: r.nickname,
      scoreAdded: score,
      rank: i + 1,
      isCorrect: r.isCorrect,
    };
  });
}
