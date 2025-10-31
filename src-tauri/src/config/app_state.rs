use crate::db::DbPool;

/// 应用全局状态
pub struct AppState {
    pub pool: DbPool,
}
