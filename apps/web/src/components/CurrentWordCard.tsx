import type { CurrentRound } from '../types';

interface Props {
  round: CurrentRound | null;
  compact?: boolean;
}

export default function CurrentWordCard({ round, compact }: Props) {
  if (!round) {
    return (
      <div
        className={`word-card-shell flex items-center justify-center text-slate-500 font-bold tracking-widest ${
          compact ? 'px-3 py-6 text-sm rounded-xl' : 'rounded-2xl p-8'
        }`}
      >
        <span className="animate-pulse">等待新一轮开始...</span>
      </div>
    );
  }

  const letters = Array.from({ length: round.wordLength }, (_, i) => i);

  return (
    <div className={`word-card-shell relative ${compact ? 'rounded-xl p-2' : 'rounded-2xl p-4'}`}>
      <div className="word-card-shadow" />
      <div className={`word-paper-card relative z-10 flex flex-col items-center justify-center ${compact ? 'min-h-[132px] px-4 py-5' : 'min-h-[210px] px-8 py-9'}`}>
        <div className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
          Word Card
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-cyber-cyan to-brand px-2.5 py-1 text-[10px] font-black tracking-widest text-white shadow-sm">
          {round.category}
        </div>

        <div className={`relative z-10 flex flex-wrap items-center justify-center gap-2 ${compact ? 'mt-4' : 'mt-6'}`}>
          {letters.map((i) => (
            <span
              key={i}
              className={`word-letter-slot flex items-center justify-center font-mono font-black text-brand-dark ${
                compact ? 'h-14 w-12 text-4xl' : 'h-20 w-16 text-5xl'
              }`}
            >
              _
            </span>
          ))}
        </div>
        <div className={`relative z-10 flex items-center justify-center gap-2 ${compact ? 'mt-4' : 'mt-5'}`}>
          <span
            className={`rounded-full border border-brand/20 bg-brand/10 font-black text-brand-dark shadow-sm ${
              compact ? 'px-2.5 py-0.5 text-[10px] tracking-widest' : 'px-4 py-1 text-xs tracking-widest'
            }`}
          >
            {round.wordLength} 字词
          </span>
          {round.topGuessWord ? (
            <span className={`rounded-full border border-cyber-cyan/20 bg-cyber-cyan/10 font-bold text-teal-700 ${compact ? 'px-2.5 py-0.5 text-[10px]' : 'px-4 py-1 text-xs'}`}>
              最接近：{round.topGuessWord}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
