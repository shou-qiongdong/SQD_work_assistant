import { defineStore } from 'pinia';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo';
import { logger } from '../utils/logger';
import { todoApi } from '../api/todo';
import { ErrorHandler } from '../utils/error-handler';

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
        this.todos = await todoApi.getAll();
        logger.info(`Todos fetched successfully`, { context: 'TodoStore', data: { count: this.todos.length } });
      } catch (error) {
        this.error = ErrorHandler.handle(error, 'TodoStore', '获取任务列表失败');
      } finally {
        this.loading = false;
      }
    },

    async createTodo(input: CreateTodoInput) {
      logger.info('Creating todo...', { context: 'TodoStore', data: input });
      this.loading = true;
      this.error = null;
      try {
        const todo = await todoApi.create(input);
        this.todos.push(todo);
        logger.info('Todo created successfully', { context: 'TodoStore', data: { id: todo.id } });
        return todo;
      } catch (error) {
        this.error = ErrorHandler.handle(error, 'TodoStore', '创建任务失败');
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
        const updatedTodo = await todoApi.update(id, input);
        // 使用 map 优化数组更新
        this.todos = this.todos.map(t => t.id === id ? updatedTodo : t);
        logger.info(`Todo ${id} updated successfully`, { context: 'TodoStore' });
        return updatedTodo;
      } catch (error) {
        this.error = ErrorHandler.handle(error, 'TodoStore', '更新任务失败');
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
        await todoApi.delete(id);
        this.todos = this.todos.filter((t) => t.id !== id);
        logger.info(`Todo ${id} deleted successfully`, { context: 'TodoStore' });
      } catch (error) {
        this.error = ErrorHandler.handle(error, 'TodoStore', '删除任务失败');
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
        this.todos = await todoApi.search(query);
        logger.info(`Search completed`, { context: 'TodoStore', data: { count: this.todos.length } });
      } catch (error) {
        this.error = ErrorHandler.handle(error, 'TodoStore', '搜索任务失败');
      } finally {
        this.loading = false;
      }
    },
  },
});
