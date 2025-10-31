<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  NCard, NSpace, NText, NTag, NButton, NButtonGroup,
  NDatePicker, NDivider, useMessage
} from 'naive-ui';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';
import type { Todo } from '../../types/todo';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

interface Props {
  reportTimeRange: 'daily' | 'weekly' | 'custom';
  reportTitle: string;
  reportTodos: Todo[];
  reportBrokerStats: Record<string, Todo[]>;
}

interface Emits {
  (e: 'update:reportTimeRange', value: 'daily' | 'weekly' | 'custom'): void;
  (e: 'customRangeChange', range: [number, number] | null): void;
  (e: 'exportMarkdown'): void;
  (e: 'exportText'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();
const showReportCustomPicker = ref(false);
const reportCustomRange = ref<[number, number] | null>(null);

function handleReportRangeChange(range: 'daily' | 'weekly') {
  emit('update:reportTimeRange', range);
  showReportCustomPicker.value = false;
}

function handleCustomRangeSelect() {
  if (reportCustomRange.value) {
    emit('update:reportTimeRange', 'custom');
    emit('customRangeChange', reportCustomRange.value);
  }
}

function handleExportMarkdown() {
  emit('exportMarkdown');
}

function handleExportText() {
  emit('exportText');
}

const reportBrokerPieOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#333',
    textStyle: { color: '#fff' }
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: { color: '#fff' }
  },
  series: [{
    type: 'pie',
    radius: '60%',
    data: Object.entries(props.reportBrokerStats).map(([broker, todos]) => ({
      name: broker,
      value: todos.length,
    })),
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    label: {
      color: '#fff',
      formatter: '{b}: {c} ({d}%)'
    }
  }]
}));
</script>

<template>
  <n-card title="📋 日报/周报">
    <n-space class="mb-4" vertical :size="12">
      <n-space :size="12">
        <n-button-group>
          <n-button
            :type="reportTimeRange === 'daily' ? 'primary' : 'default'"
            @click="handleReportRangeChange('daily')"
          >
            📅 日报（今日）
          </n-button>
          <n-button
            :type="reportTimeRange === 'weekly' ? 'primary' : 'default'"
            @click="handleReportRangeChange('weekly')"
          >
            📆 周报（近7天）
          </n-button>
          <n-button @click="showReportCustomPicker = !showReportCustomPicker">
            {{ showReportCustomPicker ? '▲ 收起' : '▼ 更多...' }}
          </n-button>
        </n-button-group>
      </n-space>

      <div v-if="showReportCustomPicker">
        <n-date-picker
          v-model:value="reportCustomRange"
          type="daterange"
          clearable
          placeholder="选择自定义时间范围"
          @update:value="handleCustomRangeSelect"
        />
      </div>
    </n-space>

    <n-divider>
      <n-text strong class="text-lg">{{ reportTitle }}</n-text>
    </n-divider>

    <div class="mb-4">
      <n-space :size="12" class="mb-3">
        <n-tag type="success" size="large">
          已完成任务：{{ reportTodos.length }} 个
        </n-tag>
        <n-tag type="info" size="large">
          涉及券商：{{ Object.keys(reportBrokerStats).length }} 个
        </n-tag>
      </n-space>
    </div>

    <div v-if="reportTodos.length > 0" class="mb-4">
      <v-chart :option="reportBrokerPieOption" style="height: 300px;" />
    </div>

    <div v-if="reportTodos.length > 0">
      <n-divider>任务明细</n-divider>
      <div
        v-for="(todos, broker) in reportBrokerStats"
        :key="broker"
        class="broker-report-section"
      >
        <n-text strong class="text-base" style="color: #2080f0">
          {{ broker }} ({{ todos.length }}个任务)
        </n-text>
        <div class="mt-2 space-y-1">
          <div
            v-for="(todo, index) in todos"
            :key="todo.id"
            class="report-task-item"
          >
            <n-text depth="2" class="text-sm">{{ index + 1 }}.</n-text>
            <n-text class="ml-2">✅ {{ todo.title }}</n-text>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <n-text depth="3">该时间范围内暂无完成的任务</n-text>
    </div>

    <n-divider />
    <n-space justify="center">
      <n-button
        type="primary"
        @click="handleExportMarkdown"
        :disabled="reportTodos.length === 0"
      >
        📄 导出 Markdown
      </n-button>
      <n-button
        @click="handleExportText"
        :disabled="reportTodos.length === 0"
      >
        📝 导出纯文本
      </n-button>
    </n-space>
  </n-card>
</template>

<style scoped>
.broker-report-section {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.03);
}

.report-task-item {
  display: flex;
  align-items: flex-start;
  padding: 4px 0;
}

.space-y-1 > * + * {
  margin-top: 4px;
}
</style>
