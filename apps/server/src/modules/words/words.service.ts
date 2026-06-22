import type { Prisma, Word } from '@prisma/client';
import { prisma } from '../../prisma.js';
import { embeddingService } from '../embedding/embedding.service.js';
import { parseWordsCsv } from './words.importer.js';

export interface WordListFilter {
  category?: string;
  difficultyMin?: number;
  difficultyMax?: number;
  enabled?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export class WordsService {
  async list(filter: WordListFilter): Promise<{ items: Word[]; total: number }> {
    const where: Prisma.WordWhereInput = {};
    if (filter.category) where.category = filter.category;
    if (filter.enabled !== undefined) where.enabled = filter.enabled;
    if (filter.difficultyMin !== undefined || filter.difficultyMax !== undefined) {
      where.difficulty = {};
      if (filter.difficultyMin !== undefined) where.difficulty.gte = filter.difficultyMin;
      if (filter.difficultyMax !== undefined) where.difficulty.lte = filter.difficultyMax;
    }
    if (filter.search) {
      where.OR = [
        { word: { contains: filter.search } },
        { aliases: { contains: filter.search } },
      ];
    }

    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 50;

    const [items, total] = await Promise.all([
      prisma.word.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.word.count({ where }),
    ]);
    return { items, total };
  }

  async categories(): Promise<string[]> {
    const rows = await prisma.word.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category);
  }

  async create(data: Prisma.WordCreateInput): Promise<Word> {
    return prisma.word.create({ data });
  }

  async update(id: string, data: Prisma.WordUpdateInput): Promise<Word> {
    return prisma.word.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await prisma.word.delete({ where: { id } });
  }

  async toggle(id: string, enabled: boolean): Promise<Word> {
    return prisma.word.update({ where: { id }, data: { enabled } });
  }

  /**
   * 为单个词生成 embedding 并存储。
   */
  async generateEmbedding(id: string): Promise<Word> {
    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) throw new Error('词条不存在');
    const vec = await embeddingService.embed(word.word);
    return prisma.word.update({
      where: { id },
      data: { embedding: embeddingService.serialize(vec) },
    });
  }

  /**
   * 批量为缺少 embedding 的词生成向量。
   */
  async batchGenerateEmbedding(onlyMissing = true): Promise<{ processed: number; failed: number }> {
    const words = await prisma.word.findMany({
      where: onlyMissing ? { embedding: null } : {},
    });
    let processed = 0;
    let failed = 0;
    for (const w of words) {
      try {
        const vec = await embeddingService.embed(w.word);
        await prisma.word.update({
          where: { id: w.id },
          data: { embedding: embeddingService.serialize(vec) },
        });
        processed++;
      } catch {
        failed++;
      }
    }
    return { processed, failed };
  }

  /**
   * 导入 CSV 文本（upsert：相同 word+category 则更新）。
   */
  async importCsv(csv: string, autoEmbedding = true): Promise<{
    imported: number;
    skipped: number;
    skippedDetail: { line: number; reason: string }[];
  }> {
    const { records, skipped } = parseWordsCsv(csv);
    let imported = 0;

    for (const r of records) {
      const word = await prisma.word.upsert({
        where: { word_category: { word: r.word, category: r.category } },
        update: {
          subCategory: r.subCategory,
          aliases: r.aliases,
          similarWords: r.similarWords,
          wrongButCloseWords: r.wrongButCloseWords,
          forbiddenWords: r.forbiddenWords,
          difficulty: r.difficulty,
          popularity: r.popularity,
          funScore: r.funScore,
          hint1: r.hint1,
          hint2: r.hint2,
          hint3: r.hint3,
          source: r.source,
          enabled: r.enabled,
        },
        create: {
          word: r.word,
          category: r.category,
          subCategory: r.subCategory,
          aliases: r.aliases,
          similarWords: r.similarWords,
          wrongButCloseWords: r.wrongButCloseWords,
          forbiddenWords: r.forbiddenWords,
          difficulty: r.difficulty,
          popularity: r.popularity,
          funScore: r.funScore,
          hint1: r.hint1,
          hint2: r.hint2,
          hint3: r.hint3,
          source: r.source,
          enabled: r.enabled,
        },
      });
      imported++;

      if (autoEmbedding && !word.embedding) {
        try {
          const vec = await embeddingService.embed(word.word);
          await prisma.word.update({
            where: { id: word.id },
            data: { embedding: embeddingService.serialize(vec) },
          });
        } catch {
          // 忽略单条 embedding 失败，不影响导入
        }
      }
    }

    return {
      imported,
      skipped: skipped.length,
      skippedDetail: skipped.map((s) => ({ line: s.line, reason: s.reason })),
    };
  }

  /**
   * 导出全部词条为 CSV 文本。
   */
  async exportCsv(): Promise<string> {
    const words = await prisma.word.findMany({ orderBy: { category: 'asc' } });
    const header =
      'word,category,subCategory,aliases,similarWords,wrongButCloseWords,forbiddenWords,difficulty,popularity,funScore,hint1,hint2,hint3,source,enabled';
    const esc = (v: string | null | undefined) => {
      const s = v ?? '';
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = words.map((w) =>
      [
        esc(w.word),
        esc(w.category),
        esc(w.subCategory),
        esc(w.aliases),
        esc(w.similarWords),
        esc(w.wrongButCloseWords),
        esc(w.forbiddenWords),
        String(w.difficulty),
        String(w.popularity),
        String(w.funScore),
        esc(w.hint1),
        esc(w.hint2),
        esc(w.hint3),
        esc(w.source),
        String(w.enabled),
      ].join(','),
    );
    return [header, ...lines].join('\n');
  }
}

export const wordsService = new WordsService();
