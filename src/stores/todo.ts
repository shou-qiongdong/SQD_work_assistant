import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoStatus } from '../types/todo';
import { logger } from '../utils/logger';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    todos: [],
    loading: false,
    error: null,
  }),

  getters: {
    pendingTodos: (state) => state.todos.filter((t) => t.status === 'pending'),
    inProgressTodos: (state) => state.todos.filter((t) => t.status === 'in_progress'),
    completedTodos: (state) => state.todos.filter((t) => t.status === 'completed'),
  },

  actions: {
    async fetchTodos() {
      logger.info('Fetching todos...', { context: 'TodoStore' });
      this.loading = true;
      this.error = null;
      try {
        this.todos = await invoke<Todo[]>('get_todos');
        logger.info(`Todos fetched successfully`, { context: 'TodoStore', data: { count: this.todos.length } });
      } catch (error) {
        this.error = String(error);
        logger.error('Failed to fetch todos', { context: 'TodoStore', data: error });
      } finally {
        this.loading = false;
      }
    },

    async createTodo(input: CreateTodoInput) {
      logger.info('Creating todo...', { context: 'TodoStore', data: input });
      this.loading = true;
      this.error = null;
      try {
        const payload = {
          title: input.title.trim(),
          status: input.status,
          broker: input.broker.trim(),
        };
        const todo = await invoke<Todo>('create_todo', payload);
        this.todos.push(todo);
        logger.info('Todo created successfully', { context: 'TodoStore', data: { id: todo.id } });
        return todo;
      } catch (error) {
        this.error = String(error);
        logger.error('Failed to create todo', { context: 'TodoStore', data: error });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTodo(id: number, input: UpdateTodoInput) {
      logger.info(`Updating todo ${id}...`, { context: 'TodoStore', data: input });
      this.loading = true;
      this.error = null;
      try {
        const commandInput: {
          todoId: number;
          title?: string;
          status?: TodoStatus;
          broker?: string;
        } = { todoId: id };

        if (input.title !== undefined) {
          commandInput.title = input.title.trim();
        }
        if (input.status !== undefined) {
          commandInput.status = input.status;
        }
        if (input.broker !== undefined) {
          commandInput.broker = input.broker;
        }

        const updatedTodo = await invoke<Todo>('update_todo', {
          input: commandInput,
        });
        const index = this.todos.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
        }
        logger.info(`Todo ${id} updated successfully`, { context: 'TodoStore' });
        return updatedTodo;
      } catch (error) {
        this.error = String(error);
        logger.error(`Failed to update todo ${id}`, { context: 'TodoStore', data: error });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTodo(id: number) {
      logger.info(`Deleting todo ${id}...`, { context: 'TodoStore' });
      this.loading = true;
      this.error = null;
      try {
        await invoke('delete_todo', {
          input: {
            todoId: id
          }
        });
        this.todos = this.todos.filter((t) => t.id !== id);
        logger.info(`Todo ${id} deleted successfully`, { context: 'TodoStore' });
      } catch (error) {
        this.error = String(error);
        logger.error(`Failed to delete todo ${id}`, { context: 'TodoStore', data: error });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchTodos(query: string) {
      logger.info('Searching todos...', { context: 'TodoStore', data: { query } });
      this.loading = true;
      this.error = null;
      try {
        this.todos = await invoke<Todo[]>('search_todos', { query });
        logger.info(`Search completed`, { context: 'TodoStore', data: { count: this.todos.length } });
      } catch (error) {
        this.error = String(error);
        logger.error('Failed to search todos', { context: 'TodoStore', data: error });
      } finally {
        this.loading = false;
      }
    },
  },
});
