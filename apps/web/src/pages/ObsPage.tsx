import { useSearchParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { OBS_LAYOUT } from '../lib/obs-layout';
import Timer from '../components/Timer';
import CurrentWordCard from '../components/CurrentWordCard';
import RankingList from '../components/RankingList';
import PlayerRankList from '../components/PlayerRankList';
import RealtimeGuess from '../components/RealtimeGuess';
import RoundReveal from '../components/RoundReveal';

function Panel({
  title,
  children,
  className = '',
  icon = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: string;
}) {
  return (
    <section className={`glass-panel rounded-2xl p-3 flex flex-col ${className}`}>
      <div className="mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1.5">
        {icon && <span className="text-sm opacity-80">{icon}</span>}
        <h2 className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-cyber-cyan uppercase">
          {title}
        </h2>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export default function ObsPage() {
  const { currentRound, lastRound, roundRanking, playerRanking, recentGuesses, remainingSeconds } =
    useGameStore();
  const [searchParams] = useSearchParams();

  const topGuess = roundRanking[0];
  const inReveal = !currentRound && !!lastRound;

  const scale = Number(searchParams.get('scale'));
  const scaleStyle =
    Number.isFinite(scale) && scale > 0 && scale !== 1
      ? { transform: `scale(${scale})`, transformOrigin: 'top center' as const }
      : undefined;

  return (
    <div className="obs-page stage-bg flex justify-center text-white relative font-sans">
      <div className="obs-canvas relative z-10 flex flex-col gap-3 px-3 py-3" style={scaleStyle}>
        
        {/* 顶栏 */}
        <header className="glass-panel-heavy rounded-2xl px-4 py-3.5 text-center relative group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyber-purple via-cyber-cyan to-cyber-pink"></div>
          <h1 className="relative text-xl font-black leading-tight tracking-widest text-glow drop-shadow-sm">
            <span className="text-cyber-purple">互动</span>猜词
          </h1>
          <p className="relative mt-0.5 text-[11px] font-medium tracking-wider text-white/80">
            发送弹幕参与 · 相似度越高排名越前
          </p>
        </header>

        {/* 轮间公布 */}
        {inReveal ? (
          <div className="flex-1 flex flex-col justify-center animate-pop-in">
            <RoundReveal lastRound={lastRound!} compact={false} />
          </div>
        ) : null}

        {!inReveal ? (
          <>
            {/* 计时与当前最高 */}
            <section className="glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between">
              <Timer compact remainingSeconds={remainingSeconds} durationSeconds={currentRound?.durationSeconds} />
              <div className="text-right flex flex-col">
                <span className="text-[10px] font-medium tracking-widest text-white/70 uppercase">Top Match</span>
                <div className="font-mono text-xl font-black text-glow-cyan text-cyber-purple leading-none">
                  {topGuess ? `${topGuess.displaySimilarity}%` : '--'}
                  {topGuess && (
                    <span className="ml-1.5 text-xs font-sans font-medium text-white/80">{topGuess.guessWord}</span>
                  )}
                </div>
              </div>
            </section>

            {/* 题目 */}
            <CurrentWordCard compact round={currentRound} />

            {/* 核心两列布局，下半部分 */}
            <div className="flex flex-1 min-h-0 flex-col gap-3">
              
              {/* 本轮排行 */}
              <Panel title="本轮接近度排行" icon="🎯" className="flex-shrink-0">
                <RankingList compact guesses={roundRanking} limit={OBS_LAYOUT.roundRankingLimit} />
              </Panel>

              <div className="grid flex-1 min-h-0 grid-cols-2 gap-3">
                {/* 积分榜 */}
                <Panel title="总积分榜" icon="🏆" className="h-full">
                  <PlayerRankList compact players={playerRanking} limit={OBS_LAYOUT.playerRankingLimit} />
                </Panel>

                {/* 实时猜词 */}
                <Panel title="实时弹幕" icon="💬" className="h-full">
                  <RealtimeGuess compact guesses={recentGuesses} limit={OBS_LAYOUT.realtimeLimit} />
                </Panel>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
