export interface EmbeddingProvider {
  readonly name: string;
  embed(text: string): Promise<number[]>;
}
