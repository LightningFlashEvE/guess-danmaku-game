import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { parseWordsCsv } from '../src/modules/words/words.importer.js';
import { embeddingService } from '../src/modules/embedding/embedding.service.js';
import { config as envConfig } from '../src/config.js';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  // 1. 默认配置
  const existingConfig = await prisma.gameConfig.findFirst();
  if (!existingConfig) {
    await prisma.gameConfig.create({
      data: {
        roundDurationSeconds: envConfig.game.defaultRoundDurationSeconds,
        correctThreshold: envConfig.game.correctThreshold,
        topRankLimit: envConfig.game.topRankLimit,
        autoNextRound: true,
        hintEnabled: false,
      },
    });
    console.log('[seed] 已创建默认游戏配置');
  } else {
    await prisma.gameConfig.update({
      where: { id: existingConfig.id },
      data: { autoNextRound: true, hintEnabled: false, roundDurationSeconds: 300 },
    });
  }

  // 2. 导入示例词库
  const csvPath = resolve(__dirname, '../../../data/words.sample.csv');
  const csv = readFileSync(csvPath, 'utf-8');
  const { records, skipped } = parseWordsCsv(csv);
  console.log(`[seed] 解析词条 ${records.length} 条，跳过 ${skipped.length} 条`);

  let imported = 0;
  for (const r of records) {
    const vec = await embeddingService.embed(r.word);
    await prisma.word.upsert({
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
        enabled: r.enabled && r.word.length <= 10 && [...r.word].length === 2,
        embedding: embeddingService.serialize(vec),
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
        enabled: r.enabled && r.word.length <= 10 && [...r.word].length === 2,
        embedding: embeddingService.serialize(vec),
      },
    });
    imported++;
  }
  console.log(`[seed] 已导入/更新 ${imported} 条词条（含 embedding）`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
