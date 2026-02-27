use crate::db::{get_connection, DbPool, NewTodo, Todo, UpdateTodo, todos};
use crate::dto::{CreateTodoInput, UpdateTodoInput, DeleteTodoInput, SearchTodoInput};
use crate::utils::{AppError, AppResult, TodoInput, escape_like_pattern};
use chrono::{Utc, SecondsFormat};
use diesel::prelude::*;
use diesel::dsl::excluded;
use uuid::Uuid;

/// Todo 业务逻辑服务
pub struct TodoService;

impl TodoService {
    /// 创建新的 Todo
    pub fn create(pool: &DbPool, input: CreateTodoInput) -> AppResult<Todo> {
        tracing::debug!(
            "TodoService::create - title: {}, status: {}, broker: {}",
            input.title, input.status, input.broker
        );

        // 验证输入
        let validation_input = TodoInput {
            title: input.title.clone(),
            broker: input.broker.clone(),
        };
        validation_input.validate_and_sanitize()?;

        if input.status == "completed" && input.conclusion.as_ref().map(|s| s.trim().is_empty()).unwrap_or(true) {
            return Err(AppError::Validation("已完成状态必须填写结论".to_string()));
        }

        let mut conn = get_connection(pool)?;
        let now = Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true);
        let id = Uuid::new_v4().to_string();

        let new_todo = NewTodo {
            id,
            title: input.title.trim().to_string(),
            status: input.status,
            broker: input.broker.trim().to_string(),
            created_at: now.clone(),
            updated_at: now,
            conclusion: input.conclusion.map(|s| s.trim().to_string()).filter(|s| !s.is_empty()),
            deleted_at: None,
        };

        diesel::insert_into(todos::table)
            .values(&new_todo)
            .execute(&mut conn)?;

        tracing::debug!("Todo inserted successfully");

        let todo = todos::table
            .order(todos::updated_at.desc())
            .first::<Todo>(&mut conn)?;

