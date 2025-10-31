<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
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
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

interface Props {
  brokerStats: Record<string, number>;
}

const props = defineProps<Props>();

const chartOption = computed<EChartsOption>(() => {
  const sortedBrokers = Object.entries(props.brokerStats)
    .sort((a, b) => b[1] - a[1]);
  const brokerNames = sortedBrokers.map(([name]) => name);
  const brokerCounts = sortedBrokers.map(([, count]) => count);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: brokerNames,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#999', rotate: brokerNames.length > 5 ? 45 : 0 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#666' } },
      splitLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' }
    },
    series: [{
      type: 'bar',
      data: brokerCounts,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#2080f0' },
            { offset: 1, color: '#18a058' }
          ]
        }
      },
      barWidth: '50%'
    }]
  };
});
</script>

<template>
  <div class="mb-4">
    <v-chart :option="chartOption" style="height: 300px;" />
  </div>
</template>
