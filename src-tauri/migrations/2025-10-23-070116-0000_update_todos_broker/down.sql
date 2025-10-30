-- 回滚：添加 priority 列，删除 broker 列
-- 创建带 priority 的新表
CREATE TABLE todos_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    due_date TEXT,
    tags TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 复制数据（broker 映射回 priority，使用默认值 'medium'）
INSERT INTO todos_new (id, title, description, status, priority, due_date, tags, created_at, updated_at)
SELECT id, title, description, status, 'medium', due_date, tags, created_at, updated_at
FROM todos;

-- 删除当前表
DROP TABLE todos;

-- 重命名新表
ALTER TABLE todos_new RENAME TO todos;
