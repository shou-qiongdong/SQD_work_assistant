use crate::config::constants::*;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

/// 创建或显示快速添加窗口
pub fn create_or_show_quick_add_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("quick-add") {
        tracing::debug!("Quick-add window already exists, showing it");
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        tracing::debug!("Creating new quick-add window");
        match WebviewWindowBuilder::new(
            app,
            "quick-add",
            WebviewUrl::App("quick-add.html".into())
        )
        .title("")
        .inner_size(QUICK_ADD_WIDTH, QUICK_ADD_HEIGHT)
        .resizable(false)
        .always_on_top(true)
        .center()
        .decorations(false)
        .build() {
            Ok(_) => tracing::info!("Quick-add window created successfully"),
            Err(e) => tracing::error!("Failed to create quick-add window: {}", e),
        }
    }
}

/// 创建或显示统计窗口
pub fn create_or_show_stats_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("stats") {
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        let _ = WebviewWindowBuilder::new(
            app,
            "stats",
            WebviewUrl::App("stats.html".into())
        )
        .title("数据统计")
        .inner_size(STATS_WIDTH, STATS_HEIGHT)
        .resizable(true)
        .center()
        .build();
    }
}
