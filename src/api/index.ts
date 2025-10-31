/**
 * API 封装层 - Tauri Commands
 * 统一封装所有后端调用
 */

import { invoke } from '@tauri-apps/api/core';
import type { Todo, TodoStatus } from '../types/todo';

// ==================== Todo API ====================

export interface CreateTodoInput {
  title: string;
  broker: string;
  status: TodoStatus;
  priority: string;
  tags: string[];
  due_date?: string;
}

export interface UpdateTodoInput {
  id: number;
  title?: string;
  broker?: string;
  status?: TodoStatus;
  priority?: string;
  tags?: string[];
  due_date?: string;
}

export const todoApi = {
  /**
   * 获取所有任务
   */
  async getAll(): Promise<Todo[]> {
    return await invoke<Todo[]>('get_todos');
  },

  /**
   * 创建任务
   */
  async create(input: CreateTodoInput): Promise<Todo> {
    return await invoke<Todo>('create_todo', { input });
  },

  /**
   * 更新任务
   */
  async update(input: UpdateTodoInput): Promise<Todo> {
    return await invoke<Todo>('update_todo', { input });
  },

  /**
   * 删除任务
   */
  async delete(id: number): Promise<void> {
    await invoke('delete_todo', { id });
  },

  /**
   * 快速切换完成状态
   */
  async toggleComplete(id: number): Promise<Todo> {
    return await invoke<Todo>('toggle_todo_complete', { id });
  }
};

// ==================== Broker API ====================

export const brokerApi = {
  /**
   * 获取券商池
   */
  async getPool(): Promise<string[]> {
    return await invoke<string[]>('get_broker_pool');
  }
};

// 导出所有 API
export default {
  todo: todoApi,
  broker: brokerApi
};
