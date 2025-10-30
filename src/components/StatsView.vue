<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { listen } from '@tauri-apps/api/event';
import { NCard, NSpace, NText, NTag, NButton } from 'naive-ui';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';
import type { TodoStatus } from '../types/todo';
import { useTodoStore } from '../stores/todo';
import { useBrokerStore } from '../stores/broker';
import { logger } from '../utils/logger';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

logger.info('StatsView starting...', { context: 'StatsView' });

const todoStore = useTodoStore();
const brokerStore = useBrokerStore();

const statusOptions = [
  { label: '待办', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
];

// 计算任务状态统计
const statusStats = computed(() => {
  const stats = {
    pending: 0,
    in_progress: 0,
    completed: 0,
  };

  todoStore.todos.forEach((todo) => {
    stats[todo.status]++;
  });

  return stats;
});

// 计算券商任务分布
const brokerStats = computed(() => {
  const stats: Record<string, number> = {};

  todoStore.todos.forEach((todo) => {
    if (!stats[todo.broker]) {
      stats[todo.broker] = 0;
    }
    stats[todo.broker]++;
  });

  return stats;
});

// 状态饼图配置
const statusChartOption = computed<EChartsOption>(() => ({
  title: {
    text: '任务状态分布',
    left: 'center',
    textStyle: {
      color: '#fff',
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    textStyle: {
      color: '#fff',
    },
  },
  series: [
    {
      name: '任务状态',
      type: 'pie',
      radius: '60%',
      data: [
        { value: statusStats.value.pending, name: '待办', itemStyle: { color: '#909399' } },
        { value: statusStats.value.in_progress, name: '进行中', itemStyle: { color: '#2080f0' } },
        { value: statusStats.value.completed, name: '已完成', itemStyle: { color: '#18a058' } },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
}));

// 券商柱状图配置
const brokerChartOption = computed<EChartsOption>(() => ({
  title: {
    text: '券商任务分布',
    left: 'center',
    textStyle: {
      color: '#fff',
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: Object.keys(brokerStats.value),
    axisLabel: {
      color: '#fff',
      rotate: 30,
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#fff',
    },
    splitLine: {
      lineStyle: {
        color: '#333',
      },
    },
  },
  series: [
    {
      name: '任务数量',
      type: 'bar',
      data: Object.values(brokerStats.value),
      itemStyle: {
        color: '#2080f0',
      },
      emphasis: {
        itemStyle: {
          color: '#409eff',
        },
      },
    },
  ],
}));

// 获取最近的任务（最多10条）
const recentTodos = computed(() => {
  return todoStore.todos.slice(0, 10);
});

const getStatusColor = (status: TodoStatus) => {
  return status === 'pending' ? 'default' : status === 'in_progress' ? 'info' : 'success';
};

const getStatusIcon = (status: TodoStatus) => {
  switch (status) {
    case 'pending':
      return '⭕';
    case 'in_progress':
      return '🔄';
    case 'completed':
      return '✅';
    default:
      return '⭕';
  }
};

const handleRefresh = async () => {
  await todoStore.fetchTodos();
  await brokerStore.fetchBrokerPool();
};

let unlistenRefresh: (() => void) | null = null;

onMounted(async () => {
  logger.info('Component mounted', { context: 'StatsView' });
  await brokerStore.fetchBrokerPool();
  await todoStore.fetchTodos();

  // 监听刷新事件实现实时更新
  unlistenRefresh = await listen('refresh-todos', async () => {
    logger.info('Received refresh-todos event', { context: 'StatsView' });
    await handleRefresh();
  });
});

onUnmounted(() => {
  if (unlistenRefresh) {
    unlistenRefresh();
  }
});
</script>

<template>
  <div class="stats-view">
    <div class="p-6">
      <n-space vertical :size="20">
        <!-- 标题栏 -->
        <div class="flex justify-between items-center">
          <n-text strong class="text-xl">数据统计</n-text>
          <n-button secondary type="info" @click="handleRefresh">刷新</n-button>
        </div>

        <!-- 总览卡片 -->
        <n-space :size="12">
          <n-card class="stat-card">
            <n-space vertical :size="4" align="center">
              <n-text depth="3">总任务数</n-text>
              <n-text strong class="text-2xl">{{ todoStore.todos.length }}</n-text>
            </n-space>
          </n-card>
          <n-card class="stat-card">
            <n-space vertical :size="4" align="center">
              <n-text depth="3">待办</n-text>
              <n-text strong class="text-2xl" style="color: #909399">{{ statusStats.pending }}</n-text>
            </n-space>
          </n-card>
          <n-card class="stat-card">
            <n-space vertical :size="4" align="center">
              <n-text depth="3">进行中</n-text>
              <n-text strong class="text-2xl" style="color: #2080f0">{{ statusStats.in_progress }}</n-text>
            </n-space>
          </n-card>
          <n-card class="stat-card">
            <n-space vertical :size="4" align="center">
              <n-text depth="3">已完成</n-text>
              <n-text strong class="text-2xl" style="color: #18a058">{{ statusStats.completed }}</n-text>
            </n-space>
          </n-card>
        </n-space>

        <!-- 图表区域 -->
        <n-space :size="12">
          <n-card class="chart-card">
            <v-chart :option="statusChartOption" style="height: 300px" />
          </n-card>
          <n-card class="chart-card">
            <v-chart :option="brokerChartOption" style="height: 300px" />
          </n-card>
        </n-space>

        <!-- 任务列表 -->
        <n-card title="最近任务">
          <div v-if="recentTodos.length > 0" class="space-y-2">
            <div
              v-for="todo in recentTodos"
              :key="todo.id"
              class="task-item"
            >
              <div class="flex items-center gap-3">
                <span class="text-lg">{{ getStatusIcon(todo.status) }}</span>
                <div class="flex-1 min-w-0">
                  <n-text
                    :depth="todo.status === 'completed' ? 3 : 1"
                  >
                    {{ todo.title }}
                  </n-text>
                </div>
                <n-space :size="8">
                  <n-tag type="info" size="small" round>
                    {{ todo.broker }}
                  </n-tag>
                  <n-tag :type="getStatusColor(todo.status)" size="small" round>
                    {{ statusOptions.find(s => s.value === todo.status)?.label }}
                  </n-tag>
                </n-space>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <n-text depth="3">暂无任务</n-text>
          </div>
        </n-card>
      </n-space>
    </div>
  </div>
</template>

<style scoped>
.stats-view {
  min-height: 100vh;
  background-color: rgb(16, 16, 20);
}

.stat-card {
  flex: 1;
  min-width: 150px;
}

.chart-card {
  flex: 1;
  min-width: 350px;
}

.task-item {
  padding: 12px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  transition: background-color 0.3s;
}

.task-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}
</style>

<style>
/* 隐藏滚动条但保持滚动功能 */
.stats-view * {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.stats-view *::-webkit-scrollbar {
  display: none;
}
</style>
