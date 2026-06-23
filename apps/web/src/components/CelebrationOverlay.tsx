interface Props {
  active: boolean;
  answerWord?: string;
  winners?: string[];
}

const CONFETTI_COLORS = ['#f59e0b', '#14b8a6', '#2563eb', '#fb7185', '#fde047', '#a78bfa'];

export default function CelebrationOverlay({ active, answerWord = '', winners = [] }: Props) {
  if (!active) return null;

  const showWinners = winners.slice(0, 4);
  const chars = Array.from(answerWord);

  return (
    <div className="celebration-overlay pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden>
      {Array.from({ length: 48 }, (_, i) => (
        <span
          key={`confetti-${i}`}
          className="celebration-confetti"
          style={{
            left: `${(i * 17) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 12) * 0.18}s`,
            animationDuration: `${2.4 + (i % 5) * 0.35}s`,
          }}
        />
      ))}

      <span className="celebration-firework celebration-firework-a" />
      <span className="celebration-firework celebration-firework-b" />
      <span className="celebration-firework celebration-firework-c" />
      <span className="celebration-ribbon celebration-ribbon-a" />
      <span className="celebration-ribbon celebration-ribbon-b" />
      <span className="celebration-ribbon celebration-ribbon-c" />

      <div className="celebration-answer-card word-paper-card">
        <div className="word-tear-area relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-2xl">
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-2">
            {chars.map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="word-letter-slot flex h-14 w-12 animate-pop-in items-center justify-center font-mono text-4xl font-black text-brand-dark"
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
      </div>

      <div className="celebration-winners">
        <p className="celebration-winners-label">猜中者</p>
        <div className="celebration-winners-list">
          {showWinners.map((winner, index) => (
            <span key={`${winner}-${index}`}>{winner}</span>
          ))}
          {winners.length > showWinners.length ? (
            <span>等 {winners.length} 人</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
