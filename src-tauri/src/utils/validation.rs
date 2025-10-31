use super::error::{AppError, AppResult};
use validator::Validate;

#[derive(Debug, Validate)]
pub struct TodoInput {
    #[validate(length(min = 1, max = 500, message = "标题长度必须在 1-500 字符之间"))]
    pub title: String,

    #[validate(length(min = 1, max = 100, message = "券商名称长度必须在 1-100 字符之间"))]
    pub broker: String,
}

impl TodoInput {
    pub fn validate_and_sanitize(&self) -> AppResult<()> {
        self.validate()
            .map_err(|e| AppError::Validation(format!("输入验证失败: {}", e)))?;
        Ok(())
    }
}

pub fn escape_like_pattern(s: &str) -> String {
    s.replace('\\', "\\\\")
     .replace('%', "\\%")
     .replace('_', "\\_")
}
