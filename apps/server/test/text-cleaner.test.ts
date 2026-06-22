import { describe, it, expect } from 'vitest';
import {
  cleanDanmakuText,
  extractGuessWord,
  validateGuess,
  containsSensitiveWord,
} from '../src/utils/text-cleaner.js';

describe('cleanDanmakuText', () => {
  it('去除空白与标点', () => {
    expect(cleanDanmakuText('  松树！ ')).toBe('松树');
  });
  it('去除 URL', () => {
    expect(cleanDanmakuText('看这里 http://a.com/x 松树')).toBe('看这里松树');
  });
  it('去除表情 [xxx]', () => {
    expect(cleanDanmakuText('松树[微笑]')).toBe('松树');
  });
  it('保留中英文数字', () => {
    expect(cleanDanmakuText('abc123柳树')).toBe('abc123柳树');
  });
});

describe('validateGuess', () => {
  it('正常词有效', () => {
    expect(validateGuess('松树')).toBe(true);
  });
  it('纯数字无效', () => {
    expect(validateGuess('12345')).toBe(false);
  });
  it('停用词无效', () => {
    expect(validateGuess('哈哈')).toBe(false);
  });
  it('超长无效', () => {
    expect(validateGuess('一二三四五六七八九十一')).toBe(false);
  });
  it('空字符串无效', () => {
    expect(validateGuess('')).toBe(false);
  });
});

describe('extractGuessWord', () => {
  it('直接词', () => {
    expect(extractGuessWord('松树')).toBe('松树');
  });
  it('去掉「猜」前缀', () => {
    expect(extractGuessWord('猜松树')).toBe('松树');
  });
  it('去掉「答案」前缀', () => {
    expect(extractGuessWord('答案柳树')).toBe('柳树');
  });
  it('无效返回 null', () => {
    expect(extractGuessWord('666')).toBeNull();
  });
});

describe('containsSensitiveWord', () => {
  it('命中敏感词', () => {
    expect(containsSensitiveWord('这是敏感词测试')).toBe(true);
  });
  it('正常文本不命中', () => {
    expect(containsSensitiveWord('松树')).toBe(false);
  });
});
