import type { CurrentRound, LastRound } from '../types';

interface Props {
  round?: CurrentRound | null;
  reveal?: LastRound | null;
  showHintCapsule?: boolean;
  compact?: boolean;
}

export function GiftRecordPanel({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`glass-panel flex flex-col ${
        compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl p-4'
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between border-b border-white/5 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🎁</span>
          <span className="text-xs font-black tracking-widest text-slate-700">送礼记录</span>
        </div>
        <span className="rounded-full bg-cyber-cyan/10 px-2 py-0.5 text-[9px] font-black text-cyber-cyan">
          最新
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg bg-white/10 px-2 py-2 text-[11px] font-bold tracking-wider text-slate-500">
        暂无送礼记录
      </div>
    </div>
  );
}

function RevealedWord({ reveal, compact }: { reveal: LastRound; compact?: boolean }) {
  const chars = Array.from(reveal.answerWord);

  return (
    <div className="word-tear-area relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-2xl">
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2">
        {chars.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={`word-letter-slot flex items-center justify-center font-mono font-black text-brand-dark animate-pop-in ${
              compact ? 'h-12 w-10 text-3xl' : 'h-20 w-16 text-5xl'
            }`}
            style={{ animationDelay: `${620 + index * 70}ms` }}
          >
            {char}
          </span>
        ))}
      </div>

      <div className="word-tear-cover word-tear-cover-left">
        <div className="word-tear-cover-inner">
          <span>?</span>
        </div>
      </div>
      <div className="word-tear-cover word-tear-cover-right">
        <div className="word-tear-cover-inner">
          <span>?</span>
        </div>
      </div>
    </div>
  );
}

export default function CurrentWordCard({ round, reveal, showHintCapsule = true, compact }: Props) {
  if (!round && !reveal) {
    return null;
  }

  const category = reveal?.category ?? round?.category ?? '';
  const letters = round ? Array.from({ length: round.wordLength }, (_, i) => i) : [];

  return (
    <div className={`word-card-shell relative ${compact ? 'rounded-xl' : 'rounded-2xl p-4'}`}>
      <div className="word-card-shadow" />
      <div className={`word-paper-card relative z-10 flex items-center ${compact ? 'min-h-[88px] px-3 py-3' : 'min-h-[180px] px-6 py-7'}`}>
        {showHintCapsule ? (
          <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-cyber-cyan to-brand px-2.5 py-1 text-[10px] font-black tracking-widest text-white shadow-sm">
            {category}
          </div>
        ) : null}

        {reveal ? (
          <RevealedWord reveal={reveal} compact={compact} />
        ) : (
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-2">
              {letters.map((i) => (
                <span
                  key={i}
                  className={`word-letter-slot flex items-center justify-center font-mono font-black text-brand-dark ${
                    compact ? 'h-12 w-10 text-3xl' : 'h-20 w-16 text-5xl'
                  }`}
                >
                  _
                </span>
              ))}
            </div>
            {round?.topGuessWord ? (
              <div className={`relative z-10 flex items-center justify-center gap-2 ${compact ? 'mt-4' : 'mt-5'}`}>
                <span className={`rounded-full border border-cyber-cyan/20 bg-cyber-cyan/10 font-bold text-teal-700 ${compact ? 'px-2.5 py-0.5 text-[10px]' : 'px-4 py-1 text-xs'}`}>
                  最接近：{round.topGuessWord}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
