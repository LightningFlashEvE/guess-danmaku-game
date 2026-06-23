import type { PlayerRank } from '../types';
import { rankBadgeClass, rankProgressFillClass } from '../lib/rank-style';

interface Props {
  players: PlayerRank[];
  limit?: number;
  showProgress?: boolean;
  compact?: boolean;
}

export default function PlayerRankList({
  players,
  limit = 10,
  showProgress = false,
  compact,
}: Props) {
  const list = players.slice(0, limit);

  if (list.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center text-slate-500 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
        暂无积分数据
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col overflow-hidden ${compact ? 'gap-1' : 'gap-2'}`}>
      {list.map((p, i) => {
        const isTop3 = i < 3;
        const rankColors = [
          'from-[#FFD700]/25 to-[#FF8C00]/25 text-[#b7791f] border-[#FFD700]/60 shadow-[0_0_10px_rgba(255,215,0,0.2)]',
          'from-[#C0C0C0]/25 to-[#A9A9A9]/25 text-slate-600 border-[#C0C0C0]/60 shadow-[0_0_10px_rgba(192,192,192,0.2)]',
          'from-[#CD7F32]/25 to-[#8B4513]/25 text-orange-700 border-[#CD7F32]/60 shadow-[0_0_10px_rgba(205,127,50,0.2)]',
        ];
        
        const rankIcon = isTop3 ? ['🥇', '🥈', '🥉'][i] : (i + 1).toString().padStart(2, '0');

        if (compact) {
          const progressPct =
            p.progressTotal > 0
              ? Math.min(100, (p.progressCurrent / p.progressTotal) * 100)
              : 100;

          return (
            <div
              key={p.playerId}
              className={`flex min-h-[38px] items-center gap-1 rounded-md border px-1.5 py-1 ${
                isTop3
                  ? `bg-gradient-to-r ${rankColors[i]}`
                  : 'border-white/5 bg-white/5'
              }`}
            >
              <span
                className={`flex w-4 shrink-0 justify-center text-[10px] font-black ${
                  isTop3 ? '' : 'font-mono text-slate-500'
                }`}
              >
                {rankIcon}
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] font-bold leading-tight text-slate-900">
                  {p.nickname}
                </div>
                <div className="relative mt-0.5 h-2.5 w-full overflow-hidden rounded-full bg-black/15">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${rankProgressFillClass(p.rankName)}`}
                    style={{ width: `${progressPct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[7px] font-black leading-none text-slate-700">
                    {p.progressTotal > 0 ? `${p.progressCurrent}/${p.progressTotal}` : 'MAX'}
                  </span>
                </div>
              </div>

              <div className="flex w-10 shrink-0 flex-col items-center justify-center gap-0.5">
                <span
                  className={`rounded-full border px-1 py-0 text-[8px] font-black tracking-wide shadow-sm ${rankBadgeClass(p.rankName)}`}
                >
                  {p.rankName}
                </span>
                <span className="font-mono text-[10px] font-black leading-none text-amber-500">
                  {p.totalScore}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={p.playerId}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
              isTop3 
                ? `bg-gradient-to-r ${rankColors[i]}` 
                : 'bg-white/5 border-white/5 hover:bg-white/10 transition-colors'
            }`}
          >
            <span className={`shrink-0 flex justify-center font-black w-7 text-base ${isTop3 ? '' : 'text-slate-500 font-mono'}`}>
              {rankIcon}
            </span>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="truncate font-bold text-sm text-slate-900">
                {p.nickname}
              </span>
            </div>

            <span
              className={`shrink-0 rounded-full border px-1.5 py-0.5 font-black tracking-wider uppercase shadow-sm text-[10px] ${rankBadgeClass(p.rankName)}`}
            >
              {p.rankName}
            </span>

            {showProgress && p.progressTotal > 0 && (
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                  style={{ width: `${Math.min(100, (p.progressCurrent / p.progressTotal) * 100)}%` }}
                />
              </div>
            )}
            
            <span
              className={`ml-auto shrink-0 text-right font-mono font-black text-sm w-16 ${isTop3 ? 'text-glow drop-shadow-md' : 'text-amber-400'}`}
            >
              {p.totalScore}
            </span>
          </div>
        );
      })}
    </div>
  );
}
