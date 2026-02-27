use crate::config::AppState;
use crate::db::Todo;
use crate::dto::{CreateTodoInput, UpdateTodoInput, DeleteTodoInput, SearchTodoInput};
use crate::services::TodoService;
use crate::utils::AppResult;
use tauri::State;
use crate::db::Todo;

/// 创建 Todo 命令
#[tauri::command]
pub fn create_todo(
    state: State<AppState>,
    title: String,
    status: String,
    broker: String,
    conclusion: Option<String>,
) -> AppResult<Todo> {
    let input = CreateTodoInput { title, status, broker, conclusion };
    TodoService::create(&state.pool, input)
}

/// 获取所有 Todos 命令
#[tauri::command]
pub fn get_todos(state: State<AppState>) -> AppResult<Vec<Todo>> {
    TodoService::get_all(&state.pool)
}

/// 更新 Todo 命令
#[tauri::command]
pub fn update_todo(
    state: State<AppState>,
    input: UpdateTodoInput,
) -> AppResult<Todo> {
    TodoService::update(&state.pool, input)
}

/// 删除 Todo 命令
#[tauri::command]
pub fn delete_todo(
    state: State<AppState>,
    input: DeleteTodoInput,
) -> AppResult<()> {
    TodoService::delete(&state.pool, input)
}

/// 搜索 Todos 命令
#[tauri::command]
pub fn search_todos(state: State<AppState>, query: String) -> AppResult<Vec<Todo>> {
    let input = SearchTodoInput { query };
    TodoService::search(&state.pool, input)
}

/// 获取增量变更（包含已删除）
#[tauri::command]
pub fn get_todos_updated_after(
    state: State<AppState>,
    updated_after: Option<String>,
) -> AppResult<Vec<Todo>> {
    TodoService::get_updated_after(&state.pool, updated_after)
}

/// 批量 upsert（用于同步）
#[tauri::command]
pub fn upsert_todos(
    state: State<AppState>,
    todos: Vec<Todo>,
) -> AppResult<()> {
    TodoService::upsert_batch(&state.pool, todos)
}
