/**
 * 抖音手机直播竖屏版面常量（9:16）。
 * 只服务一个手机直播尺寸，优先保证题目卡、当前排行和总积分榜都能在一屏内读清。
 */
export const OBS_LAYOUT = {
  /** 画布基准宽度（OBS 浏览器源建议 1080） */
  width: 1080,
  /** 画布基准高度（OBS 浏览器源建议 1920） */
  height: 1920,
  /** 本轮相似度排行：最多展示 8 张小卡片 */
  roundRankingLimit: 8,
  /** 积分排行：固定展示前 5 名 */
  playerRankingLimit: 5,
} as const;
