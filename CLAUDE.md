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

### 前端结构（遵循 Vue3 最佳实践）
```
src/
├── api/                     # API 调用层
│   └── index.ts            # 封装所有 Tauri 命令
├── assets/                  # 静态资源
├── components/              # 可复用组件
│   ├── TimeRangeSelector.vue
│   ├── StatsSummaryCards.vue
│   ├── TimeTrendChart.vue
│   ├── StatusChart.vue
│   ├── BrokerChart.vue
│   ├── BrokerDetailPanel.vue
│   └── ReportSection.vue
├── composables/             # 组合式函数
│   ├── useStatsData.ts     # 统计数据计算逻辑
│   └── useReportExport.ts  # 报告导出逻辑
├── store/                   # Pinia 状态管理
│   ├── todo.ts             # Todo 状态
│   └── broker.ts           # Broker 状态
├── styles/                  # 全局样式
│   ├── variables.css       # CSS 变量（主题色、间距等）
│   └── global.css          # 全局样式和工具类
├── types/                   # TypeScript 类型定义
│   └── todo.ts
├── utils/                   # 工具函数
│   └── logger.ts           # 日志工具
├── views/                   # 页面组件
│   ├── AppContent.vue      # 主页面
│   ├── StatsView.vue       # 统计页面
│   └── QuickAdd.vue        # 快速添加页面
├── App.vue                  # 根组件（NMessageProvider 包装器）
├── main.ts                 # 主入口
├── stats.ts                # 统计页面入口
└── quick-add.ts            # 快速添加页面入口
```

### 后端结构（遵循分层架构）
```
src-tauri/src/
├── config/                  # 配置模块
│   ├── mod.rs
│   ├── app_state.rs        # 应用全局状态
│   └── constants.rs        # 常量定义（窗口尺寸等）
├── db/                      # 数据库层
│   ├── mod.rs
│   ├── connection.rs       # 数据库连接池管理
│   ├── models.rs           # Diesel ORM 模型
│   └── schema.rs           # 数据库 schema（Diesel 自动生成）
├── dto/                     # 数据传输对象
│   ├── mod.rs
│   └── todo_dto.rs         # Todo 相关 DTO
├── handlers/                # Tauri 命令处理器（API 层）
│   ├── mod.rs
│   ├── todo_handler.rs     # Todo 命令处理
│   └── broker_handler.rs   # Broker 命令处理
├── services/                # 业务逻辑层
│   ├── mod.rs
│   ├── todo_service.rs     # Todo 业务逻辑
│   └── broker_service.rs   # Broker 业务逻辑
├── utils/                   # 工具模块
│   ├── mod.rs
│   ├── error.rs            # 错误处理
│   ├── logger.rs           # 日志配置
│   └── validation.rs       # 输入验证
├── window/                  # 窗口管理
│   ├── mod.rs
│   └── manager.rs          # 窗口创建和管理
├── lib.rs                  # 库入口，应用设置
└── main.rs                 # 程序入口
```

### 架构说明

**前端分层**：
- **api/**: 封装所有后端调用，统一管理 Tauri 命令
- **components/**: 小而专注的可复用组件
- **composables/**: 提取可复用的响应式逻辑
- **store/**: 集中式状态管理
- **views/**: 页面级组件
- **styles/**: 全局样式和 CSS 变量

**后端分层**：
- **handlers/**: 处理 Tauri 命令，负责参数解析和响应格式化
- **services/**: 核心业务逻辑，与具体框架解耦
- **db/**: 数据访问层，封装数据库操作
- **dto/**: 定义前后端交互的数据结构
- **config/**: 应用配置和常量
- **utils/**: 通用工具函数
- **window/**: 窗口管理逻辑

## 开发命令
- `pnpm tauri dev` - 开发模式
- `pnpm tauri build` - 构建应用
