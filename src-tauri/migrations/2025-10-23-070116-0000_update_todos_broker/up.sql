-- 添加 broker 列（临时允许为空）
ALTER TABLE todos ADD COLUMN broker TEXT;

-- 将现有数据的 broker 设置为默认值
UPDATE todos SET broker = '未分类' WHERE broker IS NULL;

-- 删除 priority 列（SQLite 不支持直接删除列，需要重建表）
-- 创建新表
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

-- 复制数据
INSERT INTO todos_new (id, title, description, status, broker, due_date, tags, created_at, updated_at)
SELECT id, title, description, status, COALESCE(broker, '未分类'), due_date, tags, created_at, updated_at
FROM todos;

-- 删除旧表
DROP TABLE todos;

-- 重命名新表
ALTER TABLE todos_new RENAME TO todos;
