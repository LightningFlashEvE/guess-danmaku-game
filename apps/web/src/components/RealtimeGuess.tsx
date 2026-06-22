import type { RoundGuess } from '../types';

interface Props {
  guesses: RoundGuess[];
  limit?: number;
  compact?: boolean;
}

function getScoreTone(g: RoundGuess) {
  const score = Number.parseFloat(g.displaySimilarity);
  if (g.isCorrect) {
    return {
      card: 'bg-emerald-400/20 border-emerald-200/50',
      strip: 'from-emerald-200 to-teal-300',
      score: 'text-emerald-100',
      word: 'text-white',
    };
  }
  if (Number.isFinite(score) && score >= 75) {
    return {
      card: 'bg-amber-300/25 border-amber-100/50',
      strip: 'from-yellow-200 to-orange-300',
      score: 'text-yellow-100',
      word: 'text-white',
    };
  }
  if (Number.isFinite(score) && score >= 50) {
    return {
      card: 'bg-sky-300/20 border-sky-100/40',
      strip: 'from-sky-200 to-cyan-300',
      score: 'text-cyan-100',
      word: 'text-white',
    };
  }
  return {
    card: 'bg-white/15 border-white/25',
    strip: 'from-white/80 to-white/35',
    score: 'text-cyan-100',
    word: 'text-white/90',
  };
}

export default function RealtimeGuess({ guesses, limit = 8, compact }: Props) {
  const list = guesses.slice(0, limit);

  if (list.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center text-white/65 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
        <span className="animate-pulse">等待弹幕...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex h-full flex-col gap-1.5 overflow-hidden pr-1">
        {list.map((g, i) => {
          const tone = getScoreTone(g);
          const newest = i === 0;
          return (
            <div
              key={g.id + g.createdAt}
              className={`danmaku-card flex items-center justify-between gap-2 px-2 py-1.5 text-xs animate-danmaku-in ${tone.card} ${
                newest ? 'ring-2 ring-white/35' : ''
              }`}
              style={{ animationDelay: `${i * 38}ms` }}
            >
              <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${tone.strip}`} />
              {newest && (
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
              )}
              <span className="relative min-w-0 flex flex-1 items-center gap-1.5 truncate">
                <span className="max-w-[76px] truncate font-black text-white drop-shadow-sm">{g.nickname}</span>
                <span className="rounded-full bg-white/20 px-1 text-[9px] font-bold text-white/65">猜</span>
                <span className={`truncate font-black ${tone.word}`}>{g.guessWord}</span>
              </span>
              <span className={`relative shrink-0 rounded-full bg-slate-900/20 px-1.5 py-0.5 font-mono font-black ${tone.score}`}>
                {g.displaySimilarity}%
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((g, i) => {
        const tone = getScoreTone(g);
        return (
          <span
            key={g.id + g.createdAt}
            className={`danmaku-card animate-danmaku-in px-3 py-1.5 text-xs ${tone.card}`}
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <span className="font-black text-white">{g.nickname}</span>
            <span className="mx-1 text-white/55">猜</span>
            <span className={tone.word}>{g.guessWord}</span>
            <span className={`ml-2 font-mono font-black ${tone.score}`}>
              {g.displaySimilarity}%
            </span>
          </span>
        );
      })}
    </div>
  );
}
