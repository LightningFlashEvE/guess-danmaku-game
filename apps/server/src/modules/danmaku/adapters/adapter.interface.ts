import type { DanmakuMessage } from '../../../types.js';

export interface DanmakuAdapter {
  readonly platform: string;
  connect(roomId: string): Promise<void>;
  disconnect(): Promise<void>;
  onMessage(callback: (message: DanmakuMessage) => void): void;
}
