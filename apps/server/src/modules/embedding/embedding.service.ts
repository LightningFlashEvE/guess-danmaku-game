import { config } from '../../config.js';
import { cosineSimilarity } from '../../utils/similarity.js';
import type { EmbeddingProvider } from './providers/provider.interface.js';
import { MockEmbeddingProvider } from './providers/mock.provider.js';
import { OpenAICompatibleEmbeddingProvider } from './providers/openai.provider.js';
import { LocalEmbeddingProvider } from './providers/local.provider.js';

function createProvider(): EmbeddingProvider {
  const { provider, baseUrl, apiKey, model } = config.embedding;
  switch (provider) {
    case 'openai':
      return new OpenAICompatibleEmbeddingProvider(baseUrl, apiKey, model);
    case 'local':
      return new LocalEmbeddingProvider(baseUrl, model);
    case 'mock':
    default:
      return new MockEmbeddingProvider();
  }
}

export class EmbeddingService {
  private provider: EmbeddingProvider;
  private cache = new Map<string, number[]>();

  constructor() {
    this.provider = createProvider();
    // eslint-disable-next-line no-console
    console.log(`[embedding] 使用 Provider: ${this.provider.name}`);
  }

  get providerName(): string {
    return this.provider.name;
  }

  async embed(text: string): Promise<number[]> {
    const cached = this.cache.get(text);
    if (cached) return cached;
    const vec = await this.provider.embed(text);
    this.cache.set(text, vec);
    return vec;
  }

  /**
   * 计算两段文本的语义余弦相似度。
   */
  async similarity(a: string, b: string): Promise<number> {
    const [va, vb] = await Promise.all([this.embed(a), this.embed(b)]);
    return cosineSimilarity(va, vb);
  }

  serialize(vec: number[]): string {
    return JSON.stringify(vec);
  }

  deserialize(raw: string | null | undefined): number[] | null {
    if (!raw) return null;
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch {
      return null;
    }
  }
}

export const embeddingService = new EmbeddingService();
