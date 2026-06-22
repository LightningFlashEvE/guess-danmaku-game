import { Router } from 'express';
import multer from 'multer';
import { asyncHandler, ok, fail } from '../../utils/http.js';
import { wordsService } from './words.service.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const wordsRouter = Router();

function bool(v: unknown): boolean | undefined {
  if (v === undefined) return undefined;
  if (v === 'true' || v === true) return true;
  if (v === 'false' || v === false) return false;
  return undefined;
}

function int(v: unknown): number | undefined {
  if (v === undefined || v === '') return undefined;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : undefined;
}

wordsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, difficultyMin, difficultyMax, enabled, search, page, pageSize } = req.query;
    const result = await wordsService.list({
      category: category ? String(category) : undefined,
      difficultyMin: int(difficultyMin),
      difficultyMax: int(difficultyMax),
      enabled: bool(enabled),
      search: search ? String(search) : undefined,
      page: int(page),
      pageSize: int(pageSize),
    });
    ok(res, result);
  }),
);

wordsRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    ok(res, await wordsService.categories());
  }),
);

wordsRouter.get(
  '/export-csv',
  asyncHandler(async (_req, res) => {
    const csv = await wordsService.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="words.csv"');
    res.send('\ufeff' + csv);
  }),
);

wordsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { word, category } = req.body ?? {};
    if (!word || !category) return fail(res, 'word 和 category 不能为空');
    const created = await wordsService.create(req.body);
    ok(res, created, '已新增词条');
  }),
);

wordsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const updated = await wordsService.update(req.params.id, req.body ?? {});
    ok(res, updated, '已更新词条');
  }),
);

wordsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await wordsService.remove(req.params.id);
    ok(res, { id: req.params.id }, '已删除词条');
  }),
);

wordsRouter.post(
  '/:id/toggle',
  asyncHandler(async (req, res) => {
    const enabled = bool(req.body?.enabled) ?? true;
    const updated = await wordsService.toggle(req.params.id, enabled);
    ok(res, updated);
  }),
);

wordsRouter.post(
  '/:id/generate-embedding',
  asyncHandler(async (req, res) => {
    const updated = await wordsService.generateEmbedding(req.params.id);
    ok(res, { id: updated.id, hasEmbedding: !!updated.embedding }, 'embedding 已生成');
  }),
);

wordsRouter.post(
  '/batch-generate-embedding',
  asyncHandler(async (req, res) => {
    const onlyMissing = bool(req.body?.onlyMissing) ?? true;
    const result = await wordsService.batchGenerateEmbedding(onlyMissing);
    ok(res, result, '批量生成完成');
  }),
);

wordsRouter.post(
  '/import-csv',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    let csv = '';
    if (req.file) {
      csv = req.file.buffer.toString('utf-8');
    } else if (req.body?.csv) {
      csv = String(req.body.csv);
    }
    if (!csv.trim()) return fail(res, '未提供 CSV 内容（字段 file 或 csv）');
    const result = await wordsService.importCsv(csv);
    ok(res, result, '导入完成');
  }),
);
