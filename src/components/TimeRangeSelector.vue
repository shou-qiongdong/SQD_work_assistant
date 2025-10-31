<script setup lang="ts">
import { NSpace, NButton, NButtonGroup } from 'naive-ui';

interface Props {
  modelValue: 'today' | 'week' | 'all';
}

interface Emits {
  (e: 'update:modelValue', value: 'today' | 'week' | 'all'): void;
  (e: 'refresh'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function handleRangeChange(range: 'today' | 'week' | 'all') {
  emit('update:modelValue', range);
}

function handleRefresh() {
  emit('refresh');
}
</script>

<template>
  <div class="time-range-selector">
    <n-space justify="space-between" align="center" class="mb-4">
      <n-button-group>
        <n-button
          :type="modelValue === 'today' ? 'primary' : 'default'"
          @click="handleRangeChange('today')"
        >
          今日
        </n-button>
        <n-button
          :type="modelValue === 'week' ? 'primary' : 'default'"
          @click="handleRangeChange('week')"
        >
          本周
        </n-button>
        <n-button
          :type="modelValue === 'all' ? 'primary' : 'default'"
          @click="handleRangeChange('all')"
        >
          全部
        </n-button>
      </n-button-group>
      <n-button secondary type="info" @click="handleRefresh">刷新</n-button>
    </n-space>
  </div>
</template>

<style scoped>
.time-range-selector {
  width: 100%;
}
</style>
