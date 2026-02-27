// @generated automatically by Diesel CLI.

diesel::table! {
    todos (id) {
        id -> Text,
        title -> Text,
        status -> Text,
        broker -> Text,
        created_at -> Text,
        updated_at -> Text,
        conclusion -> Nullable<Text>,
        deleted_at -> Nullable<Text>,
    }
}
