<script setup lang="ts">
import { NCollapse, NCollapseItem, NSpace, NText, NTag, NDivider } from 'naive-ui';
import type { Todo } from '../types/todo';
import { getStatusIcon, getStatusColor, getStatusLabel } from '../utils/todo';

interface Props {
  brokerStatsDetailed: Record<string, {
    pending: Todo[];
    in_progress: Todo[];
    completed: Todo[];
    total: number;
  }>;
}

defineProps<Props>();
</script>

<template>
  <div>
    <n-divider>券商详细数据</n-divider>
    <n-collapse>
      <n-collapse-item
        v-for="(stats, broker) in brokerStatsDetailed"
        :key="broker"
        :title="broker"
      >
        <template #header>
          <div class="flex justify-between items-center w-full pr-4">
            <n-text strong>{{ broker }}</n-text>
            <n-space :size="8">
              <n-tag type="default" size="small" round>
                待办: {{ stats.pending.length }}
              </n-tag>
              <n-tag type="info" size="small" round>
                进行中: {{ stats.in_progress.length }}
              </n-tag>
              <n-tag type="success" size="small" round>
                已完成: {{ stats.completed.length }}
              </n-tag>
            </n-space>
          </div>
        </template>

        <div class="space-y-2">
          <div
            v-for="todo in [...stats.pending, ...stats.in_progress, ...stats.completed]"
            :key="todo.id"
            class="task-item-inline"
          >
            <span class="text-base mr-2">{{ getStatusIcon(todo.status) }}</span>
            <div class="flex-1">
              <n-text :depth="todo.status === 'completed' ? 3 : 1">
                {{ todo.title }}
              </n-text>
              <!-- 显示结论 -->
              <div v-if="todo.conclusion" class="mt-1">
                <n-text depth="3" class="text-sm">
                  结论: {{ todo.conclusion }}
                </n-text>
              </div>
            </div>
            <n-tag :type="getStatusColor(todo.status)" size="small" round>
              {{ getStatusLabel(todo.status) }}
            </n-tag>
          </div>
          <div v-if="stats.total === 0" class="text-center py-4">
            <n-text depth="3">暂无任务</n-text>
          </div>
        </div>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<style scoped>
.task-item-inline {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

.task-item-inline:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.space-y-2 > * + * {
  margin-top: 8px;
}
</style>
