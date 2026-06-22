import type { DanmakuMessage } from '../../../types.js';
import type { DanmakuAdapter } from './adapter.interface.js';

/**
 * 调试弹幕适配器：用于没有真实直播间时通过 HTTP / 页面注入弹幕。
 */
export class DebugDanmakuAdapter implements DanmakuAdapter {
  readonly platform = 'debug';
  private callback: ((message: DanmakuMessage) => void) | null = null;

  async connect(): Promise<void> {
    // 调试适配器无需真实连接
  }

  async disconnect(): Promise<void> {
    this.callback = null;
  }

  onMessage(callback: (message: DanmakuMessage) => void): void {
    this.callback = callback;
  }

  /** 手动注入一条调试弹幕 */
  inject(message: DanmakuMessage): void {
    this.callback?.(message);
  }
}
