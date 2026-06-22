import type { EmbeddingProvider } from './provider.interface.js';

interface LocalEmbeddingResponse {
  data?: { embedding: number[] }[];
  embedding?: number[];
  embeddings?: number[][];
}

/**
 * 本地推理服务 Provider，POST 到本地部署的 OpenAI 兼容 embedding 接口，
 * 例如本地运行的 bge-small-zh / text2vec-base-chinese（通过 fastapi / ollama 等暴露）。
 * 兼容多种返回结构。
 */
export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'local';

  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
  ) {
    if (!baseUrl) throw new Error('本地 Embedding 服务需要配置 EMBEDDING_BASE_URL');
  }

  async embed(text: string): Promise<number[]> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/embeddings`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, input: text }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`本地 Embedding 请求失败 (${res.status}): ${detail}`);
    }

    const json = (await res.json()) as LocalEmbeddingResponse;
    const embedding = json.data?.[0]?.embedding ?? json.embedding ?? json.embeddings?.[0];
    if (!embedding) throw new Error('本地 Embedding 返回数据格式异常');
    return embedding;
  }
}
