<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { NInput, NSelect, useMessage } from 'naive-ui';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { emit } from '@tauri-apps/api/event';
import type { TodoStatus } from '../types/todo';
import { logger } from '../utils/logger';
import { useBrokerStore } from '../store/broker';


const message = useMessage();
const brokerStore = useBrokerStore();

const title = ref('');
const broker = ref('');
const isDropdownOpen = ref(false);
const brokerSelectRef = ref<InstanceType<typeof NSelect> | null>(null);

// 窗口尺寸常量
const BASE_HEIGHT = 60;
const BASE_WIDTH = 480; // 固定宽度

const brokerOptions = computed(() =>
  brokerStore.brokers.map(b => ({ label: b, value: b }))
);

// 动态调整窗口大小
const resizeWindow = async (expanded: boolean) => {
  const window = getCurrentWindow();
  try {
    if (expanded) {
      // 根据选项数量计算实际需要的高度
      const optionCount = Math.min(brokerOptions.value.length + 1, 8); // 最多显示8个选项，+1 是输入框
      const itemHeight = 30; // 每个选项的高度
      const padding = 20; // 上下内边距

      // 计算展开后的实际高度
      const dropdownHeight = optionCount * itemHeight + padding;
      const totalHeight = BASE_HEIGHT + dropdownHeight;

      await window.setSize(new LogicalSize(BASE_WIDTH, totalHeight));
      await window.setFocus();
    } else {
      // 收起时恢复基础高度
      await window.setSize(new LogicalSize(BASE_WIDTH, BASE_HEIGHT));
    }
  } catch (error) {
    logger.error('Failed to resize window', { context: 'QuickAdd', data: error });
  }
};

const handleDropdownUpdate = async (show: boolean) => {
  isDropdownOpen.value = show;
  await resizeWindow(show);
};

onMounted(async () => {
  await brokerStore.fetchBrokerPool();
  brokerStore.loadLastUsedBroker();

  // 使用上次选择的券商或第一个券商
  if (brokerStore.lastUsedBroker && brokerStore.brokers.includes(brokerStore.lastUsedBroker)) {
    broker.value = brokerStore.lastUsedBroker;
  } else if (brokerStore.brokers.length > 0) {
    broker.value = brokerStore.brokers[0];
  }

  window.addEventListener('keydown', handleKeydown);

  // 聚焦券商选择框
  await nextTick();
  if (brokerSelectRef.value) {
    brokerSelectRef.value.focus();
  }
});

onBeforeUnmount(() => {
  // ✅ 组件卸载时移除监听
  window.removeEventListener('keydown', handleKeydown);
});

const handleSubmit = async () => {
  if (!title.value.trim()) {
    return;
  }

  if (!broker.value.trim()) {
    message.warning('请选择或输入券商');
    return;
  }

  logger.info('Quick add task submit', { context: 'QuickAdd', data: { title: title.value, broker: broker.value } });

  try {
    await invoke('create_todo', {
      title: title.value.trim(),
      status: 'pending' as TodoStatus,
      broker: broker.value.trim(),
    });

    // 重新从数据库获取券商池以确保同步
    await brokerStore.fetchBrokerPool();
    brokerStore.setLastUsedBroker(broker.value.trim());

    message.success('✓ 已添加');
    logger.info('Quick add task success', { context: 'QuickAdd' });
    title.value = '';

    // 通知主窗口刷新数据
    await emit('refresh-todos');

    // 恢复窗口尺寸并关闭
    await resizeWindow(false);
    const window = getCurrentWindow();
    await window.hide();
  } catch (error) {
    logger.error('Failed to create quick add task', { context: 'QuickAdd', data: error });
    message.error('添加失败');
  }
};

const handleCancel = async () => {
  title.value = '';
  // 恢复窗口尺寸并关闭
  await resizeWindow(false);
  const window = getCurrentWindow();
  await window.hide();
};

// 监听 ESC 键关闭窗口
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleCancel();
  }
};
</script>

<template>
  <div class="quick-add-container" data-tauri-drag-region>
    <div class="content" data-tauri-drag-region="false">
      <div class="input-row">
        <n-select
          ref="brokerSelectRef"
          v-model:value="broker"
          :options="brokerOptions"
          placeholder="券商"
          filterable
          tag
          size="small"
          class="broker-select"
          :consistent-menu-width="false"
          @update:show="handleDropdownUpdate"
        />
        <n-input
          v-model:value="title"
          placeholder="任务 (Enter 保存 / ESC 关闭)"
          size="small"
          clearable
          @keyup.enter="handleSubmit"
          class="title-input"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-add-container {
  width: 100%;
  height: 100%;
  background-color: #18181b;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12px;
  -webkit-app-region: drag;
  overflow: hidden;
  box-sizing: border-box;
}

.content {
  width: 100%;
  -webkit-app-region: no-drag;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  -webkit-app-region: no-drag;
}

.broker-select {
  width: 100px;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.title-input {
  flex: 1;
  min-width: 0;
  -webkit-app-region: no-drag;
}
</style>
