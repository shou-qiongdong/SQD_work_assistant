export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  broker: string;
  created_at: string;
  updated_at: string;
  conclusion: string | null;
  deleted_at?: string | null;
}

export type TodoStatus = "pending" | "in_progress" | "completed";

export interface CreateTodoInput {
  title: string;
  status: TodoStatus;
  broker: string;
  conclusion?: string;
}

export interface UpdateTodoInput {
  title?: string;
  status?: TodoStatus;
  broker?: string;
  conclusion?: string;
}
