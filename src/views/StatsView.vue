<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { listen } from '@tauri-apps/api/event';
import { NCard, NSpace, useMessage } from 'naive-ui';
import { useTodoStore } from '../store/todo';
import { useBrokerStore } from '../store/broker';
import { logger } from '../utils/logger';
import { getToday, getThisWeek, isInDateRange, getLast7Days } from '../utils/dateUtils';
import { useStatsData } from '../composables/useStatsData';
import { useReportExport } from '../composables/useReportExport';

// 导入子组件
import TimeRangeSelector from '../components/TimeRangeSelector.vue';
import StatsSummaryCards from '../components/StatsSummaryCards.vue';
import TimeTrendChart from '../components/TimeTrendChart.vue';
import StatusChart from '../components/StatusChart.vue';
import BrokerChart from '../components/BrokerChart.vue';
import BrokerDetailPanel from '../components/BrokerDetailPanel.vue';
import ReportSection from '../components/ReportSection.vue';

logger.info('StatsView starting...', { context: 'StatsView' });

const message = useMessage();
const todoStore = useTodoStore();
const brokerStore = useBrokerStore();

// ==================== 状态管理 ====================
const globalTimeRange = ref<'today' | 'week' | 'all'>('all');
const reportTimeRange = ref<'daily' | 'weekly' | 'custom'>('daily');
const reportCustomRange = ref<[number, number] | null>(null);

// ==================== 辅助函数 ====================
function getGlobalDateRange(): [Date, Date] | null {
  switch (globalTimeRange.value) {
    case 'today': return getToday();
    case 'week': return getThisWeek();
    case 'all': return null;
    default: return null;
  }
}

function getReportDateRange(): [Date, Date] {
  switch (reportTimeRange.value) {
    case 'daily': return getToday();
    case 'weekly': return getLast7Days();
    case 'custom':
      if (reportCustomRange.value) {
        return [new Date(reportCustomRange.value[0]), new Date(reportCustomRange.value[1])];
      }
      return getToday();
    default: return getToday();
  }
}

function getReportTitle(): string {
  const [start, end] = getReportDateRange();
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const formatDateRange = (start: Date, end: Date) => {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  };

  if (reportTimeRange.value === 'daily') {
    return `📅 日报 - ${formatDate(start)}`;
  } else if (reportTimeRange.value === 'weekly') {
    return `📆 周报 - ${formatDateRange(start, end)}`;
  } else {
    return `📊 自定义报告 - ${formatDateRange(start, end)}`;
  }
}

// ==================== 计算属性 ====================
const dateRangeRef = computed(() => getGlobalDateRange());

const filteredTodos = computed(() => {
  const range = getGlobalDateRange();
  if (!range) return todoStore.todos;
  const [start, end] = range;
  return todoStore.todos.filter(todo => isInDateRange(todo.created_at, start, end));
});

// 使用 useStatsData composable
const { statusStats, brokerStatsDetailed, brokerStats, timeTrendData } = useStatsData(
  filteredTodos,
  dateRangeRef
);

// 报告数据
const reportTodos = computed(() => {
  const [start, end] = getReportDateRange();
  return todoStore.todos.filter(todo => {
    if (todo.status !== 'completed') return false;
    return isInDateRange(todo.updated_at, start, end);
  });
});

const reportBrokerStats = computed(() => {
  const stats: Record<string, typeof todoStore.todos> = {};
  reportTodos.value.forEach(todo => {
    if (!stats[todo.broker]) stats[todo.broker] = [];
    stats[todo.broker].push(todo);
  });
  return stats;
});

// 使用 useReportExport composable
const { exportMarkdown, exportText } = useReportExport(
  computed(() => getReportTitle()),
  reportTimeRange,
  reportTodos,
  reportBrokerStats,
  getReportDateRange
);

// ==================== 事件处理 ====================
function handleRefresh() {
  todoStore.fetchTodos();
  brokerStore.fetchBrokerPool();
  message.success('数据已刷新');
  logger.info('Stats refreshed manually', { context: 'StatsView' });
}

function handleCustomRangeChange(range: [number, number] | null) {
  reportCustomRange.value = range;
}

function handleExportMarkdown() {
  exportMarkdown(
    () => message.success('导出成功'),
    () => message.error('导出失败')
  );
}

function handleExportText() {
  exportText(
    () => message.success('导出成功'),
    () => message.error('导出失败')
  );
}

// ==================== 生命周期 ====================
onMounted(async () => {
  logger.info('Component mounted', { context: 'StatsView' });
  await todoStore.fetchTodos();
  await brokerStore.fetchBrokerPool();
  logger.info('Data loaded', {
    context: 'StatsView',
    data: {
      todos: todoStore.todos.length,
      brokers: brokerStore.brokers.length
    }
  });
});

let unlistenTodoUpdated: (() => void) | null = null;
onMounted(async () => {
  unlistenTodoUpdated = await listen('todo-updated', () => {
    logger.info('Todo updated event received', { context: 'StatsView' });
    todoStore.fetchTodos();
  });
});

onUnmounted(() => {
  if (unlistenTodoUpdated) {
    unlistenTodoUpdated();
    logger.info('Event listener cleaned up', { context: 'StatsView' });
  }
});
</script>

<template>
  <div class="stats-view">
    <div class="stats-container">
      <n-space vertical :size="16">
        <!-- 时间范围选择器 -->
        <TimeRangeSelector
          v-model="globalTimeRange"
          @refresh="handleRefresh"
        />

        <!-- 总览卡片 -->
        <StatsSummaryCards
          :total-count="filteredTodos.length"
          :pending-count="statusStats.pending"
          :in-progress-count="statusStats.in_progress"
          :completed-count="statusStats.completed"
        />

        <!-- 时间维度分析 -->
        <n-card title="📈 时间维度分析">
          <n-space :size="12">
            <TimeTrendChart
              :date-labels="timeTrendData.dateLabels"
              :created-counts="timeTrendData.createdCounts"
              :completed-counts="timeTrendData.completedCounts"
            />
            <StatusChart
              :pending-count="statusStats.pending"
              :in-progress-count="statusStats.in_progress"
              :completed-count="statusStats.completed"
            />
          </n-space>
        </n-card>

        <!-- 券商维度分析 -->
        <n-card title="🏢 券商维度分析">
          <BrokerChart :broker-stats="brokerStats" />
          <BrokerDetailPanel :broker-stats-detailed="brokerStatsDetailed" />
        </n-card>

        <!-- 日报/周报生成 -->
        <ReportSection
          v-model:report-time-range="reportTimeRange"
          :report-title="getReportTitle()"
          :report-todos="reportTodos"
          :report-broker-stats="reportBrokerStats"
          @custom-range-change="handleCustomRangeChange"
          @export-markdown="handleExportMarkdown"
          @export-text="handleExportText"
        />
      </n-space>
    </div>
  </div>
</template>

<style scoped>
.stats-view {
  min-height: 100vh;
  background-color: rgb(16, 16, 20);
  overflow-y: auto;
}

.stats-container {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
