import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useGameStore } from '../stores/gameStore';

interface SendLog {
  nickname: string;
  content: string;
  result: string;
  ok: boolean;
}

const PRESET_NAMES = ['用户A', '用户B', '用户C', '路人甲', '吃瓜群众', '弹幕侠'];

export default function DebugDanmakuPage() {
  const { currentRound, recentGuesses } = useGameStore();
  const [nickname, setNickname] = useState('用户A');
  const [content, setContent] = useState('');
  const [logs, setLogs] = useState<SendLog[]>([]);

  const send = async () => {
    if (!content.trim()) return;
    try {
      const r = await api.post<{ accepted: boolean; reason?: string; displaySimilarity?: number; isCorrect?: boolean }>(
        '/danmaku/debug',
        { nickname, content },
      );
      const result = r.accepted
        ? `接近度 ${(r.displaySimilarity ?? 0).toFixed(1)}%${r.isCorrect ? ' 🎉猜中' : ''}`
        : `被过滤：${r.reason}`;
      setLogs((l) => [{ nickname, content, result, ok: r.accepted }, ...l].slice(0, 50));
      setContent('');
    } catch (e) {
      setLogs((l) => [{ nickname, content, result: (e as Error).message, ok: false }, ...l]);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 text-white">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">💬 调试弹幕</h1>
        <Link className="text-sm text-brand hover:underline" to="/admin">← 返回控制台</Link>
      </div>

      <div className="mb-4 rounded-xl bg-white/5 p-4 text-sm text-white/70">
        当前题目：
        {currentRound ? (
          <span className="text-white">
            {' '}{currentRound.maskedWord}（字数 {currentRound.wordLength}，剩余 {currentRound.remainingSeconds}s）
          </span>
        ) : (
          <span className="text-white/40"> 当前没有进行中的游戏，请先在控制台开始一轮</span>
        )}
      </div>

      <div className="rounded-xl bg-white/5 p-4">
        <div className="mb-2 flex flex-wrap gap-2">
          {PRESET_NAMES.map((n) => (
            <button key={n} onClick={() => setNickname(n)} className={`rounded-full px-3 py-1 text-xs ${nickname === n ? 'bg-brand' : 'bg-white/10'}`}>
              {n}
            </button>
          ))}
        </div>
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="昵称" className="mb-2 w-full rounded-lg bg-black/40 px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="输入猜测词，回车发送"
            className="flex-1 rounded-lg bg-black/40 px-3 py-2 text-sm"
          />
          <button onClick={send} className="rounded-lg bg-brand px-5 py-2 text-sm font-medium hover:bg-brand-dark">发送</button>
        </div>
      </div>

      {/* 发送记录 */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-xl bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/80">发送记录</h2>
          <div className="space-y-1 text-xs">
            {logs.map((l, i) => (
              <div key={i} className={`rounded px-2 py-1 ${l.ok ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                <span className="font-medium">{l.nickname}</span>：{l.content} → <span className={l.ok ? 'text-emerald-300' : 'text-red-300'}>{l.result}</span>
              </div>
            ))}
            {logs.length === 0 && <div className="text-white/40">暂无记录</div>}
          </div>
        </section>

        <section className="rounded-xl bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/80">实时排行（来自服务端）</h2>
          <div className="space-y-1 text-xs">
            {recentGuesses.slice(0, 12).map((g) => (
              <div key={g.id + g.createdAt} className="flex justify-between rounded bg-white/5 px-2 py-1">
                <span>{g.nickname}：{g.guessWord}</span>
                <span className="font-mono text-brand">{g.displaySimilarity}%</span>
              </div>
            ))}
            {recentGuesses.length === 0 && <div className="text-white/40">暂无</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
