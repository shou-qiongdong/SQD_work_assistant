use crate::config::AppState;
use crate::db::Todo;
use crate::dto::{CreateTodoInput, UpdateTodoInput, DeleteTodoInput, SearchTodoInput};
use crate::services::TodoService;
use crate::utils::AppResult;
use tauri::State;

/// 创建 Todo 命令
#[tauri::command]
pub fn create_todo(
    state: State<AppState>,
    title: String,
    status: String,
    broker: String,
) -> AppResult<Todo> {
    let input = CreateTodoInput { title, status, broker };
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
