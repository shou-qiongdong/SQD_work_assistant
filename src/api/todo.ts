import type { Todo, CreateTodoInput, UpdateTodoInput, TodoStatus } from '../types/todo';
import { http, isTauri, tauri } from './client';

/**
 * Todo API 接口层
 * 封装所有与 Todo 相关的 Tauri 命令调用
 */
export const todoApi = {
  /**
   * 获取所有 Todo
   */
  getAll: () => {
    if (isTauri()) {
      return tauri.invoke<Todo[]>('get_todos');
    }
    return http.get<Todo[]>('/todos');
  },

  /**
   * 创建新 Todo
   */
  create: (input: CreateTodoInput) => {
    const payload = {
      title: input.title.trim(),
      status: input.status,
      broker: input.broker.trim(),
      conclusion: input.conclusion || null,
    };

    if (isTauri()) {
      return tauri.invoke<Todo>('create_todo', payload);
    }
    return http.post<Todo>('/todos', payload);
  },

  /**
   * 更新 Todo
   */
  update: (id: string, input: UpdateTodoInput) => {
    const payload: {
      todoId: string;
      title?: string;
      status?: TodoStatus;
      broker?: string;
      conclusion?: string | null;
    } = { todoId: id };

    if (input.title !== undefined) {
      payload.title = input.title.trim();
    }
    if (input.status !== undefined) {
      payload.status = input.status;
    }
    if (input.broker !== undefined) {
      payload.broker = input.broker.trim();
    }
    if (input.conclusion !== undefined) {
      payload.conclusion = input.conclusion || null;
    }

    if (isTauri()) {
      return tauri.invoke<Todo>('update_todo', { input: payload });
    }
    const { todoId, ...rest } = payload;
    return http.patch<Todo>(`/todos/${todoId}`, rest);
  },

  /**
   * 删除 Todo
   */
  delete: (id: string) => {
    if (isTauri()) {
      return tauri.invoke('delete_todo', {
        input: { todoId: id }
      });
    }
    return http.delete(`/todos/${id}`);
  },

  /**
   * 搜索 Todo
   */
  search: (query: string) => {
    if (isTauri()) {
      return tauri.invoke<Todo[]>('search_todos', { query });
    }
    return http.get<Todo[]>(`/todos?query=${encodeURIComponent(query)}`);
  },

  /**
   * 获取本地增量变更（Tauri）
   */
  getLocalChanges: (updatedAfter?: string | null) => {
    return tauri.invoke<Todo[]>('get_todos_updated_after', {
      updated_after: updatedAfter || null
    });
  },

  /**
   * 批量应用远端变更（Tauri）
   */
  applyRemoteChanges: (todos: Todo[]) => {
    return tauri.invoke<void>('upsert_todos', { todos });
  },

  /**
   * 与远端同步（Web 或直接 HTTP）
   */
  syncWithServer: (payload: { last_sync: string | null; changes: Todo[] }) => {
    return http.post<{ server_time: string; changes: Todo[] }>('/sync', payload);
  }
};
