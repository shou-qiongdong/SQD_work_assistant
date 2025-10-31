use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use super::schema::todos;

#[derive(Debug, Queryable, Selectable, Serialize, Deserialize, Clone)]
#[diesel(table_name = todos)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Todo {
    pub id: i32,
    pub title: String,
    pub status: String,
    pub broker: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Insertable, Serialize, Deserialize)]
#[diesel(table_name = todos)]
pub struct NewTodo {
    pub title: String,
    pub status: String,
    pub broker: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, AsChangeset, Serialize, Deserialize)]
#[diesel(table_name = todos)]
pub struct UpdateTodo {
    pub title: Option<String>,
    pub status: Option<String>,
    pub broker: Option<String>,
    pub updated_at: String,
}
