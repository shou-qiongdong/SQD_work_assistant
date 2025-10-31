use serde::Deserialize;

/// 创建 Todo 的输入 DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTodoInput {
    pub title: String,
    pub status: String,
    pub broker: String,
}

/// 更新 Todo 的输入 DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTodoInput {
    pub todo_id: i32,
    pub title: Option<String>,
    pub status: Option<String>,
    pub broker: Option<String>,
}

/// 删除 Todo 的输入 DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteTodoInput {
    pub todo_id: i32,
}

/// 搜索 Todo 的输入 DTO
#[derive(Debug, Deserialize)]
pub struct SearchTodoInput {
    pub query: String,
}
