export interface Todo {
  id: number;
  title: string;
  status: TodoStatus;
  broker: string;
  created_at: string;
  updated_at: string;
}

export type TodoStatus = "pending" | "in_progress" | "completed";

export interface CreateTodoInput {
  title: string;
  status: TodoStatus;
  broker: string;
}

export interface UpdateTodoInput {
  title?: string;
  status?: TodoStatus;
  broker?: string;
}
