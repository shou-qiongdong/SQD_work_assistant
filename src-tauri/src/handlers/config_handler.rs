use tauri::AppHandle;

use crate::config::api_base;
use crate::utils::AppResult;

/// 获取 API 基础地址
#[tauri::command]
pub fn get_api_base(app: AppHandle) -> AppResult<String> {
    Ok(api_base::load_api_base(&app))
}

/// 设置 API 基础地址
#[tauri::command]
pub fn set_api_base(app: AppHandle, api_base: String) -> AppResult<String> {
    api_base::save_api_base(&app, &api_base)
}
