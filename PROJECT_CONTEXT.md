# SQD 工作助手（AI 项目信息）

## 一句话概述
基于 Tauri 2 + Vue 3 的桌面工作助手，围绕“券商维度的任务管理 + 数据统计 + 报告导出”。

## 现有功能
- 任务管理（CRUD）：title / status / broker / conclusion（完成结论）
- 状态流转：pending → in_progress → completed（完成时需填写结论）→ pending
- 搜索与过滤：状态、券商（多选）、创建/更新时间范围
- 快速添加：独立窗口 + 全局快捷键 `Cmd/Ctrl+Shift+N` + 托盘菜单入口
- 数据统计：时间趋势、状态分布、券商分布（ECharts）
- 报告导出：日报/周报/自定义区间导出 Markdown / TXT
- 日志：前端日志统一送到后端文件（tracing）

## 技术栈
- 前端：Vue 3 + TypeScript + Vite
- 状态管理：Pinia
- UI：Naive UI + UnoCSS
- 图表：ECharts + vue-echarts
- 后端：Tauri 2 + Rust
- 数据库：SQLite + Diesel + diesel_migrations
- 其它：tauri-plugin-opener / tauri-plugin-global-shortcut / tracing

## 多窗口入口
- `index.html` → `src/main.ts`（主窗口，AppContent）
- `stats.html` → `src/stats.ts`（统计窗口，StatsView）
- `quick-add.html` → `src/quick-add.ts`（快速添加窗口，QuickAdd）
- 窗口创建与显示：`src-tauri/src/window/manager.rs`

## 数据模型（SQLite）
表：`todos`
- `id` (TEXT, UUID PK)
- `title` (TEXT)
- `status` (TEXT: pending / in_progress / completed)
- `broker` (TEXT)
- `created_at` (TEXT, ISO 8601 UTC)
- `updated_at` (TEXT, ISO 8601 UTC)
- `conclusion` (TEXT, NULLABLE)
- `deleted_at` (TEXT, NULLABLE)

## Tauri 命令
- `create_todo` / `get_todos` / `update_todo` / `delete_todo` / `search_todos`
- `get_todos_updated_after` / `upsert_todos`（同步用）
- `get_broker_pool`
- `log_from_frontend`

## 前后端事件
- `refresh-todos`：QuickAdd 发出，主窗口监听并刷新任务 + 券商池

## 目录速览
- `src/` 前端（views/components/store/api/utils/composables）
- `src-tauri/src/` 后端（handlers/services/db/utils/window）
- `src-tauri/migrations/` Diesel 迁移

## 开发命令
- `pnpm install`
- `pnpm dev`（Vite 前端）
- `pnpm tauri dev`（Tauri 桌面开发）
- `pnpm build`（vue-tsc + Vite 构建）
- `cargo run --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `cargo fmt`

## 数据与迁移说明
- 数据库文件位于 Tauri `app_data_dir` 的 `database.db`（运行时自动创建）
- 启动时自动执行 `src-tauri/migrations/` 中的迁移
- Diesel schema：`src-tauri/src/schema.rs`

## 常见入口文件
- 主业务 UI：`src/views/AppContent.vue`
- 统计页：`src/views/StatsView.vue`
- 快速添加：`src/views/QuickAdd.vue`
- Tauri 启动：`src-tauri/src/lib.rs`
