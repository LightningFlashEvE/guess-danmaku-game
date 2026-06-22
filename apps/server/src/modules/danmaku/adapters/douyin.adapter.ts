import type { DanmakuMessage } from '../../../types.js';
import type { DanmakuAdapter } from './adapter.interface.js';

/**
 * 抖音弹幕适配器（占位）。后续接入真实弹幕协议。
 */
export class DouyinDanmakuAdapter implements DanmakuAdapter {
  readonly platform = 'douyin';
  private callback: ((message: DanmakuMessage) => void) | null = null;

  async connect(_roomId: string): Promise<void> {
    throw new Error('DouyinDanmakuAdapter 尚未实现，属于后续扩展功能');
  }

  async disconnect(): Promise<void> {
    this.callback = null;
  }

  onMessage(callback: (message: DanmakuMessage) => void): void {
    this.callback = callback;
  }
}
