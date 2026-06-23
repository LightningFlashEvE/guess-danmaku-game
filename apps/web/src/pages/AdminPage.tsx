import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { rankBadgeClass } from '../lib/rank-style';
import { useGameStore } from '../stores/gameStore';
import type { GameConfig } from '../types';

interface Status {
  running: boolean;
  embeddingProvider: string;
  remainingSeconds: number;
}

export default function AdminPage() {
  const { currentRound, lastRound, remainingSeconds, playerRanking } = useGameStore();
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [difficultyMin, setDifficultyMin] = useState(1);
  const [difficultyMax, setDifficultyMax] = useState(3);
  const [duration, setDuration] = useState(300);
  const [answer, setAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [msg, setMsg] = useState('');

  // 模拟弹幕
  const [nickname, setNickname] = useState('主播');
  const [content, setContent] = useState('');

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2500);
  };

  const loadStatus = async () => {
    try {
      setStatus(await api.get<Status>('/game/status'));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    void api.get<string[]>('/words/categories').then(setCategories).catch(() => undefined);
    void api.get<GameConfig>('/config').then((c) => {
      setConfig(c);
      setDuration(c.roundDurationSeconds);
      setCategory(c.defaultCategory ?? '');
    });
    void loadStatus();
    const t = setInterval(loadStatus, 5000);
    return () => clearInterval(t);
  }, []);

  const start = async () => {
    try {
      await api.post('/game/start', {
        category: category || undefined,
        difficultyMin,
        difficultyMax,
        durationSeconds: duration,
      });
      flash('✅ 已开始新一轮');
      void loadStatus();
    } catch (e) {
      flash(`❌ ${(e as Error).message}`);
    }
  };

  const end = async () => {
    try {
      await api.post('/game/end');
      flash('⏹ 已结束本轮');
      setAnswer(null);
      void loadStatus();
    } catch (e) {
      flash(`❌ ${(e as Error).message}`);
    }
  };

  const skip = async () => {
    await api.post('/game/skip').catch((e) => flash((e as Error).message));
    flash('⏭ 已跳过');
    setAnswer(null);
    void loadStatus();
  };

  const clearRanking = async () => {
    await api.post('/game/clear-ranking').catch((e) => flash((e as Error).message));
    flash('🧹 已清空本轮排行榜');
  };

  const viewAnswer = async () => {
    const res = await api.get<{ answerWord: string | null }>('/game/answer');
    setAnswer(res.answerWord ?? '（无进行中的轮次）');
  };

  const sendDanmaku = async () => {
    if (!content.trim()) return;
    try {
      const r = await api.post<{ accepted: boolean; reason?: string; displaySimilarity?: number }>(
        '/danmaku/debug',
        { nickname, content },
      );
      flash(r.accepted ? `📤 已发送：接近度 ${(r.displaySimilarity ?? 0).toFixed(1)}%` : `🚫 被过滤：${r.reason}`);
      setContent('');
    } catch (e) {
      flash((e as Error).message);
    }
  };

  const saveConfig = async (patch: Partial<GameConfig>) => {
    const updated = await api.patch<GameConfig>('/config', patch);
    setConfig(updated);
    flash('⚙️ 配置已保存');
  };

  return (
    <div className="stage-bg min-h-screen text-white px-3 py-4 sm:p-6 font-sans relative overflow-x-hidden">
      <div className="mx-auto max-w-5xl relative z-10">
        <header className="mb-4 flex flex-col items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:mb-8 sm:p-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎮</span>
            <div>
              <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-cyber-cyan uppercase">
                Host Control
              </h1>
              <p className="text-white/50 text-sm mt-1">猜词游戏主播控制台</p>
            </div>
          </div>
          <nav className="flex w-full flex-wrap gap-2 text-sm font-medium sm:w-auto sm:gap-4">
            <Link className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 hover:text-cyber-cyan sm:flex-none" to="/obs" target="_blank">
              <span>📺</span> OBS 预览
            </Link>
            <Link className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 hover:text-cyber-pink sm:flex-none" to="/admin/words">
              <span>📚</span> 词库管理
            </Link>
          </nav>
        </header>

        {msg && (
          <div className="mb-6 animate-slide-in flex justify-center">
            <div className="rounded-full bg-brand/20 border border-brand/40 px-6 py-2.5 text-sm font-medium text-brand-light shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-md">
              {msg}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
          {/* 左侧主要区域 */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 游戏控制面板 */}
              <section className="glass-panel rounded-2xl p-4 border-l-4 border-l-brand relative overflow-hidden sm:p-6">
              <h2 className="mb-5 text-lg font-bold text-white/90 flex items-center gap-2">
                <span className="text-brand">⚡</span> 快速控制
              </h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={start} className="flex-1 min-w-[140px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 font-bold text-white shadow-lg hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  ▶ 开始新一轮
                </button>
                <button onClick={end} className="flex-1 min-w-[140px] rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 px-5 py-3 font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  ■ 结束当前轮
                </button>
                <button onClick={skip} className="flex-1 min-w-[140px] rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-5 py-3 font-bold text-slate-900 shadow-lg hover:shadow-amber-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  ⏭ 跳过当前词
                </button>
                <button onClick={clearRanking} className="flex-1 min-w-[140px] rounded-xl bg-white/10 hover:bg-white/20 px-5 py-3 font-bold text-white shadow-lg transition-all border border-white/5 hover:border-white/20">
                  🧹 清空本轮排行
                </button>
              </div>
            </section>

            {/* 状态与出题设置 - 并排 */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              
              {/* 系统状态 */}
              <section className="glass-panel rounded-2xl p-4 flex flex-col sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-white/90 flex items-center gap-2">
                  <span className="text-cyber-cyan">📊</span> 实时状态
                </h2>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-white/50 text-sm">当前状态</span>
                    {currentRound ? (
                      <span className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        ON AIR ({remainingSeconds}s)
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-white/40 font-bold">
                        IDLE
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-center">
                      <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1">当前分类</span>
                      <span className="font-bold text-white/90">{currentRound?.category ?? '--'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-center">
                      <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1">目标字数</span>
                      <span className="font-bold text-white/90">{currentRound?.wordLength ? `${currentRound.wordLength} 字` : '--'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-center">
                      <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1">语义模型</span>
                      <span className="font-bold text-white/90">{status?.embeddingProvider ?? '--'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-center">
                      <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1">服务状态</span>
                      <span className={`font-bold ${status?.running ? 'text-emerald-400' : 'text-white/40'}`}>
                        {status?.running ? 'RUNNING' : 'READY'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/50 text-xs">当前/上轮答案：</span>
                      <button onClick={viewAnswer} className="text-xs text-brand hover:text-brand-light font-medium flex items-center gap-1">
                        👁 查看答案
                      </button>
                    </div>
                    <div className="font-mono text-lg font-bold text-cyber-cyan">
                      {answer ? answer : (lastRound?.answerWord ?? '--')}
                    </div>
                  </div>
                </div>
              </section>

              {/* 出题设置 */}
              <section className="glass-panel rounded-2xl p-4 flex flex-col sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-white/90 flex items-center gap-2">
                  <span className="text-cyber-pink">🎯</span> 出题参数
                </h2>
                
                <div className="space-y-4 flex-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 ml-1">词库分类</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl bg-black/50 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors">
                      <option value="">全部分类 (Random)</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 ml-1">难度下限 (1-5)</label>
                      <input type="number" min={1} max={5} value={difficultyMin} onChange={(e) => setDifficultyMin(+e.target.value)} className="w-full rounded-xl bg-black/50 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 ml-1">难度上限 (1-5)</label>
                      <input type="number" min={1} max={5} value={difficultyMax} onChange={(e) => setDifficultyMax(+e.target.value)} className="w-full rounded-xl bg-black/50 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-medium ml-1">
                      <span className="text-white/60">倒计时时长</span>
                      <span className="text-brand font-mono bg-brand/10 px-2 py-0.5 rounded">{duration}s</span>
                    </div>
                    <input type="range" min={30} max={600} step={10} value={duration} onChange={(e) => setDuration(+e.target.value)} className="w-full accent-brand" />
                  </div>
                </div>
              </section>
            </div>
            
            {/* 模拟弹幕 */}
            <section className="glass-panel rounded-2xl p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-white/90 flex items-center gap-2">
                <span className="text-amber-400">💬</span> 模拟弹幕发送
              </h2>
              <div className="flex flex-col gap-3 items-stretch sm:flex-row">
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="发送者昵称" className="w-full rounded-xl bg-black/50 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors sm:w-1/4" />
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/50 transition-colors focus-within:border-brand sm:flex-row">
                  <input value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendDanmaku()} placeholder="输入猜测的词汇，回车发送..." className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none" />
                  <button onClick={sendDanmaku} className="bg-brand hover:bg-brand-light text-white font-medium px-6 py-2.5 transition-colors">
                    发送
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* 右侧边栏区域 */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 游戏全局配置 */}
            <section className="glass-panel rounded-2xl p-4 sm:p-6">
              <h2 className="mb-5 text-lg font-bold text-white/90 flex items-center gap-2">
                <span className="text-slate-300">⚙️</span> 系统配置
              </h2>
              {config ? (
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 cursor-pointer transition-colors group">
                    <div>
                      <div className="text-sm font-medium text-white/90 group-hover:text-brand-light transition-colors">开启提示词</div>
                      <div className="text-[10px] text-white/40 mt-0.5">根据接近度解锁提示</div>
                    </div>
                    <div className="relative inline-block w-10 h-5">
                      <input type="checkbox" className="peer sr-only" checked={config.hintEnabled} onChange={(e) => saveConfig({ hintEnabled: e.target.checked })} />
                      <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 cursor-pointer transition-colors group">
                    <div>
                      <div className="text-sm font-medium text-white/90 group-hover:text-brand-light transition-colors">自动进入下一轮</div>
                      <div className="text-[10px] text-white/40 mt-0.5">结束后自动开启新局</div>
                    </div>
                    <div className="relative inline-block w-10 h-5">
                      <input type="checkbox" className="peer sr-only" checked={config.autoNextRound} onChange={(e) => saveConfig({ autoNextRound: e.target.checked })} />
                      <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                    </div>
                  </label>

                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-white/90">判断猜中阈值</span>
                      <span className="text-xs font-mono text-brand bg-brand/10 px-1.5 py-0.5 rounded">{(config.correctThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min={0.5} max={1} step={0.01} value={config.correctThreshold} onChange={(e) => saveConfig({ correctThreshold: +e.target.value })} className="w-full accent-brand" />
                  </div>
                </div>
              ) : (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded"></div>
                      <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 积分榜预览 */}
            <section className="glass-panel rounded-2xl p-4 flex-1 flex flex-col min-h-[250px] sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-white/90 flex items-center gap-2">
                <span className="text-amber-400">🏆</span> 积分总榜 TOP 5
              </h2>
              <div className="flex-1">
                {playerRanking.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/30 text-sm">
                    暂无排名数据
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playerRanking.slice(0, 5).map((p, i) => (
                      <div key={p.playerId} className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 text-center font-bold font-mono ${i < 3 ? 'text-amber-400' : 'text-white/40'}`}>{i + 1}</span>
                          <span className="font-medium text-white/90 text-sm max-w-[120px] truncate">{p.nickname}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm ${rankBadgeClass(p.rankName)}`}>{p.rankName}</span>
                          <span className="font-mono font-bold text-white w-12 text-right">{p.totalScore}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
