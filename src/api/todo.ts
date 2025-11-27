import { invoke } from '@tauri-apps/api/core';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoStatus } from '../types/todo';

/**
 * Todo API 接口层
 * 封装所有与 Todo 相关的 Tauri 命令调用
 */
export const todoApi = {
  /**
   * 获取所有 Todo
   */
  getAll: () => invoke<Todo[]>('get_todos'),

  /**
   * 创建新 Todo
   */
  create: (input: CreateTodoInput) => {
    return invoke<Todo>('create_todo', {
      title: input.title.trim(),
      status: input.status,
      broker: input.broker.trim(),
      conclusion: input.conclusion || null,
    });
  },

  /**
   * 更新 Todo
   */
  update: (id: number, input: UpdateTodoInput) => {
    const payload: {
      todoId: number;
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

    return invoke<Todo>('update_todo', { input: payload });
  },

  /**
   * 删除 Todo
   */
  delete: (id: number) => {
    return invoke('delete_todo', {
      input: { todoId: id }
    });
  },

  /**
   * 搜索 Todo
   */
  search: (query: string) => {
    return invoke<Todo[]>('search_todos', { query });
  },
};
