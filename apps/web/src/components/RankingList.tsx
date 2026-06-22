import type { RoundGuess } from '../types';

interface Props {
  guesses: RoundGuess[];
  limit?: number;
  compact?: boolean;
}

export default function RankingList({ guesses, limit = 15, compact }: Props) {
  const list = guesses.slice(0, limit);

  if (list.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center text-white/30 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
        <span className="animate-pulse">等待玩家提交猜词...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full overflow-y-auto pr-1 ${compact ? 'gap-1' : 'gap-2'}`}>
      {list.map((g, i) => {
        const isTop3 = i < 3;
        const rankColors = [
          'from-[#FFD700]/20 to-[#FF8C00]/20 border-[#FFD700]/50 text-[#FFD700]', // Gold
          'from-[#C0C0C0]/20 to-[#A9A9A9]/20 border-[#C0C0C0]/50 text-[#C0C0C0]', // Silver
          'from-[#CD7F32]/20 to-[#8B4513]/20 border-[#CD7F32]/50 text-[#CD7F32]', // Bronze
        ];
        
        const cardStyle = isTop3 
          ? `bg-gradient-to-r ${rankColors[i]} border` 
          : g.isCorrect 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-white/5 border border-white/5 text-white/80 hover:bg-white/10';

        const rankIcon = isTop3 ? ['🥇', '🥈', '🥉'][i] : (i + 1).toString().padStart(2, '0');

        return (
          <div
            key={g.id}
            className={`flex items-center gap-2 animate-slide-in rounded-lg ${
              compact ? 'px-2 py-1.5' : 'px-3 py-2.5'
            } ${cardStyle} transition-colors duration-300`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* 排名标识 */}
            <div className={`shrink-0 flex items-center justify-center font-black ${
              compact ? 'w-6 text-sm' : 'w-8 text-base'
            } ${isTop3 ? '' : 'text-white/40 font-mono'}`}>
              {rankIcon}
            </div>

            {/* 玩家信息 */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className={`truncate font-bold ${isTop3 ? 'text-white' : 'text-white/90'} ${compact ? 'text-[11px]' : 'text-sm'}`}>
                  {g.nickname}
                </span>
                {!compact && g.rankName && (
                  <span className="shrink-0 rounded bg-brand/30 border border-brand/50 px-1 py-0.5 text-[9px] text-brand-light uppercase tracking-wider">
                    {g.rankName}
                  </span>
                )}
              </div>
              <span className={`truncate ${isTop3 ? 'text-white/80' : 'text-white/60'} ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {g.guessWord}
              </span>
            </div>

            {/* 进度/相似度 */}
            <div className={`flex flex-col items-end shrink-0 ${compact ? 'w-16' : 'w-24'}`}>
              <span
                className={`font-mono font-bold leading-none ${
                  compact ? 'text-xs' : 'text-sm'
                } ${g.isCorrect ? 'text-emerald-400' : 'text-cyber-cyan'}`}
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
