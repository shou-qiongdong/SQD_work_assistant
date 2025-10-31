<script setup lang="ts">
import { computed } from 'vue';
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

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

interface Props {
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
}

const props = defineProps<Props>();

const chartOption = computed<EChartsOption>(() => ({
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
    center: ['40%', '50%'],
    data: [
      { name: '待办', value: props.pendingCount, itemStyle: { color: '#909399' } },
      { name: '进行中', value: props.inProgressCount, itemStyle: { color: '#2080f0' } },
      { name: '已完成', value: props.completedCount, itemStyle: { color: '#18a058' } }
    ],
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    label: {
      color: '#fff',
      formatter: '{b}: {c}'
    }
  }]
}));
</script>

<template>
  <div class="chart-wrapper">
    <v-chart :option="chartOption" style="height: 300px; min-width: 350px;" />
  </div>
</template>

<style scoped>
.chart-wrapper {
  flex: 1;
  min-width: 350px;
}
</style>
