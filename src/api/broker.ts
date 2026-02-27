import { http, isTauri, tauri } from './client';

export const brokerApi = {
  getPool: () => {
    if (isTauri()) {
      return tauri.invoke<string[]>('get_broker_pool');
    }
    return http.get<string[]>('/brokers');
  }
};
