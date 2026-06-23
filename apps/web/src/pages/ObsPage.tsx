import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { api } from '../lib/api';
import { OBS_LAYOUT } from '../lib/obs-layout';
import Timer from '../components/Timer';
import CurrentWordCard, { GiftRecordPanel } from '../components/CurrentWordCard';
import RankingList from '../components/RankingList';
import PlayerRankList from '../components/PlayerRankList';
import CelebrationOverlay from '../components/CelebrationOverlay';
import type { GameConfig } from '../types';

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
      <div className="mb-2 flex items-center justify-center gap-1.5 border-b border-white/5 pb-1.5">
        {icon ? <span className="text-sm opacity-80">{icon}</span> : null}
        <h2 className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-cyber-cyan uppercase">
          {title}
        </h2>
        {icon ? <span className="text-sm opacity-80">{icon}</span> : null}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export default function ObsPage() {
  const { currentRound, lastRound, roundRanking, playerRanking, remainingSeconds } =
    useGameStore();
  const [searchParams] = useSearchParams();
  const [showHintCapsule, setShowHintCapsule] = useState(true);

  useEffect(() => {
    let disposed = false;

    const syncHintConfig = async () => {
      try {
        const config = await api.get<GameConfig>('/config');
        if (!disposed) {
          setShowHintCapsule(config.hintEnabled);
        }
      } catch {
        // OBS 展示页配置同步失败时保留上一次状态。
      }
    };

    void syncHintConfig();
    const timer = window.setInterval(syncHintConfig, 2000);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  const inReveal = !currentRound && !!lastRound;
  const showCelebration =
    inReveal && (lastRound?.correctGuessers?.length ?? 0) > 0;
  const lastWinnerNames = lastRound?.correctGuessers?.map((winner) => winner.nickname) ?? [];
  const lastWinnersText =
    lastWinnerNames.length > 0
      ? `上轮猜中用户：${lastWinnerNames.slice(0, 3).join('、')}${lastWinnerNames.length > 3 ? ` 等 ${lastWinnerNames.length} 人` : ''}`
      : '上轮猜中用户：暂无';
  const lastAnswerText = `上轮正确词语：${lastRound?.answerWord ?? '暂无'}`;
  const timerProgress =
    currentRound?.durationSeconds && currentRound.durationSeconds > 0
      ? Math.max(0, Math.min(100, (remainingSeconds / currentRound.durationSeconds) * 100))
      : 0;
  const timerTone = 'from-slate-300/90 via-sky-200/70 to-slate-400/85';

  const scale = Number(searchParams.get('scale'));
  const scaleStyle =
    Number.isFinite(scale) && scale > 0 && scale !== 1
      ? { transform: `scale(${scale})`, transformOrigin: 'top center' as const }
      : undefined;

  return (
    <div className="obs-page stage-bg flex justify-center text-slate-800 relative font-sans">
      <CelebrationOverlay
        active={showCelebration}
        answerWord={lastRound?.answerWord}
        winners={lastWinnerNames}
      />

      <div className="obs-canvas relative z-10 flex flex-col gap-2 px-3 py-3" style={scaleStyle}>
        {/* 标题 */}
        <section className="glass-panel rounded-2xl px-4 py-3 text-center">
          <h1 className="text-2xl font-black leading-tight tracking-widest text-slate-800">
            弹幕猜词王
          </h1>
        </section>

        {/* 送礼记录与计时 */}
        <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-2">
          <GiftRecordPanel compact />
          <section className="glass-panel relative overflow-hidden rounded-2xl px-3 py-3">
            <div className="absolute inset-0 bg-white/30" />
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-br ${timerTone} transition-all duration-1000`}
              style={{ height: `${timerProgress}%` }}
            />
            <div className="relative z-10">
              <Timer compact remainingSeconds={remainingSeconds} durationSeconds={currentRound?.durationSeconds} />
              <p className="mt-1 truncate text-[9px] font-medium tracking-wider text-slate-600">
                {lastWinnersText}
              </p>
              <p className="mt-0.5 truncate text-[9px] font-medium tracking-wider text-slate-600">
                {lastAnswerText}
              </p>
            </div>
          </section>
        </div>

        {(currentRound || inReveal) ? (
          <CurrentWordCard
            compact
            round={currentRound}
            reveal={inReveal ? lastRound : null}
            showHintCapsule={showHintCapsule}
          />
        ) : null}

        {/* 核心排行区域 */}
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
          <Panel title="本轮接近度排行" icon="🏆" className="min-h-0">
            <RankingList compact guesses={roundRanking} limit={OBS_LAYOUT.roundRankingLimit} />
          </Panel>

          <div className="flex min-h-0 flex-col gap-2">
            <Panel title="积分排行" icon="🏅" className="h-[260px] flex-shrink-0">
              <PlayerRankList compact players={playerRanking} limit={OBS_LAYOUT.playerRankingLimit} />
            </Panel>
            <section className="glass-panel min-h-0 flex-1 rounded-2xl p-3">
              <h2 className="mb-2 text-center text-xs font-black tracking-widest text-slate-700">
                游戏说明
              </h2>
              <div className="space-y-1 text-[10px] font-bold leading-snug text-slate-500">
                <p>发送弹幕猜词即可参与</p>
                <p>相似度越高排名越前</p>
                <p>猜中答案获得额外积分</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
