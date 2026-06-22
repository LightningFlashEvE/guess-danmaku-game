// 简单敏感词表，MVP 用，可后续扩展或接入第三方。
const SENSITIVE_WORDS = ['敏感词', '法轮', '习近平', '操你', '傻逼', '草泥马'];

// 无意义语气词 / 停用词
const STOP_WORDS = new Set([
  '哈哈',
  '哈哈哈',
  '哈',
  '啊',
  '哦',
  '嗯',
  '呵呵',
  '哎',
  '呀',
  '吧',
  '呢',
  '啦',
  '了',
  '的',
  '666',
  '233',
  '???',
]);

/**
 * 清洗弹幕文本：去空白、表情、URL、标点符号，仅保留中文/字母/数字。
 */
export function cleanDanmakuText(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();

  // 去除 URL
  text = text.replace(/https?:\/\/\S+/gi, '');
  // 去除 [xxx] 形式的表情
  text = text.replace(/\[[^\]]*\]/g, '');
  // 去除常见控制台 / 颜文字符号，仅保留中文、英文字母、数字
  text = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

  return text.trim();
}

/**
 * 是否包含敏感词。
 */
export function containsSensitiveWord(text: string): boolean {
  return SENSITIVE_WORDS.some((w) => text.includes(w));
}

/**
 * 从清洗后的文本中提取候选猜测词。
 * 支持「猜 松树」「答案 松树」「猜松树」等格式，否则直接取整段。
 */
export function extractGuessWord(cleanText: string): string | null {
  if (!cleanText) return null;

  let guess = cleanText;
  // 去掉前缀指令
  const prefixes = ['猜测', '猜', '答案', '答', '我猜'];
  for (const p of prefixes) {
    if (guess.startsWith(p) && guess.length > p.length) {
      guess = guess.slice(p.length);
      break;
    }
  }
  guess = guess.trim();
  return validateGuess(guess) ? guess : null;
}

/**
 * 校验是否为有效猜测：长度 1~10 个中文字符、非纯数字、非停用词、非敏感词。
 */
export function validateGuess(guess: string): boolean {
  if (!guess) return false;
  if (guess.length < 1 || guess.length > 10) return false;
  // 纯数字过滤
  if (/^\d+$/.test(guess)) return false;
  // 停用词 / 语气词过滤
  if (STOP_WORDS.has(guess)) return false;
  // 敏感词过滤
  if (containsSensitiveWord(guess)) return false;
  // 至少包含一个中文或字母
  if (!/[\u4e00-\u9fa5a-zA-Z]/.test(guess)) return false;
  return true;
}
