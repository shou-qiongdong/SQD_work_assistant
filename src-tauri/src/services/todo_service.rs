use crate::db::{get_connection, DbPool, NewTodo, Todo, UpdateTodo, todos};
use crate::dto::{CreateTodoInput, UpdateTodoInput, DeleteTodoInput, SearchTodoInput};
use crate::utils::{AppError, AppResult, TodoInput, escape_like_pattern};
use chrono::Local;
use diesel::prelude::*;

/// Todo 业务逻辑服务
pub struct TodoService;

impl TodoService {
    /// 创建新的 Todo
    pub fn create(pool: &DbPool, input: CreateTodoInput) -> AppResult<Todo> {
        tracing::info!(
            "TodoService::create - title: {}, status: {}, broker: {}",
            input.title, input.status, input.broker
        );

        // 验证输入
        let validation_input = TodoInput {
            title: input.title.clone(),
            broker: input.broker.clone(),
        };
        validation_input.validate_and_sanitize()?;

        let mut conn = get_connection(pool)?;
        let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

        let new_todo = NewTodo {
            title: input.title.trim().to_string(),
            status: input.status,
            broker: input.broker.trim().to_string(),
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

    /// 获取所有 Todos
    pub fn get_all(pool: &DbPool) -> AppResult<Vec<Todo>> {
        tracing::info!("TodoService::get_all");
        let mut conn = get_connection(pool)?;

        let todos_list = todos::table.load::<Todo>(&mut conn)?;
        tracing::info!("Retrieved {} todos", todos_list.len());
        Ok(todos_list)
    }

    /// 更新 Todo
    pub fn update(pool: &DbPool, input: UpdateTodoInput) -> AppResult<Todo> {
        tracing::info!("TodoService::update - todo_id: {}", input.todo_id);
        tracing::debug!(
            "Update details - title: {:?}, status: {:?}, broker: {:?}",
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

        let mut conn = get_connection(pool)?;
        let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

        let update_todo = UpdateTodo {
            title: input.title.map(|t| t.trim().to_string()),
            status: input.status,
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

    /// 删除 Todo
    pub fn delete(pool: &DbPool, input: DeleteTodoInput) -> AppResult<()> {
        tracing::info!("TodoService::delete - todo_id: {}", input.todo_id);
        let mut conn = get_connection(pool)?;

        diesel::delete(todos::table.find(input.todo_id))
            .execute(&mut conn)?;

        tracing::info!("Todo {} deleted successfully", input.todo_id);
        Ok(())
    }

    /// 搜索 Todos
    pub fn search(pool: &DbPool, input: SearchTodoInput) -> AppResult<Vec<Todo>> {
        tracing::info!("TodoService::search - query: {}", input.query);
        let mut conn = get_connection(pool)?;

        // 转义 LIKE 特殊字符，防止 SQL 注入
        let escaped_query = escape_like_pattern(&input.query);
        let search_pattern = format!("%{}%", escaped_query);

        let todos_list = todos::table
            .filter(todos::title.like(&search_pattern))
            .load::<Todo>(&mut conn)?;

        tracing::info!("Search returned {} results", todos_list.len());
        Ok(todos_list)
    }
}
