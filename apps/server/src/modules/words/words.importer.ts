export interface WordCsvRecord {
  word: string;
  category: string;
  subCategory?: string;
  aliases?: string;
  similarWords?: string;
  wrongButCloseWords?: string;
  forbiddenWords?: string;
  difficulty: number;
  popularity: number;
  funScore: number;
  hint1?: string;
  hint2?: string;
  hint3?: string;
  source?: string;
  enabled: boolean;
}

const SENSITIVE = ['敏感词', '法轮'];

/**
 * 解析单行 CSV，支持双引号包裹与转义。
 */
function parseLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

/**
 * 繁体转简体（最常见字的小映射，MVP 用）。
 */
const T2S: Record<string, string> = {
  樹: '树',
  楊: '杨',
  鳥: '鸟',
  貓: '猫',
  狗: '狗',
  龍: '龙',
  愛: '爱',
  鏡: '镜',
  傘: '伞',
  畫: '画',
};

function toSimplified(text: string): string {
  return text.replace(/./g, (ch) => T2S[ch] ?? ch);
}

/**
 * 清洗单个词条文本。
 */
function cleanWord(raw: string): string {
  let w = raw.trim();
  w = toSimplified(w);
  // 去除括号解释
  w = w.replace(/[（(].*?[）)]/g, '');
  // 去除特殊符号，仅保留中英文数字
  w = w.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
  return w.trim();
}

export interface ImportResult {
  records: WordCsvRecord[];
  skipped: { line: number; reason: string; raw: string }[];
}

/**
 * 解析并清洗整段 CSV 文本，返回有效记录与跳过原因。
 */
export function parseWordsCsv(csv: string): ImportResult {
  const lines = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((l) => l.trim() !== '');
  const skipped: ImportResult['skipped'] = [];
  const records: WordCsvRecord[] = [];
  if (lines.length === 0) return { records, skipped };

  const header = parseLine(lines[0]).map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const wi = idx('word');
  const ci = idx('category');
  if (wi === -1 || ci === -1) {
    throw new Error('CSV 表头必须至少包含 word 和 category 列');
  }

  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const word = cleanWord(cols[wi] ?? '');
    const category = (cols[ci] ?? '').trim();

    if (!word) {
      skipped.push({ line: i + 1, reason: '空词', raw: lines[i] });
      continue;
    }
    if (!category) {
      skipped.push({ line: i + 1, reason: 'category 为空', raw: lines[i] });
      continue;
    }
    if (word.length > 10) {
      skipped.push({ line: i + 1, reason: '长度超过 10', raw: lines[i] });
      continue;
    }
    if (SENSITIVE.some((s) => word.includes(s))) {
      skipped.push({ line: i + 1, reason: '敏感词', raw: lines[i] });
      continue;
    }
    const key = `${word}::${category}`;
    if (seen.has(key)) {
      skipped.push({ line: i + 1, reason: '重复词', raw: lines[i] });
      continue;
    }
    seen.add(key);

    const get = (name: string) => {
      const j = idx(name);
      const v = j >= 0 ? (cols[j] ?? '').trim() : '';
      return v === '' ? undefined : v;
    };

    const difficultyRaw = get('difficulty');
    const enabledRaw = get('enabled');
    const popularityRaw = get('popularity');
    const funScoreRaw = get('funScore');

    records.push({
      word,
      category,
      subCategory: get('subCategory'),
      aliases: get('aliases'),
      similarWords: get('similarWords'),
      wrongButCloseWords: get('wrongButCloseWords'),
      forbiddenWords: get('forbiddenWords'),
      difficulty: difficultyRaw ? Math.min(5, Math.max(1, parseInt(difficultyRaw, 10) || 1)) : 1,
      popularity: popularityRaw ? Math.min(100, Math.max(0, parseInt(popularityRaw, 10) || 80)) : 80,
      funScore: funScoreRaw ? Math.min(100, Math.max(0, parseInt(funScoreRaw, 10) || 80)) : 80,
      hint1: get('hint1'),
      hint2: get('hint2'),
      hint3: get('hint3'),
      source: get('source') ?? 'csv',
      enabled: enabledRaw ? enabledRaw.toLowerCase() !== 'false' : true,
    });
  }

  return { records, skipped };
}
