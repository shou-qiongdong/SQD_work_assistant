use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};

use crate::utils::{AppError, AppResult};

pub const DEFAULT_API_BASE: &str = "https://47.108.156.226:1980/assistant/api";
const CONFIG_FILE: &str = "assistant_api.json";

#[derive(Debug, Serialize, Deserialize)]
struct ApiConfig {
    api_base: String,
}

fn config_path(app: &AppHandle) -> AppResult<PathBuf> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| AppError::Config(format!("Failed to resolve config dir: {}", e)))?;
    Ok(dir.join(CONFIG_FILE))
}

fn normalize_api_base(value: &str) -> String {
    value.trim().trim_end_matches('/').to_string()
}

pub fn load_api_base(app: &AppHandle) -> String {
    let path = match config_path(app) {
        Ok(path) => path,
        Err(err) => {
            tracing::warn!("Failed to resolve config path: {}", err);
            return DEFAULT_API_BASE.to_string();
        }
    };

    let content = match fs::read_to_string(&path) {
        Ok(content) => content,
        Err(_) => return DEFAULT_API_BASE.to_string(),
    };

    let config: ApiConfig = match serde_json::from_str(&content) {
        Ok(config) => config,
        Err(err) => {
            tracing::warn!("Failed to parse api config: {}", err);
            return DEFAULT_API_BASE.to_string();
        }
    };

    let normalized = normalize_api_base(&config.api_base);
    if normalized.is_empty() {
        DEFAULT_API_BASE.to_string()
    } else {
        normalized
    }
}

pub fn save_api_base(app: &AppHandle, api_base: &str) -> AppResult<String> {
    let path = config_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| AppError::Config(format!("Failed to create config dir: {}", e)))?;
    }

    let normalized = normalize_api_base(api_base);
    let value = if normalized.is_empty() {
        DEFAULT_API_BASE.to_string()
    } else {
        normalized
    };

    let config = ApiConfig {
        api_base: value.clone(),
    };
    let payload = serde_json::to_string_pretty(&config)
        .map_err(|e| AppError::Config(format!("Failed to serialize config: {}", e)))?;
    fs::write(&path, payload)
        .map_err(|e| AppError::Config(format!("Failed to write config: {}", e)))?;

    Ok(value)
}
