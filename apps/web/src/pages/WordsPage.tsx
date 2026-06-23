import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Word } from '../types';

interface ListResult {
  items: Word[];
  total: number;
}

const emptyForm: Partial<Word> = {
  word: '',
  category: '',
  subCategory: '',
  aliases: '',
  similarWords: '',
  difficulty: 1,
  hint1: '',
  hint2: '',
  hint3: '',
  enabled: true,
};

export default function WordsPage() {
  const [items, setItems] = useState<Word[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [editing, setEditing] = useState<Partial<Word> | null>(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(''), 2500);
  };

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    if (filterCategory) params.set('category', filterCategory);
    const res = await api.get<ListResult>(`/words?${params.toString()}`);
    setItems(res.items);
    setTotal(res.total);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterCategory]);

  useEffect(() => {
    void api.get<string[]>('/words/categories').then(setCategories).catch(() => undefined);
  }, []);

  const save = async () => {
    if (!editing?.word || !editing?.category) return flash('❌ 词和分类必填');
    try {
      if (editing.id) {
        await api.patch(`/words/${editing.id}`, editing);
      } else {
        await api.post('/words', editing);
      }
      setEditing(null);
      flash('✅ 已保存');
      void load();
    } catch (e) {
      flash(`❌ ${(e as Error).message}`);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('确定删除该词条？')) return;
    await api.delete(`/words/${id}`);
    flash('🗑️ 已删除');
    void load();
  };

  const toggle = async (w: Word) => {
    await api.post(`/words/${w.id}/toggle`, { enabled: !w.enabled });
    void load();
  };

  const genEmbedding = async (id: string) => {
    await api.post(`/words/${id}/generate-embedding`);
    flash('✅ 已生成 embedding');
    void load();
  };

  const batchGen = async (onlyMissing: boolean) => {
    if (!onlyMissing && !confirm('将用当前 Embedding Provider 重算所有词条向量（切换模型后必须执行），确定？')) return;
    flash('⏳ 正在生成向量，请稍候…');
    const r = await api.post<{ processed: number; failed: number }>('/words/batch-generate-embedding', { onlyMissing });
    flash(`✅ 完成：${r.processed} 成功，${r.failed} 失败`);
    void load();
  };

  const importCsv = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const r = await api.upload<{ imported: number; skipped: number }>('/words/import-csv', form);
    flash(`✅ 导入完成：${r.imported} 条，跳过 ${r.skipped} 条`);
    void load();
    void api.get<string[]>('/words/categories').then(setCategories);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="stage-bg min-h-screen text-white p-6 font-sans relative overflow-x-hidden">
      <div className="mx-auto max-w-6xl relative z-10">
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-cyber-pink uppercase">
                Word Library
              </h1>
              <p className="text-white/50 text-sm mt-1">游戏词库管理中心</p>
            </div>
          </div>
          <nav className="flex gap-4 text-sm font-medium">
            <Link className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white hover:text-brand-light flex items-center gap-2" to="/admin">
              <span>←</span> 返回控制台
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

        <div className="glass-panel rounded-2xl p-6 mb-6">
          {/* 工具栏 */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (setPage(1), void load())}
                  placeholder="搜索词 / 别名，回车"
                  className="rounded-xl bg-black/50 border border-white/10 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand transition-colors w-64"
                />
              </div>
              <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="rounded-xl bg-black/50 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-brand transition-colors appearance-none pr-8 relative cursor-pointer">
                <option value="">全部分类</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setEditing({ ...emptyForm })} className="rounded-xl bg-emerald-600/90 hover:bg-emerald-500 px-4 py-2 text-sm font-medium shadow-lg transition-colors border border-emerald-500/50">
                + 新增词条
              </button>
              <button onClick={() => fileRef.current?.click()} className="rounded-xl bg-brand/90 hover:bg-brand-light px-4 py-2 text-sm font-medium shadow-lg transition-colors border border-brand/50">
                📥 导入 CSV
              </button>
              <a href="/api/words/export-csv" className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium shadow-lg transition-colors border border-white/10 inline-flex items-center">
                📤 导出 CSV
              </a>
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              <button onClick={() => batchGen(true)} className="rounded-xl bg-amber-600/90 hover:bg-amber-500 px-4 py-2 text-sm font-medium shadow-lg transition-colors border border-amber-500/50">
                ✨ 补全向量
              </button>
              <button onClick={() => batchGen(false)} className="rounded-xl bg-red-700/90 hover:bg-red-600 px-4 py-2 text-sm font-medium shadow-lg transition-colors border border-red-500/50" title="换模型后需要全量重算">
                🔄 全量重算
              </button>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
            </div>
          </div>

          {/* 表格 */}
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-white/50 border-b border-white/10 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">词</th>
                  <th className="px-4 py-3 font-medium">分类</th>
                  <th className="px-4 py-3 font-medium">别名</th>
                  <th className="px-4 py-3 font-medium">难度</th>
                  <th className="px-4 py-3 font-medium text-center">向量</th>
                  <th className="px-4 py-3 font-medium text-center">状态</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-white/90">{w.word}</td>
                    <td className="px-4 py-3 text-white/70">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{w.category}</span>
                      {w.subCategory && <span className="ml-1.5 text-white/50 text-xs">/ {w.subCategory}</span>}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs max-w-[200px] truncate" title={w.aliases || ''}>{w.aliases || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-xs ${i < w.difficulty ? 'text-amber-400' : 'text-white/20'}`}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {w.embedding ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white/30 text-xs">×</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => toggle(w)} 
                        className={`px-2 py-0.5 rounded text-xs transition-colors ${w.enabled ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                      >
                        {w.enabled ? '已启用' : '已禁用'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3 text-xs font-medium">
                        <button onClick={() => setEditing(w)} className="text-brand-light hover:text-white transition-colors">编辑</button>
                        {!w.embedding && (
                          <button onClick={() => genEmbedding(w.id)} className="text-amber-400 hover:text-amber-300 transition-colors">生成向量</button>
                        )}
                        <button onClick={() => remove(w.id)} className="text-rose-400 hover:text-rose-300 transition-colors">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-white/40">暂无词条数据</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <span className="bg-white/5 px-3 py-1.5 rounded-lg">共 {total} 条</span>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md px-3 py-1.5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">上一页</button>
              <span className="px-2 font-mono">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md px-3 py-1.5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">下一页</button>
            </div>
          </div>
        </div>

        {/* 编辑弹窗 */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1b30] shadow-2xl overflow-hidden animate-pop-in" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white/90">{editing.id ? '编辑词条' : '新增词条'}</h3>
                <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white transition-colors">✕</button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {([
                    ['word', '词 *'],
                    ['category', '分类 *'],
                    ['subCategory', '子分类'],
                    ['aliases', '别名(用|分隔)'],
                    ['similarWords', '相似词(松树:72|榕树 或 JSON)'],
                    ['hint1', '提示一'],
                    ['hint2', '提示二'],
                    ['hint3', '提示三'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className={key === 'word' || key === 'category' ? '' : 'col-span-2'}>
                      <span className="text-white/50 text-xs mb-1 block">{label}</span>
                      <input
                        value={(editing[key] as string) ?? ''}
                        onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 focus:outline-none focus:border-brand transition-colors text-white/90"
                      />
                    </label>
                  ))}
                  
                  <label>
                    <span className="text-white/50 text-xs mb-1 block">难度 (1-5)</span>
                    <input type="number" min={1} max={5} value={editing.difficulty ?? 1} onChange={(e) => setEditing({ ...editing, difficulty: +e.target.value })} className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 focus:outline-none focus:border-brand transition-colors text-white/90" />
                  </label>
                  
                  <label className="flex items-center gap-3 mt-5 p-2 rounded-xl border border-white/5 bg-white/5 cursor-pointer">
                    <div className="relative inline-block w-10 h-5">
                      <input type="checkbox" className="peer sr-only" checked={editing.enabled ?? true} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} />
                      <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                    <span className="text-white/80 font-medium">启用状态</span>
                  </label>
                </div>
                
                <div className="mt-8 flex justify-end gap-3">
                  <button onClick={() => setEditing(null)} className="rounded-xl bg-white/5 hover:bg-white/10 px-5 py-2.5 font-medium transition-colors">取消</button>
                  <button onClick={save} className="rounded-xl bg-brand hover:bg-brand-light px-6 py-2.5 font-bold shadow-lg shadow-brand/20 transition-colors">保存词条</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
