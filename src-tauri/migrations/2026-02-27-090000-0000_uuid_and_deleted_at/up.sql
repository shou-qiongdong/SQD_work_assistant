-- 为 todos 表引入 UUID 主键与 deleted_at
-- SQLite 需要重建表

CREATE TABLE todos_new (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    broker TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    conclusion TEXT,
    deleted_at TEXT
);

INSERT INTO todos_new (
    id,
    title,
    status,
    broker,
    created_at,
    updated_at,
    conclusion,
    deleted_at
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    lower(hex(randomblob(6))),
    trim(title),
    status,
    trim(broker),
    replace(created_at, ' ', 'T') || 'Z',
    replace(updated_at, ' ', 'T') || 'Z',
    NULLIF(trim(conclusion), ''),
    NULL
FROM todos;

DROP TABLE todos;
ALTER TABLE todos_new RENAME TO todos;
