-- SQLite 不支持直接 DROP COLUMN，需要重建表
CREATE TABLE todos_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    broker TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

INSERT INTO todos_new (id, title, status, broker, created_at, updated_at)
SELECT id, title, status, broker, created_at, updated_at
FROM todos;

DROP TABLE todos;
ALTER TABLE todos_new RENAME TO todos;
