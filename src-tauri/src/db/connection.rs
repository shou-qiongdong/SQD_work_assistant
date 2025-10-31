use diesel::r2d2::{self, ConnectionManager, Pool};
use diesel::sqlite::SqliteConnection;
use crate::utils::error::{AppError, AppResult};

pub type DbPool = Pool<ConnectionManager<SqliteConnection>>;

/// 建立数据库连接池
pub fn establish_connection(database_url: &str) -> DbPool {
    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
    r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.")
}

/// 从连接池获取数据库连接
pub fn get_connection(pool: &DbPool) -> AppResult<r2d2::PooledConnection<ConnectionManager<SqliteConnection>>> {
    pool.get().map_err(|e| AppError::PoolError(e.to_string()))
}
