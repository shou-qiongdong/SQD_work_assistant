-- 回滚：将 conclusion 字段改回 NOT NULL
CREATE TABLE todos_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    broker TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    conclusion TEXT NOT NULL DEFAULT ''
);

INSERT INTO todos_new (id, title, status, broker, created_at, updated_at, conclusion)
SELECT id, title, status, broker, created_at, updated_at,
       COALESCE(conclusion, '')
FROM todos;

DROP TABLE todos;
ALTER TABLE todos_new RENAME TO todos;
