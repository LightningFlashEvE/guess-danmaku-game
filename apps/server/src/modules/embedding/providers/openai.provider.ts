import type { EmbeddingProvider } from './provider.interface.js';

interface OpenAIEmbeddingResponse {
  data: { embedding: number[] }[];
}

/**
 * 兼容 OpenAI /v1/embeddings 接口的 Provider。
 * 同样适用于 DeepSeek、通义、智谱等兼容 OpenAI 格式的服务。
 */
export class OpenAICompatibleEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai';

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly model: string,
  ) {
    if (!baseUrl) throw new Error('EMBEDDING_BASE_URL 未配置');
    if (!apiKey) throw new Error('EMBEDDING_API_KEY 未配置');
  }

  async embed(text: string): Promise<number[]> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/embeddings`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: text }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Embedding API 请求失败 (${res.status}): ${detail}`);
    }

    const json = (await res.json()) as OpenAIEmbeddingResponse;
    const embedding = json.data?.[0]?.embedding;
    if (!embedding) throw new Error('Embedding API 返回数据格式异常');
    return embedding;
  }
}
