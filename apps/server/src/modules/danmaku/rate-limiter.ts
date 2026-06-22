import { config } from '../../config.js';

interface UserState {
  times: number[]; // 最近处理时间戳（最多保留 10s）
  lastContent?: string;
  lastContentAt?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

/**
 * 基础弹幕限流防刷：
 *   - 同一用户每 1 秒最多 1 条
 *   - 同一用户每 10 秒最多 5 条
 *   - 同一用户 N 秒内重复内容只处理一次
 *   - 全局每秒最多 200 条
 * 礼物消息不走此限流（优先级更高）。
 */
export class RateLimiter {
  private users = new Map<string, UserState>();
  private globalTimes: number[] = [];

  check(userKey: string, content: string, now = Date.now()): RateLimitResult {
    const { userPerSecond, userPer10Seconds, duplicateWindowMs, globalPerSecond } = config.rateLimit;

    // 全局每秒
    this.globalTimes = this.globalTimes.filter((t) => now - t < 1000);
    if (this.globalTimes.length >= globalPerSecond) {
      return { allowed: false, reason: '全局弹幕过载，已丢弃' };
    }

    const state = this.users.get(userKey) ?? { times: [] };
    state.times = state.times.filter((t) => now - t < 10000);

    // 重复内容
    if (state.lastContent === content && state.lastContentAt !== undefined && now - state.lastContentAt < duplicateWindowMs) {
      this.users.set(userKey, state);
      return { allowed: false, reason: '重复内容，已忽略' };
    }

    // 每秒
    if (state.times.filter((t) => now - t < 1000).length >= userPerSecond) {
      this.users.set(userKey, state);
      return { allowed: false, reason: '操作过快，请稍后' };
    }

    // 每 10 秒
    if (state.times.length >= userPer10Seconds) {
      this.users.set(userKey, state);
      return { allowed: false, reason: '操作过于频繁' };
    }

    // 通过：登记
    state.times.push(now);
    state.lastContent = content;
    state.lastContentAt = now;
    this.globalTimes.push(now);
    this.users.set(userKey, state);
    return { allowed: true };
  }
}

export const rateLimiter = new RateLimiter();
