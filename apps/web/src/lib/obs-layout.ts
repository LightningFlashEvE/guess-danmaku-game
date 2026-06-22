/**
 * 抖音手机直播竖屏版面常量（9:16）。
 * 只服务一个手机直播尺寸，优先保证题目卡、当前排行和实时弹幕都能在一屏内读清。
 */
export const OBS_LAYOUT = {
  /** 画布基准宽度（OBS 浏览器源建议 1080） */
  width: 1080,
  /** 画布基准高度（OBS 浏览器源建议 1920） */
  height: 1920,
  /** 本轮相似度排行：手机屏保留前 6 名 */
  roundRankingLimit: 6,
  /** 积分排行：次要信息，3 行即可 */
  playerRankingLimit: 3,
  /** 实时猜词：固定高度区域，最多 4 条 */
  realtimeLimit: 4,
} as const;
