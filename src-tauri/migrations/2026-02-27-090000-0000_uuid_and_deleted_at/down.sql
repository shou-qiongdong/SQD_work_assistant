-- 回滚到旧结构（注意：UUID 会丢失）

CREATE TABLE todos_old (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    broker TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    conclusion TEXT
);

INSERT INTO todos_old (title, status, broker, created_at, updated_at, conclusion)
SELECT
    title,
    status,
    broker,
    replace(created_at, 'T', ' '),
    replace(updated_at, 'T', ' '),
    conclusion
FROM todos
WHERE deleted_at IS NULL;

DROP TABLE todos;
ALTER TABLE todos_old RENAME TO todos;
