<script setup lang="ts">
import { NCard, NSpace, NText } from 'naive-ui';

interface Props {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
}

defineProps<Props>();
</script>

<template>
  <n-space :size="12">
    <n-card class="stat-card">
      <n-space vertical :size="4" align="center">
        <n-text depth="3">总任务数</n-text>
        <n-text strong class="text-2xl">{{ totalCount }}</n-text>
      </n-space>
    </n-card>
    <n-card class="stat-card">
      <n-space vertical :size="4" align="center">
        <n-text depth="3">待办</n-text>
        <n-text strong class="text-2xl" style="color: #909399">{{ pendingCount }}</n-text>
      </n-space>
    </n-card>
    <n-card class="stat-card">
      <n-space vertical :size="4" align="center">
        <n-text depth="3">进行中</n-text>
        <n-text strong class="text-2xl" style="color: #2080f0">{{ inProgressCount }}</n-text>
      </n-space>
    </n-card>
    <n-card class="stat-card">
      <n-space vertical :size="4" align="center">
        <n-text depth="3">已完成</n-text>
        <n-text strong class="text-2xl" style="color: #18a058">{{ completedCount }}</n-text>
      </n-space>
    </n-card>
  </n-space>
</template>

<style scoped>
.stat-card {
  flex: 1;
  min-width: 120px;
}
</style>
