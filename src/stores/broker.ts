import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import { logger } from '../utils/logger';

interface BrokerState {
  brokers: string[];
  loading: boolean;
  error: string | null;
  lastUsedBroker: string | null;
}

export const useBrokerStore = defineStore('broker', {
  state: (): BrokerState => ({
    brokers: [],
    loading: false,
    error: null,
    lastUsedBroker: null,
  }),

  actions: {
    async fetchBrokerPool() {
      logger.info('Fetching broker pool...', { context: 'BrokerStore' });
      this.loading = true;
      this.error = null;
      try {
        this.brokers = await invoke<string[]>('get_broker_pool');
        logger.info(`Broker pool fetched successfully`, {
          context: 'BrokerStore',
          data: { count: this.brokers.length }
        });
      } catch (error) {
        this.error = String(error);
        logger.error('Failed to fetch broker pool', { context: 'BrokerStore', data: error });
      } finally {
        this.loading = false;
      }
    },

    addBroker(broker: string) {
      const trimmed = broker.trim();
      if (trimmed && !this.brokers.includes(trimmed)) {
        this.brokers.push(trimmed);
        this.brokers.sort();
        logger.info('Broker added to pool', { context: 'BrokerStore', data: { broker: trimmed } });
      }
    },

    setLastUsedBroker(broker: string) {
      this.lastUsedBroker = broker;
      localStorage.setItem('lastUsedBroker', broker);
    },

    loadLastUsedBroker() {
      const saved = localStorage.getItem('lastUsedBroker');
      if (saved) {
        this.lastUsedBroker = saved;
      }
    },
  },
});
