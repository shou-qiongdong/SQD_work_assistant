<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

interface Props {
  dateLabels: string[];
  createdCounts: number[];
  completedCounts: number[];
}

const props = defineProps<Props>();

const chartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#333',
    textStyle: { color: '#fff' }
  },
  legend: {
    data: ['创建任务', '完成任务'],
    textStyle: { color: '#fff' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.dateLabels,
    axisLine: { lineStyle: { color: '#666' } },
    axisLabel: { color: '#999', rotate: 45 }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: '#666' } },
    splitLine: { lineStyle: { color: '#333' } },
    axisLabel: { color: '#999' }
  },
  series: [
    {
      name: '创建任务',
      type: 'line',
      data: props.createdCounts,
      smooth: true,
      itemStyle: { color: '#2080f0' },
      areaStyle: { color: 'rgba(32, 128, 240, 0.1)' }
    },
    {
      name: '完成任务',
      type: 'line',
      data: props.completedCounts,
      smooth: true,
      itemStyle: { color: '#18a058' },
      areaStyle: { color: 'rgba(24, 160, 88, 0.1)' }
    }
  ]
}));
</script>

<template>
  <div class="chart-wrapper">
    <v-chart :option="chartOption" style="height: 300px; min-width: 400px;" />
  </div>
</template>

<style scoped>
.chart-wrapper {
  flex: 1;
  min-width: 400px;
}
</style>
