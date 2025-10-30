use crate::error::{AppError, AppResult};
use validator::Validate;

#[derive(Debug, Validate)]
pub struct TodoInput {
    #[validate(length(min = 1, max = 500, message = "标题长度必须在 1-500 字符之间"))]
    pub title: String,

    #[validate(length(max = 2000, message = "描述长度不能超过 2000 字符"))]
    pub description: Option<String>,

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

pub fn validate_date_format(date_str: &str) -> AppResult<()> {
    // 简单的日期格式验证 YYYY-MM-DD
    let parts: Vec<&str> = date_str.split('-').collect();
    if parts.len() != 3 {
        return Err(AppError::Validation("日期格式必须为 YYYY-MM-DD".to_string()));
    }

    let year = parts[0].parse::<u32>()
        .map_err(|_| AppError::Validation("年份必须是数字".to_string()))?;
    let month = parts[1].parse::<u32>()
        .map_err(|_| AppError::Validation("月份必须是数字".to_string()))?;
    let day = parts[2].parse::<u32>()
        .map_err(|_| AppError::Validation("日期必须是数字".to_string()))?;

    if !(1900..=2100).contains(&year) {
        return Err(AppError::Validation("年份必须在 1900-2100 之间".to_string()));
    }
    if !(1..=12).contains(&month) {
        return Err(AppError::Validation("月份必须在 1-12 之间".to_string()));
    }
    if !(1..=31).contains(&day) {
        return Err(AppError::Validation("日期必须在 1-31 之间".to_string()));
    }

    Ok(())
}

pub fn escape_like_pattern(s: &str) -> String {
    s.replace('\\', "\\\\")
     .replace('%', "\\%")
     .replace('_', "\\_")
}
