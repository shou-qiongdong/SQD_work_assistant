use serde::{Deserialize, Deserializer};

/// 验证状态值
fn validate_status<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    let status = String::deserialize(deserializer)?;
    match status.as_str() {
        "pending" | "in_progress" | "completed" => Ok(status),
        _ => Err(serde::de::Error::custom(
            "Invalid status. Must be one of: pending, in_progress, completed"
        )),
    }
}

/// 创建 Todo 的输入 DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTodoInput {
    pub title: String,
    #[serde(deserialize_with = "validate_status")]
    pub status: String,
    pub broker: String,
    pub conclusion: Option<String>,
}

/// 更新 Todo 的输入 DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTodoInput {
    pub todo_id: i32,
    pub title: Option<String>,
    #[serde(default, deserialize_with = "validate_optional_status")]
    pub status: Option<String>,
    pub broker: Option<String>,
    pub conclusion: Option<String>,
}

/// 验证可选的状态值
fn validate_optional_status<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: Deserializer<'de>,
{
    let opt: Option<String> = Option::deserialize(deserializer)?;
    if let Some(status) = opt {
        match status.as_str() {
            "pending" | "in_progress" | "completed" => Ok(Some(status)),
            _ => Err(serde::de::Error::custom(
                "Invalid status. Must be one of: pending, in_progress, completed"
            )),
        }
    } else {
        Ok(None)
    }
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
