-- 将 conclusion 字段改为可空
-- SQLite 不支持 ALTER COLUMN，需要重建表

-- 1. 创建新表
CREATE TABLE todos_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    broker TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    conclusion TEXT
);

-- 2. 复制数据
INSERT INTO todos_new (id, title, status, broker, created_at, updated_at, conclusion)
SELECT id, title, status, broker, created_at, updated_at,
       CASE WHEN conclusion = '' THEN NULL ELSE conclusion END
FROM todos;

-- 3. 删除旧表
DROP TABLE todos;

-- 4. 重命名新表
ALTER TABLE todos_new RENAME TO todos;
