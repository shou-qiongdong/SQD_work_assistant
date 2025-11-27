-- 添加 conclusion 字段到 todos 表
ALTER TABLE todos ADD COLUMN conclusion TEXT NOT NULL DEFAULT '';
