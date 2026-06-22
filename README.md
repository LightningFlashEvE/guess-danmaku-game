# 弹幕猜词语义相似度游戏

适用于直播间的「弹幕猜词」互动游戏。主播开启一轮后系统随机出隐藏词，观众通过弹幕猜词，系统实时计算语义相似度并展示排行榜、积分与段位，可直接作为 OBS 浏览器源。

## 技术栈

- 前端：React + TypeScript + Vite + Tailwind CSS + Zustand + Socket.IO Client
- 后端：Node.js + TypeScript + Express + Socket.IO + Prisma + SQLite
- AI/NLP：Embedding Provider 可切换（mock / OpenAI 兼容 / 本地），cosine similarity

> 说明：后端按文档「NestJS 或 Express」二选一，选用 **Express**（更轻量、Windows 一键运行），并保持清晰的模块/服务分层。

## 目录结构

```
apps/
  web/      前端（OBS 展示页 / 控制台 / 词库管理 / 调试弹幕）
  server/   后端（game / words / players / guesses / ranking / embedding / danmaku / config）
data/       示例词库 CSV
```

## 快速开始（Windows）

```bash
# 1. 安装依赖（仓库根目录）
pnpm install

# 2. 准备环境变量
copy .env.example apps\server\.env   # 已内置一份，可直接使用

# 3. 初始化数据库 + 导入示例词库（含 mock embedding）
pnpm db:push
pnpm db:seed

# 4. 同时启动前后端
pnpm dev
```

- 后端：http://localhost:3001
- 前端：http://localhost:5173

## 页面

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| OBS 展示页 | `/obs` | OBS 浏览器源，竖屏布局，`/obs?transparent=1` 透明背景 |
| 主播控制台 | `/admin` | 开始/结束/跳过、出题设置、模拟弹幕、配置 |
| 词库管理 | `/admin/words` | 增删改查、启用禁用、CSV 导入导出、生成 embedding |
| 调试弹幕 | `/debug/danmaku` | 模拟观众弹幕，验证游戏逻辑 |

## 抖音弹幕接入（第一阶段重点）

第一目标平台为抖音。真实采集程序作为**外部模块**，采集后调用以下接口（不在 GameService 内写采集逻辑）。

弹幕入口：

```bash
curl -X POST http://localhost:3001/api/danmaku/ingest \
  -H "Content-Type: application/json" \
  -H "x-ingest-token: dev-token" \
  -d '{"platform":"douyin","roomId":"123456","platformUid":"user001","nickname":"测试用户","content":"松树","messageType":"comment","timestamp":1710000000000}'
```

礼物入口（MVP 仅记录 GiftEvent，预留贡献榜，不影响猜词）：

```bash
curl -X POST http://localhost:3001/api/danmaku/gift \
  -H "Content-Type: application/json" \
  -H "x-ingest-token: dev-token" \
  -d '{"platform":"douyin","platformUid":"user001","nickname":"测试用户","giftName":"小心心","giftCount":1,"giftValue":1}'
```

- token 通过 `apps/server/.env` 的 `INGEST_TOKEN` 配置（默认 `dev-token`）。
- B站/快手等仅预留 `DanmakuAdapter` 占位，第一阶段不实现真实接入。

## 接近度算法（猜盐风格）

最终接近度 = `max(答案命中=100, 别名命中=98, 人工相似词分, 归一化 embedding 分)`，返回 0~100 保留 1 位小数。

- `Word.similarWords` 支持 `松树:72|榕树|柏树:66` 或 JSON `{"松树":68}`（仅词无分数默认 70）。
- embedding 分数经 `normalizeEmbeddingScore` 归一化，避免无关词轻易超过 50%。

## 防刷限流

同一用户每秒最多 1 条、每 10 秒最多 5 条、3 秒内重复内容只处理一次、全局每秒最多 200 条；同一玩家本轮同一词只计一次，排行榜按接近度降序、平局按时间升序、取前 15 名。

## OBS query 参数

`/obs?transparent=1` 透明背景、`/obs?scale=0.85` 整体缩放、`/obs?platform=douyin&roomId=123456` 标识房间。

## 切换为真实 Embedding

编辑 `apps/server/.env`：

```env
EMBEDDING_PROVIDER=openai
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_API_KEY=sk-xxx
EMBEDDING_MODEL=text-embedding-3-small
```

重启后端，并在词库管理页点击「批量生成 embedding」重新生成向量即可。

## 测试

```bash
pnpm --filter server test
```

覆盖：cosineSimilarity / cleanDanmakuText / extractGuessWord / calculateRankName / 积分结算逻辑。

## 后续扩展

- 真实弹幕接入：实现 `DanmakuAdapter`（已预留 bilibili / douyin 占位）
- 礼物系统、多房间系统、PostgreSQL、Docker 部署
