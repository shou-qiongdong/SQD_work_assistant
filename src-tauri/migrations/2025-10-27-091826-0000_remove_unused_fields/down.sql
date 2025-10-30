-- 恢复 description, due_date, tags 字段

-- 1. 创建包含所有字段的新表
CREATE TABLE todos_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    broker TEXT NOT NULL,
    due_date TEXT,
    tags TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. 复制数据
INSERT INTO todos_new (id, title, status, broker, created_at, updated_at)
SELECT id, title, status, broker, created_at, updated_at
FROM todos;

-- 3. 删除旧表
DROP TABLE todos;

-- 4. 重命名新表
ALTER TABLE todos_new RENAME TO todos;
