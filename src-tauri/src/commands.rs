use crate::db::{get_connection, AppState};
use crate::models::{NewTodo, Todo, UpdateTodo};
use crate::schema::todos;
use crate::error::{AppError, AppResult};
use crate::validation::{TodoInput, escape_like_pattern};
use chrono::Local;
use diesel::prelude::*;
use serde::Deserialize;
use tauri::State;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetTodoInput {
    todo_id: i32,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTodoInput {
    todo_id: i32,
    title: Option<String>,
    status: Option<String>,
    broker: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteTodoInput {
    todo_id: i32,
}

#[tauri::command]
pub fn create_todo(
    state: State<AppState>,
    title: String,
    status: String,
    broker: String,
) -> AppResult<Todo> {
    tracing::info!(
        "create_todo called - title: {}, status: {}, broker: {}",
        title, status, broker
    );

    // 验证输入
    let input = TodoInput {
        title: title.clone(),
        description: None,
        broker: broker.clone(),
    };
    input.validate_and_sanitize()?;

    let mut conn = get_connection(&state.pool)?;

    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let new_todo = NewTodo {
        title: title.trim().to_string(),
        status: status.clone(),
        broker: broker.trim().to_string(),
        created_at: now.clone(),
        updated_at: now,
    };

    diesel::insert_into(todos::table)
        .values(&new_todo)
        .execute(&mut conn)?;

    tracing::info!("Todo inserted successfully");

    let todo = todos::table
        .order(todos::id.desc())
        .first::<Todo>(&mut conn)?;

    tracing::info!("Created todo with id: {}", todo.id);
    Ok(todo)
}

#[tauri::command]
pub fn get_todos(state: State<AppState>) -> AppResult<Vec<Todo>> {
    tracing::info!("get_todos called");
    let mut conn = get_connection(&state.pool)?;

    let todos = todos::table.load::<Todo>(&mut conn)?;
    tracing::info!("get_todos returned {} todos", todos.len());
    Ok(todos)
}

#[tauri::command]
pub fn get_todo(
    state: State<AppState>,
    input: GetTodoInput,
) -> AppResult<Todo> {
    tracing::info!("get_todo called - todo_id: {}", input.todo_id);
    let mut conn = get_connection(&state.pool)?;

    let todo = todos::table
        .find(input.todo_id)
        .first::<Todo>(&mut conn)?;

    tracing::info!("get_todo returned todo with id: {}", todo.id);
    Ok(todo)
}

#[tauri::command]
pub fn update_todo(
    state: State<AppState>,
    input: UpdateTodoInput,
) -> AppResult<Todo> {
    tracing::info!("update_todo called - todo_id: {}", input.todo_id);
    tracing::debug!(
        "update_todo details - title: {:?}, status: {:?}, broker: {:?}",
        input.title, input.status, input.broker
    );

    // 验证输入（如果提供）
    if let Some(ref title) = input.title {
        if title.is_empty() || title.len() > 500 {
            return Err(AppError::Validation("标题长度必须在 1-500 字符之间".to_string()));
        }
    }

    if let Some(ref broker) = input.broker {
        if broker.is_empty() || broker.len() > 100 {
            return Err(AppError::Validation("券商名称长度必须在 1-100 字符之间".to_string()));
        }
    }

    let mut conn = get_connection(&state.pool)?;

    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let update_todo = UpdateTodo {
        title: input.title.map(|t| t.trim().to_string()),
        status: input.status.clone(),
        broker: input.broker.map(|b| b.trim().to_string()),
        updated_at: now,
    };

    diesel::update(todos::table.find(input.todo_id))
        .set(&update_todo)
        .execute(&mut conn)?;

    tracing::info!("Todo {} updated successfully", input.todo_id);

    let todo = todos::table
        .find(input.todo_id)
        .first::<Todo>(&mut conn)?;

    tracing::info!("Retrieved updated todo with id: {}", todo.id);
    Ok(todo)
}

#[tauri::command]
pub fn delete_todo(
    state: State<AppState>,
    input: DeleteTodoInput,
) -> AppResult<()> {
    tracing::info!("delete_todo called - todo_id: {}", input.todo_id);
    let mut conn = get_connection(&state.pool)?;

    diesel::delete(todos::table.find(input.todo_id))
        .execute(&mut conn)?;

    tracing::info!("Todo {} deleted successfully", input.todo_id);
    Ok(())
}

#[tauri::command]
pub fn search_todos(state: State<AppState>, query: String) -> AppResult<Vec<Todo>> {
    tracing::info!("search_todos called - query: {}", query);
    let mut conn = get_connection(&state.pool)?;

    // 转义 LIKE 特殊字符，防止 SQL 注入
    let escaped_query = escape_like_pattern(&query);
    let search_pattern = format!("%{}%", escaped_query);

    let todos = todos::table
        .filter(todos::title.like(&search_pattern))
        .load::<Todo>(&mut conn)?;

    tracing::info!("search_todos returned {} results", todos.len());
    Ok(todos)
}

#[tauri::command]
pub fn get_broker_pool(state: State<AppState>) -> AppResult<Vec<String>> {
    tracing::info!("get_broker_pool called");
    let mut conn = get_connection(&state.pool)?;

    let brokers = todos::table
        .select(todos::broker)
        .distinct()
        .load::<String>(&mut conn)?;

    tracing::info!("get_broker_pool returned {} brokers", brokers.len());
    Ok(brokers)
}
