# SQD 工作助手

## 项目状态
✅ **开发完成** - 核心功能已实现并测试通过，应用可以正常使用

## 项目概述
一个基于 Tauri + Vue3 的桌面工作助手应用，专注于任务管理。

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **包管理器**: pnpm
- **UI 组件库**: NaiveUI（待安装）
- **样式**: UnoCSS（待安装）
- **状态管理**: Pinia（待安装）
- **路由**: Vue Router（待安装）

### 后端
- **框架**: Tauri 2.8
- **数据库**: SQLite
- **ORM**: Diesel（待配置）
- **序列化**: serde + serde_json
- **日期时间**: chrono（待添加）

## 功能模块（MVP）

### 待办事项管理
- [ ] 添加/删除/编辑任务
- [ ] 任务优先级（高/中/低）
- [ ] 任务状态（待办/进行中/已完成）
- [ ] 标签系统
- [ ] 截止日期
- [ ] 任务搜索/过滤

## 数据库设计

### todos 表
```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,          -- pending, in_progress, completed
    priority TEXT NOT NULL,         -- high, medium, low
    due_date TEXT,
    tags TEXT,                      -- JSON 数组存储
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

## 开发进度

### 已完成 ✅
- [x] 初始化 Tauri + Vue3 项目
- [x] 安装基础依赖（NaiveUI、UnoCSS、Pinia）
- [x] 配置 Diesel + SQLite
- [x] 创建数据库表和迁移
- [x] 实现后端 CRUD API（带日志）
- [x] 配置前端（NaiveUI + UnoCSS + Pinia）
- [x] 实现待办事项完整界面
- [x] 修复白屏问题（NMessageProvider 架构调整）
- [x] 添加日志输出用于调试
- [x] 拆分组件架构（App.vue + AppContent.vue）
- [x] 全功能测试通过

### 完整功能 🎉
- ✅ 任务增删改查（CRUD）
- ✅ 任务状态管理（待办/进行中/已完成）
- ✅ 任务优先级设置（高/中/低）
- ✅ 任务搜索功能
- ✅ 按状态过滤
- ✅ 按优先级过滤
- ✅ 快速勾选完成
- ✅ 标签系统
- ✅ 截止日期
- ✅ 数据持久化（SQLite）
- ✅ 完整的错误处理和提示

### 技术亮点
- 前后端日志输出便于调试
- 数据库自动创建和迁移
- 类型安全的 Rust + TypeScript
- 响应式 UI 设计
- NMessageProvider 架构：App.vue 作为 Provider 包装器，AppContent.vue 处理业务逻辑
- 完整的错误处理和用户提示系统

### 可选优化
- [ ] 添加暗色主题切换
- [ ] 添加日期选择器组件
- [ ] 任务排序（拖拽）
- [ ] 数据导出（JSON/CSV）
- [ ] 键盘快捷键
- [ ] 任务统计面板

## 项目结构
```
.
├── src/                      # Vue 前端代码
│   ├── App.vue              # NMessageProvider 包装器
│   ├── components/
│   │   └── AppContent.vue   # 主应用逻辑和 UI
│   ├── stores/
│   │   └── todo.ts          # Pinia 状态管理
│   ├── types/
│   │   └── todo.ts          # TypeScript 类型定义
│   └── main.ts              # 入口文件
├── src-tauri/               # Tauri Rust 后端
│   ├── src/
│   │   ├── lib.rs           # 主入口，数据库设置
│   │   ├── commands.rs      # Tauri 命令（CRUD API）
│   │   ├── models.rs        # Diesel 模型
│   │   ├── schema.rs        # 数据库 schema
│   │   └── db.rs            # 数据库连接池
│   ├── Cargo.toml           # Rust 依赖
│   └── tauri.conf.json      # Tauri 配置
├── uno.config.ts            # UnoCSS 配置
├── vite.config.ts           # Vite 配置
└── package.json             # 前端依赖
```

## 开发命令
- `pnpm tauri dev` - 开发模式
- `pnpm tauri build` - 构建应用
