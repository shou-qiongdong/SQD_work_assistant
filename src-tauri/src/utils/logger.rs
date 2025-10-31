use std::sync::Mutex;
use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

static GUARD: Mutex<Option<WorkerGuard>> = Mutex::new(None);

pub fn init_logger(app_data_dir: &std::path::Path) {
    // 创建日志目录
    let log_dir = app_data_dir.join("logs");
    std::fs::create_dir_all(&log_dir).expect("Failed to create log directory");

    // 创建日志文件
    let file_appender = tracing_appender::rolling::daily(&log_dir, "app.log");
    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

    // 保存 guard 防止被 drop
    *GUARD.lock().unwrap() = Some(guard);

    // 配置日志格式
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,tauri_app=debug"));

    // 创建文件日志层
    let file_layer = fmt::layer()
        .with_writer(non_blocking)
        .with_ansi(false)
        .with_target(true)
        .with_thread_ids(true)
        .with_line_number(true)
        .with_file(true);

    // 创建控制台日志层
    let console_layer = fmt::layer()
        .with_target(true)
        .with_line_number(true)
        .with_file(true);

    // 组合所有层
    tracing_subscriber::registry()
        .with(env_filter)
        .with(file_layer)
        .with(console_layer)
        .init();

    tracing::info!("Logger initialized, logs directory: {:?}", log_dir);
}

// 用于前端日志的命令
#[tauri::command]
pub fn log_from_frontend(level: String, message: String, context: Option<String>) {
    let ctx = context.unwrap_or_default();
    match level.as_str() {
        "error" => tracing::error!(target: "frontend", context = %ctx, "{}", message),
        "warn" => tracing::warn!(target: "frontend", context = %ctx, "{}", message),
        "info" => tracing::info!(target: "frontend", context = %ctx, "{}", message),
        "debug" => tracing::debug!(target: "frontend", context = %ctx, "{}", message),
        _ => tracing::trace!(target: "frontend", context = %ctx, "{}", message),
    }
}
