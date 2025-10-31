// @generated automatically by Diesel CLI.

diesel::table! {
    todos (id) {
        id -> Integer,
        title -> Text,
        status -> Text,
        broker -> Text,
        created_at -> Text,
        updated_at -> Text,
    }
}
