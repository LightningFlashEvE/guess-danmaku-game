import type { LastRound } from '../types';

interface Props {
  lastRound: LastRound;
  compact?: boolean;
}

export default function RoundReveal({ lastRound, compact }: Props) {
  const winners = lastRound.correctGuessers ?? [];
  const showWinners = winners.slice(0, compact ? 6 : 20);
  const hasWinner = showWinners.length > 0;

  if (hasWinner) {
    return (
      <section className={`tear-reveal-wrap animate-pop-in ${compact ? 'rounded-xl p-3' : 'rounded-3xl p-4'}`}>
        <div className={`tear-card-stage ${compact ? 'min-h-[220px]' : 'min-h-[clamp(260px,32vh,360px)]'}`}>
          <div className="tear-answer-layer">
            <div className="tear-confetti" aria-hidden="true">
              <span>🎉</span>
              <span>🎉</span>
            </div>
            <p className={`font-black tracking-widest text-emerald-600 ${compact ? 'text-xs' : 'text-sm'}`}>
              猜对了
            </p>
            <p className={`mt-2 font-mono font-black tracking-widest text-slate-950 ${compact ? 'text-5xl' : 'text-6xl md:text-7xl'}`}>
              {lastRound.answerWord}
            </p>
            <p className={`mt-3 font-bold text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>
              {showWinners[0].nickname} 率先命中
            </p>
          </div>

          <div className="tear-half tear-half-left">
            <div className="tear-half-inner">
              <span className="tear-half-label">WORD</span>
              <span className="tear-half-symbol">?</span>
            </div>
          </div>
          <div className="tear-half tear-half-right">
            <div className="tear-half-inner">
              <span className="tear-half-label">CARD</span>
              <span className="tear-half-symbol">?</span>
            </div>
          </div>
        </div>

        <div className={`${compact ? 'mt-3' : 'mt-3'}`}>
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-300"></span>
            <p className={`font-black text-white tracking-widest drop-shadow-sm ${compact ? 'text-xs' : 'text-sm'}`}>
              猜中玩家
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-300"></span>
          </div>

          <div className={`flex flex-wrap justify-center ${compact ? 'gap-1.5' : 'gap-2.5'}`}>
            {showWinners.map((g, i) => (
              <span
                key={`${g.nickname}-${g.guessWord}-${i}`}
                className={`rounded-full border border-white/35 bg-white/25 font-bold text-white shadow-[0_8px_18px_rgba(15,23,42,0.12)] backdrop-blur-md ${
                  compact ? 'px-2 py-1 text-xs' : 'px-4 py-1.5 text-sm'
                }`}
                style={{ animation: `pop-in 0.3s ease-out forwards ${700 + i * 50}ms`, opacity: 0 }}
              >
                <span>{g.nickname}</span>
                <span className="ml-1 text-white/70">「{g.guessWord}」</span>
              </span>
            ))}
          </div>
          {compact && winners.length > showWinners.length ? (
            <p className="mt-2 text-[10px] text-white/70 tracking-wider">等 {winners.length} 人猜中</p>
          ) : null}
        </div>

        <p className={`animate-pulse tracking-widest text-white/75 ${compact ? 'mt-4 text-[10px]' : 'mt-3 text-xs'}`}>
          准备进入下一轮
        </p>
      </section>
    );
  }

  return (
    <section
      className={`animate-pop-in relative overflow-hidden bg-white/25 border border-white/35 text-center backdrop-blur-2xl shadow-[0_18px_46px_rgba(15,23,42,0.18)] ${
        compact ? 'rounded-xl px-3 py-4' : 'rounded-3xl p-8'
      }`}
    >
      {/* 扫光动效背景 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyber-cyan/10 via-transparent to-brand/10"></div>
      <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-shimmer rotate-12 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="inline-block px-3 py-1 border border-cyber-cyan/30 rounded-full bg-cyber-cyan/10 mb-4">
          <p className={`font-medium tracking-widest text-cyber-cyan ${compact ? 'text-xs' : 'text-sm'} uppercase`}>
            Round Complete
          </p>
        </div>
        
        <p
          className={`font-mono font-black tracking-widest text-white text-glow-cyan drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] ${
            compact ? 'text-4xl' : 'text-6xl mb-6'
          }`}
        >
          {lastRound.answerWord}
        </p>

        {showWinners.length > 0 ? (
          <div className={`${compact ? 'mt-3' : 'mt-8'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-brand"></span>
              <p className={`font-bold text-brand-light tracking-widest ${compact ? 'text-xs' : 'text-sm'} uppercase`}>
                Winners
              </p>
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-brand"></span>
            </div>
            
            <div className={`flex flex-wrap justify-center ${compact ? 'gap-1.5 mt-2' : 'gap-2.5'}`}>
              {showWinners.map((g, i) => (
                <span
                  key={`${g.nickname}-${g.guessWord}-${i}`}
                  className={`rounded-full border border-brand/40 bg-brand/10 backdrop-blur-md shadow-[0_0_10px_rgba(139,92,246,0.15)] ${
                    compact ? 'px-2 py-1 text-xs' : 'px-4 py-1.5 text-sm'
                  }`}
                  style={{ animation: `pop-in 0.3s ease-out forwards ${i * 50}ms`, opacity: 0 }}
                >
                  <span className="font-bold text-white">{g.nickname}</span>
                  <span className="text-brand-light/70 ml-1">「{g.guessWord}」</span>
                </span>
              ))}
            </div>
            {compact && winners.length > showWinners.length ? (
              <p className="mt-2 text-[10px] text-white/40 tracking-wider">等 {winners.length} 人猜中</p>
            ) : null}
          </div>
        ) : (
          <div className={`${compact ? 'mt-3' : 'mt-8'} border border-white/10 bg-white/5 rounded-xl py-3`}>
            <p className={`text-white/40 tracking-widest ${compact ? 'text-xs' : 'text-sm'}`}>本轮无人猜中</p>
          </div>
        )}

        <p className={`animate-pulse tracking-widest text-cyber-cyan/60 ${compact ? 'mt-4 text-[10px]' : 'mt-8 text-xs'} uppercase`}>
          [ 准备进入下一轮 ]
        </p>
      </div>
    </section>
  );
}
