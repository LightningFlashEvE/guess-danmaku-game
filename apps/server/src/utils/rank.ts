export interface RankTier {
  name: string;
  level: number;
  minScore: number;
}

// 段位阈值表，按 minScore 升序排列。
export const RANK_TIERS: RankTier[] = [
  { name: '青铜 I', level: 1, minScore: 0 },
  { name: '青铜 II', level: 2, minScore: 100 },
  { name: '青铜 III', level: 3, minScore: 300 },
  { name: '白银 I', level: 4, minScore: 600 },
  { name: '白银 II', level: 5, minScore: 1000 },
  { name: '白银 III', level: 6, minScore: 1500 },
  { name: '黄金 I', level: 7, minScore: 2200 },
  { name: '黄金 II', level: 8, minScore: 3000 },
  { name: '黄金 III', level: 9, minScore: 4000 },
  { name: '铂金 I', level: 10, minScore: 5500 },
  { name: '钻石 V', level: 11, minScore: 7000 },
  { name: '钻石 IV', level: 12, minScore: 9000 },
  { name: '钻石 III', level: 13, minScore: 12000 },
  { name: '钻石 II', level: 14, minScore: 16000 },
  { name: '钻石 I', level: 15, minScore: 21000 },
  { name: '王者', level: 16, minScore: 30000 },
];

export interface RankResult {
  rankName: string;
  rankLevel: number;
  /** 当前段位内已获得的积分 */
  progressCurrent: number;
  /** 当前段位升到下一段位所需的总积分跨度（王者为 0） */
  progressTotal: number;
}

/**
 * 根据累计积分计算段位与进度。
 */
export function calculateRank(totalScore: number): RankResult {
  const score = Math.max(0, totalScore);

  let current = RANK_TIERS[0];
  let next: RankTier | null = null;

  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (score >= RANK_TIERS[i].minScore) {
      current = RANK_TIERS[i];
      next = RANK_TIERS[i + 1] ?? null;
    } else {
      break;
    }
  }

  if (!next) {
    // 已达最高段位
    return {
      rankName: current.name,
      rankLevel: current.level,
      progressCurrent: 0,
      progressTotal: 0,
    };
  }

  return {
    rankName: current.name,
    rankLevel: current.level,
    progressCurrent: score - current.minScore,
    progressTotal: next.minScore - current.minScore,
  };
}

/**
 * 仅返回段位名称。
 */
export function calculateRankName(totalScore: number): string {
  return calculateRank(totalScore).rankName;
}
