import type { RoundGuess } from '../types';
import { rankBadgeClass } from '../lib/rank-style';

interface Props {
  guesses: RoundGuess[];
  limit?: number;
  compact?: boolean;
}

export default function RankingList({ guesses, limit = 15, compact }: Props) {
  const list = guesses.slice(0, limit);

  if (list.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center text-slate-500 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
        <span className="animate-pulse">等待玩家提交猜词...</span>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${compact ? 'gap-1 overflow-hidden' : 'overflow-y-auto gap-2 pr-1'}`}>
      {list.map((g, i) => {
        const isTop3 = i < 3;
        const rankColors = [
          'from-[#FFD700]/25 to-[#FF8C00]/25 text-[#b7791f] border-[#FFD700]/60 shadow-[0_0_10px_rgba(255,215,0,0.2)]',
          'from-[#C0C0C0]/25 to-[#A9A9A9]/25 text-slate-600 border-[#C0C0C0]/60 shadow-[0_0_10px_rgba(192,192,192,0.2)]',
          'from-[#CD7F32]/25 to-[#8B4513]/25 text-orange-700 border-[#CD7F32]/60 shadow-[0_0_10px_rgba(205,127,50,0.2)]',
        ];

        const rankIcon = isTop3 ? ['🥇', '🥈', '🥉'][i] : (i + 1).toString().padStart(2, '0');

        if (compact) {
          return (
            <div
              key={g.id}
              className={`flex min-h-[32px] items-center gap-1 rounded-md border px-1.5 py-0.5 ${
                g.isCorrect
                  ? 'border-emerald-500/35 bg-gradient-to-r from-emerald-500/18 to-teal-400/12 shadow-[0_2px_8px_rgba(16,185,129,0.12)]'
                  : 'border-white/30 bg-white/35 shadow-[0_2px_8px_rgba(15,23,42,0.08)]'
              }`}
            >
              <div className="min-w-0 flex-[1.1]">
                <div className="truncate text-[10px] font-bold leading-[11px] text-slate-900">
                  {g.nickname}
                </div>
                <div className="mt-px flex min-w-0 items-center gap-1">
                  {g.rankName ? (
                    <span
                      className={`shrink-0 rounded-full border px-1 py-0 text-[8px] font-black tracking-wide shadow-sm ${rankBadgeClass(g.rankName)}`}
                    >
                      {g.rankName}
                    </span>
                  ) : null}
                </div>
              </div>

              <span className="w-9 shrink-0 truncate text-center text-[10px] font-black text-slate-950">
                {g.guessWord}
              </span>

              <span
                className={`w-10 shrink-0 text-right font-mono text-[11px] font-black leading-none ${
                  g.isCorrect ? 'text-emerald-500' : 'text-cyan-600'
                }`}
              >
                {g.displaySimilarity}%
              </span>
            </div>
          );
        }

        const cardStyle = isTop3
          ? `bg-gradient-to-r ${rankColors[i]} border`
          : g.isCorrect
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700'
            : 'bg-white/10 border border-white/10 text-slate-700 hover:bg-white/20';

        return (
          <div
            key={g.id}
            className={`flex items-center gap-2 animate-slide-in rounded-lg px-3 py-2.5 ${cardStyle} transition-colors duration-300`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex w-8 shrink-0 items-center justify-center text-base font-black">
              {rankIcon}
            </div>

            {/* 玩家信息 */}
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-slate-900">
                  {g.nickname}
                </span>
                {g.rankName && (
                  <span className={`shrink-0 rounded border px-1 py-0.5 text-[9px] font-black uppercase tracking-wider ${rankBadgeClass(g.rankName)}`}>
                    {g.rankName}
                  </span>
                )}
              </div>
              <span className="truncate text-xs text-slate-600">
                {g.guessWord}
              </span>
            </div>

            {/* 进度/相似度 */}
            <div className="flex w-24 shrink-0 flex-col items-end">
              <span
                className={`font-mono text-sm font-bold leading-none ${
                  g.isCorrect ? 'text-emerald-400' : 'text-cyber-cyan'
                }`}
              >
                {g.displaySimilarity}%
              </span>
              <div className="w-full h-1 mt-1 overflow-hidden rounded-full bg-black/50">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    g.isCorrect ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gradient-to-r from-brand to-cyber-cyan'
                  }`}
                  style={{ width: `${Math.min(100, g.similarity * 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
