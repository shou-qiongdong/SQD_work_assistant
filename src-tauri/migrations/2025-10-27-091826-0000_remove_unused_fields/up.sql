-- 删除 description, due_date, tags 字段
-- SQLite 不支持直接 DROP COLUMN，需要重建表

-- 1. 创建新表
CREATE TABLE todos_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    broker TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. 复制数据（只保留需要的字段）
INSERT INTO todos_new (id, title, status, broker, created_at, updated_at)
SELECT id, title, status, broker, created_at, updated_at
FROM todos;

-- 3. 删除旧表
DROP TABLE todos;

-- 4. 重命名新表
ALTER TABLE todos_new RENAME TO todos;
