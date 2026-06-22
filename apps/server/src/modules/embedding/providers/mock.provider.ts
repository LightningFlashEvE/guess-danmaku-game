import type { EmbeddingProvider } from './provider.interface.js';

/**
 * 离线确定性 Embedding：基于字符分桶生成向量。
 * 共享相同汉字的词会得到更高的余弦相似度，便于在无 API Key 时跑通并演示游戏。
 * 注意：这并非真正的语义模型，仅用于本地联调与 MVP 演示。
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'mock';
  private readonly dim = 128;

  async embed(text: string): Promise<number[]> {
    const vec = new Array<number>(this.dim).fill(0);
    const chars = Array.from(text);

    for (const ch of chars) {
      const code = ch.codePointAt(0) ?? 0;
      // 每个字符散列到多个维度，构造稳定的稀疏向量
      for (let k = 0; k < 4; k++) {
        const idx = (code * 31 + k * 2654435761) % this.dim;
        const sign = (code >> k) & 1 ? 1 : -1;
        vec[Math.abs(idx)] += sign * (1 + (code % 7) / 10);
      }
    }

    // L2 归一化
    let norm = 0;
    for (const v of vec) norm += v * v;
    norm = Math.sqrt(norm) || 1;
    return vec.map((v) => v / norm);
  }
}
