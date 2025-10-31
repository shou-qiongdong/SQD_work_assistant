// 模块声明
mod config;
mod db;
mod dto;
mod handlers;
mod services;
mod utils;
mod window;

use config::AppState;
use db::establish_connection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use tauri::Manager;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use window::{create_or_show_quick_add_window, create_or_show_stats_window};

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    // 阻止默认关闭行为
                    api.prevent_close();
                    // 隐藏窗口到托盘
                    let _ = window.hide();
                    tracing::info!("Main window hidden to tray");
                }
            }
        })
        .setup(|app| {
            // 获取应用数据目录
            let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");

            // 初始化日志系统
            utils::init_logger(&app_dir);
            tracing::info!("Application starting...");
            tracing::info!("App data directory: {:?}", app_dir);

            let db_path = app_dir.join("database.db");
            let database_url = db_path.to_str().expect("Invalid database path");

            tracing::info!("Database path: {}", database_url);

            // 建立数据库连接池
            let pool = establish_connection(database_url);

            // 运行 Diesel 迁移
            match pool.get()
                .expect("Failed to get connection")
                .run_pending_migrations(MIGRATIONS)
            {
                Ok(_) => tracing::info!("Migrations applied successfully"),
                Err(e) => {
                    // 如果表已存在，仅记录警告而不是崩溃
                    tracing::warn!("Migration warning (table may already exist): {}", e);
                }
            }

            let app_state = AppState { pool };
            app.manage(app_state);

            // 注册全局快捷键
            let app_handle = app.handle().clone();
            app.global_shortcut().on_shortcut("CommandOrControl+Shift+N", move |_app, _event, _shortcut| {
                tracing::info!("Global shortcut triggered: CommandOrControl+Shift+N");
                create_or_show_quick_add_window(&app_handle);
            }).expect("Failed to register global shortcut");

            // 创建托盘菜单
            let show_item = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
            let stats_item = MenuItem::with_id(app, "stats", "数据统计", true, None::<&str>)?;
            let quick_add_item = MenuItem::with_id(app, "quick_add", "快速添加", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[
                &show_item,
                &stats_item,
                &quick_add_item,
                &separator,
                &quit_item,
            ])?;

            // 构建托盘图标
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("SQD 工作助手")
                .on_menu_event(move |app, event| {
                    match event.id.as_ref() {
                        "show" => {
                            tracing::info!("Tray menu: Show main window");
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.unminimize();
                            }
                        }
                        "stats" => {
                            tracing::info!("Tray menu: Stats view");
                            create_or_show_stats_window(app);
                        }
                        "quick_add" => {
                            tracing::info!("Tray menu: Quick add");
                            create_or_show_quick_add_window(app);
                        }
                        "quit" => {
                            tracing::info!("Tray menu: Quit");
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // 监听 macOS Dock 图标点击事件
            #[cfg(target_os = "macos")]
            {
                use tauri::ActivationPolicy;
                app.set_activation_policy(ActivationPolicy::Regular);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            handlers::create_todo,
            handlers::get_todos,
            handlers::update_todo,
            handlers::delete_todo,
            handlers::search_todos,
            handlers::get_broker_pool,
            utils::logger::log_from_frontend,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            // macOS 专用：监听应用激活事件
            #[cfg(target_os = "macos")]
            {
                if let tauri::RunEvent::Reopen { .. } = event {
                    tracing::info!("macOS Reopen event triggered (Dock icon clicked when hidden)");
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.unminimize();
                        tracing::info!("Main window shown via Dock icon (reopen)");
                    }
                }
            }
        });
}
