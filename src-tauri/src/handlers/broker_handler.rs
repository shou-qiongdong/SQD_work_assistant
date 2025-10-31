use crate::config::AppState;
use crate::services::BrokerService;
use crate::utils::AppResult;
use tauri::State;

/// 获取券商池命令
#[tauri::command]
pub fn get_broker_pool(state: State<AppState>) -> AppResult<Vec<String>> {
    BrokerService::get_pool(&state.pool)
}
