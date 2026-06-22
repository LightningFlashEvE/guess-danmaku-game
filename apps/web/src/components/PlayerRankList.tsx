import type { PlayerRank } from '../types';

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
      <div className={`h-full flex items-center justify-center text-white/30 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
        暂无积分数据
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full overflow-y-auto pr-1 ${compact ? 'gap-1.5' : 'gap-2'}`}>
      {list.map((p, i) => {
        const isTop3 = i < 3;
        const rankColors = [
          'from-[#FFD700]/20 to-[#FF8C00]/20 text-[#FFD700] border-[#FFD700]/50 shadow-[0_0_10px_rgba(255,215,0,0.2)]',
          'from-[#C0C0C0]/20 to-[#A9A9A9]/20 text-[#C0C0C0] border-[#C0C0C0]/50 shadow-[0_0_10px_rgba(192,192,192,0.2)]',
          'from-[#CD7F32]/20 to-[#8B4513]/20 text-[#CD7F32] border-[#CD7F32]/50 shadow-[0_0_10px_rgba(205,127,50,0.2)]',
        ];
        
        const rankIcon = isTop3 ? ['🥇', '🥈', '🥉'][i] : (i + 1).toString().padStart(2, '0');

        return (
          <div
            key={p.playerId}
            className={`flex items-center gap-2 rounded-lg border ${
              compact ? 'px-2 py-1.5' : 'px-3 py-2.5'
            } ${
              isTop3 
                ? `bg-gradient-to-r ${rankColors[i]}` 
                : 'bg-white/5 border-white/5 hover:bg-white/10 transition-colors'
            }`}
          >
            <span className={`shrink-0 flex justify-center font-black ${
              compact ? 'w-5 text-sm' : 'w-7 text-base'
            } ${isTop3 ? '' : 'text-white/40 font-mono'}`}>
              {rankIcon}
            </span>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span
                className={`truncate font-bold ${
                  compact ? 'text-xs' : 'text-sm'
                } ${isTop3 ? 'text-white' : 'text-white/90'}`}
              >
                {p.nickname}
              </span>
            </div>

            <span
              className={`shrink-0 rounded-full border ${
                isTop3
                  ? 'bg-black/30 border-current text-[10px] px-1.5'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 text-[9px] px-1.5 py-0.5'
              } tracking-wider uppercase`}
            >
              {p.rankName}
            </span>

            {showProgress && !compact && p.progressTotal > 0 && (
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                  style={{ width: `${Math.min(100, (p.progressCurrent / p.progressTotal) * 100)}%` }}
                />
              </div>
            )}
            
            <span
              className={`ml-auto shrink-0 text-right font-mono font-black ${
                compact ? 'text-xs w-12' : 'text-sm w-16'
              } ${isTop3 ? 'text-glow drop-shadow-md' : 'text-amber-400'}`}
            >
              {p.totalScore}
            </span>
          </div>
        );
      })}
    </div>
  );
}