        tracing::info!("Created todo: id={}, title={}", todo.id, todo.title);
        Ok(todo)
    }

    /// 获取所有 Todos
    pub fn get_all(pool: &DbPool) -> AppResult<Vec<Todo>> {
        tracing::debug!("TodoService::get_all");
        let mut conn = get_connection(pool)?;

        let todos_list = todos::table
            .filter(todos::deleted_at.is_null())
            .order(todos::updated_at.desc())
            .load::<Todo>(&mut conn)?;
        tracing::debug!("Retrieved {} todos", todos_list.len());
        Ok(todos_list)
    }

    /// 更新 Todo
    pub fn update(pool: &DbPool, input: UpdateTodoInput) -> AppResult<Todo> {
        tracing::debug!("TodoService::update - todo_id: {}", input.todo_id);
        tracing::trace!(
            "Update details - title: {:?}, status: {:?}, broker: {:?}",
            input.title, input.status, input.broker
        );

        // 验证输入（如果提供）
        if let Some(ref title) = input.title {
            let trimmed = title.trim();
            if trimmed.is_empty() || trimmed.len() > 500 {
                return Err(AppError::Validation("标题长度必须在 1-500 字符之间".to_string()));
            }
        }

        if let Some(ref broker) = input.broker {
            let trimmed = broker.trim();
            if trimmed.is_empty() || trimmed.len() > 100 {
                return Err(AppError::Validation("券商名称长度必须在 1-100 字符之间".to_string()));
            }
        }

        if let Some(ref conclusion) = input.conclusion {
            if !conclusion.trim().is_empty() && conclusion.len() > 2000 {
                return Err(AppError::Validation("结论长度不能超过 2000 字符".to_string()));
            }
        }

        let mut conn = get_connection(pool)?;
        let now = Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true);

        if input.status.as_deref() == Some("completed")
            && input.conclusion.as_ref().map(|s| s.trim().is_empty()).unwrap_or(true)
        {
            return Err(AppError::Validation("已完成状态必须填写结论".to_string()));
        }

        let update_todo = UpdateTodo {
            title: input.title.map(|t| t.trim().to_string()),
            status: input.status,
            broker: input.broker.map(|b| b.trim().to_string()),
            updated_at: now,
            conclusion: input.conclusion.map(|s| s.trim().to_string()).filter(|s| !s.is_empty()),
            deleted_at: None,
        };

        diesel::update(todos::table.find(input.todo_id))
            .set(&update_todo)
            .execute(&mut conn)?;

        tracing::debug!("Todo {} updated successfully", input.todo_id);

        let todo = todos::table
            .find(input.todo_id)
            .first::<Todo>(&mut conn)?;

        tracing::info!("Updated todo: id={}", todo.id);
        Ok(todo)
    }

    /// 删除 Todo
    pub fn delete(pool: &DbPool, input: DeleteTodoInput) -> AppResult<()> {
        tracing::debug!("TodoService::delete - todo_id: {}", input.todo_id);
        let mut conn = get_connection(pool)?;

        let now = Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true);
        let update_todo = UpdateTodo {
            title: None,
            status: None,
            broker: None,
            updated_at: now.clone(),
            conclusion: None,
            deleted_at: Some(now),
        };

        diesel::update(todos::table.find(input.todo_id))
            .set(&update_todo)
            .execute(&mut conn)?;

        tracing::info!("Deleted todo: id={}", input.todo_id);
        Ok(())
    }

    /// 搜索 Todos
    pub fn search(pool: &DbPool, input: SearchTodoInput) -> AppResult<Vec<Todo>> {
        tracing::debug!("TodoService::search - query: {}", input.query);
        let mut conn = get_connection(pool)?;

        // 转义 LIKE 特殊字符，防止 SQL 注入
        let escaped_query = escape_like_pattern(&input.query);
        let search_pattern = format!("%{}%", escaped_query);

        let todos_list = todos::table
            .filter(
                todos::title.like(&search_pattern)
                    .or(todos::broker.like(&search_pattern))
            )
            .filter(todos::deleted_at.is_null())
            .load::<Todo>(&mut conn)?;

        tracing::debug!("Search returned {} results", todos_list.len());
        Ok(todos_list)
    }

    /// 获取增量变更（包含已删除）
    pub fn get_updated_after(pool: &DbPool, updated_after: Option<String>) -> AppResult<Vec<Todo>> {
        let mut conn = get_connection(pool)?;
        let mut query = todos::table.into_boxed();

        if let Some(after) = updated_after {
            query = query.filter(todos::updated_at.gt(after));
        }

        let results = query.order(todos::updated_at.asc()).load::<Todo>(&mut conn)?;
        Ok(results)
    }

    /// 批量 upsert，用于同步
    pub fn upsert_batch(pool: &DbPool, items: Vec<Todo>) -> AppResult<()> {
        if items.is_empty() {
            return Ok(());
        }

        let mut conn = get_connection(pool)?;
        let values: Vec<NewTodo> = items.into_iter().map(|todo| NewTodo {
            id: todo.id,
            title: todo.title,
            status: todo.status,
            broker: todo.broker,
            created_at: todo.created_at,
            updated_at: todo.updated_at,
            conclusion: todo.conclusion,
            deleted_at: todo.deleted_at,
        }).collect();

        diesel::insert_into(todos::table)
            .values(&values)
            .on_conflict(todos::id)
            .do_update()
            .set((
                todos::title.eq(excluded(todos::title)),
                todos::status.eq(excluded(todos::status)),
                todos::broker.eq(excluded(todos::broker)),
                todos::created_at.eq(excluded(todos::created_at)),
                todos::updated_at.eq(excluded(todos::updated_at)),
                todos::conclusion.eq(excluded(todos::conclusion)),
                todos::deleted_at.eq(excluded(todos::deleted_at)),
            ))
            .execute(&mut conn)?;

        Ok(())
    }
}
