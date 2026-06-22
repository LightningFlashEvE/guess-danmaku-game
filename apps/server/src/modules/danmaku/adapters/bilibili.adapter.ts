import type { DanmakuMessage } from '../../../types.js';
import type { DanmakuAdapter } from './adapter.interface.js';

/**
 * B站弹幕适配器（占位）。后续接入真实弹幕长连接协议。
 */
export class BilibiliDanmakuAdapter implements DanmakuAdapter {
  readonly platform = 'bilibili';
  private callback: ((message: DanmakuMessage) => void) | null = null;

  async connect(_roomId: string): Promise<void> {
    throw new Error('BilibiliDanmakuAdapter 尚未实现，属于后续扩展功能');
  }

  async disconnect(): Promise<void> {
    this.callback = null;
  }

  onMessage(callback: (message: DanmakuMessage) => void): void {
    this.callback = callback;
  }
}
