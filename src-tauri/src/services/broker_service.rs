use crate::db::{get_connection, DbPool, todos};
use crate::utils::AppResult;
use diesel::prelude::*;

/// Broker 业务逻辑服务
pub struct BrokerService;

impl BrokerService {
    /// 获取所有券商（去重）
    pub fn get_pool(pool: &DbPool) -> AppResult<Vec<String>> {
        tracing::info!("BrokerService::get_pool");
        let mut conn = get_connection(pool)?;

        let brokers = todos::table
            .select(todos::broker)
            .distinct()
            .load::<String>(&mut conn)?;

        tracing::info!("Retrieved {} brokers", brokers.len());
        Ok(brokers)
    }
}
