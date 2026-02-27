import { defineStore } from 'pinia';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo';
import { logger } from '../utils/logger';
import { todoApi } from '../api/todo';
import { ErrorHandler } from '../utils/error-handler';
import { isTauri } from '../api/client';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  syncError: string | null;
}

const SYNC_INTERVAL_MS = 60_000;
const LAST_SYNC_KEY = 'sqd_last_sync';
let syncTimer: number | null = null;

const getLastSync = () => localStorage.getItem(LAST_SYNC_KEY);
const setLastSync = (value: string) => localStorage.setItem(LAST_SYNC_KEY, value);

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    todos: [],
    loading: false,
    error: null,
    syncing: false,
    syncError: null,
  }),

  getters: {
    pendingTodos: (state) => state.todos.filter((t) => !t.deleted_at && t.status === 'pending'),
    inProgressTodos: (state) => state.todos.filter((t) => !t.deleted_at && t.status === 'in_progress'),
    completedTodos: (state) => state.todos.filter((t) => !t.deleted_at && t.status === 'completed'),
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
        await this.syncNow();
        return todo;
      } catch (error) {
        this.error = ErrorHandler.handle(error, 'TodoStore', '创建任务失败');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTodo(id: string, input: UpdateTodoInput) {
      logger.info(`Updating todo ${id}...`, { context: 'TodoStore', data: input });
      this.loading = true;
      this.error = null;
      try {
        const updatedTodo = await todoApi.update(id, input);
        // 使用 map 优化数组更新
        this.todos = this.todos.map(t => t.id === id ? updatedTodo : t);
        logger.info(`Todo ${id} updated successfully`, { context: 'TodoStore' });
        await this.syncNow();
        return updatedTodo;
      } catch (error) {
        this.error = ErrorHandler.handle(error, 'TodoStore', '更新任务失败');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTodo(id: string) {
      logger.info(`Deleting todo ${id}...`, { context: 'TodoStore' });
      this.loading = true;
      this.error = null;
      try {
        await todoApi.delete(id);
        this.todos = this.todos.filter((t) => t.id !== id);
        logger.info(`Todo ${id} deleted successfully`, { context: 'TodoStore' });
        await this.syncNow();
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

    async syncNow() {
      if (!isTauri() || this.syncing) {
        return;
      }

      this.syncing = true;
      this.syncError = null;

      try {
        const lastSync = getLastSync();
        const localChanges = await todoApi.getLocalChanges(lastSync);
        const response = await todoApi.syncWithServer({
          last_sync: lastSync,
          changes: localChanges
        });

        if (response.changes.length > 0) {
          await todoApi.applyRemoteChanges(response.changes);
        }

        setLastSync(response.server_time);
        await this.fetchTodos();
        logger.info('Sync completed', { context: 'TodoStore', data: { changes: response.changes.length } });
      } catch (error) {
        this.syncError = ErrorHandler.handle(error, 'TodoStore', '同步失败');
        logger.warn('Sync failed', { context: 'TodoStore', data: error });
      } finally {
        this.syncing = false;
      }
    },

    startSync() {
      if (!isTauri() || syncTimer) {
        return;
      }

      this.syncNow();
      syncTimer = window.setInterval(() => {
        this.syncNow();
      }, SYNC_INTERVAL_MS);
    },

    stopSync() {
      if (syncTimer) {
        window.clearInterval(syncTimer);
        syncTimer = null;
      }
    }
  },
});
