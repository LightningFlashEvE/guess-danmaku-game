interface TimerProps {
  remainingSeconds: number;
  durationSeconds?: number;
  compact?: boolean;
}

function format(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function Timer({ remainingSeconds, durationSeconds, compact }: TimerProps) {
  const urgent = remainingSeconds <= 15 && remainingSeconds > 0;
  
  // Calculate progress for the background glow
  const progress = durationSeconds && durationSeconds > 0 
    ? Math.max(0, Math.min(100, (remainingSeconds / durationSeconds) * 100)) 
    : 100;

  return (
    <div className="relative flex items-center gap-2">
      {/* 倒计时图标/动画 */}
      <div className={`relative flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-10 h-10'}`}>
        {urgent ? (
          <>
            <div className="absolute inset-0 rounded-full bg-cyber-pink/30 animate-ping"></div>
            <div className="relative z-10 w-full h-full rounded-full border-2 border-cyber-pink shadow-[0_0_10px_rgba(244,63,94,0.6)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-pink animate-pulse"></div>
            </div>
          </>
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-full w-full text-slate-800" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5V12l3 2" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center">
        {!compact && <span className="text-[10px] text-white/50 tracking-widest uppercase">Time Left</span>}
        <div className="flex items-baseline gap-1">
          <span
            className={`inline-flex min-w-[60px] items-center font-mono font-black tabular-nums leading-none ${
              compact ? 'h-[25px] text-[30px]' : 'text-4xl'
            } ${urgent ? 'text-cyber-pink text-glow drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-slate-950 text-glow'}`}
          >
            {format(remainingSeconds)}
          </span>
          {!compact && durationSeconds ? (
            <span className="text-xs text-white/40 font-mono font-medium">/ {format(durationSeconds)}</span>
          ) : null}
        </div>
        
        {/* 紧凑模式下的细进度条 */}
        {compact && durationSeconds && (
          <div className="h-0.5 w-full bg-white/10 mt-1 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-cyber-pink shadow-[0_0_5px_#f43f5e]' : 'bg-cyber-cyan shadow-[0_0_5px_#06b6d4]'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
