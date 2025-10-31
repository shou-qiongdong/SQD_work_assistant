import { computed, type Ref } from 'vue';
import type { Todo } from '../types/todo';
import { useTodoStore } from '../store/todo';
import { isInDateRange, formatDate, getDatesBetween } from '../utils/dateUtils';

export function useStatsData(
  filteredTodos: Ref<Todo[]>,
  dateRange: Ref<[Date, Date] | null>
) {
  const todoStore = useTodoStore();

  // 状态统计
  const statusStats = computed(() => {
    const stats = { pending: 0, in_progress: 0, completed: 0 };
    filteredTodos.value.forEach((todo) => {
      stats[todo.status]++;
    });
    return stats;
  });

  // 券商统计（详细）
  const brokerStatsDetailed = computed(() => {
    const stats: Record<string, {
      pending: Todo[];
      in_progress: Todo[];
      completed: Todo[];
      total: number;
    }> = {};

    filteredTodos.value.forEach((todo) => {
      if (!stats[todo.broker]) {
        stats[todo.broker] = {
          pending: [],
          in_progress: [],
          completed: [],
          total: 0
        };
      }
      stats[todo.broker][todo.status].push(todo);
      stats[todo.broker].total++;
    });

    return stats;
  });

  // 券商统计（简单计数）
  const brokerStats = computed(() => {
    const stats: Record<string, number> = {};
    filteredTodos.value.forEach((todo) => {
      if (!stats[todo.broker]) stats[todo.broker] = 0;
      stats[todo.broker]++;
    });
    return stats;
  });

  // 时间趋势数据
  const timeTrendData = computed(() => {
    let dates: Date[];

    if (!dateRange.value) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 29);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      dates = getDatesBetween(thirtyDaysAgo, today);
    } else {
      const [start, end] = dateRange.value;
      dates = getDatesBetween(start, end);
    }

    return calculateTrendData(dates);
  });

  function calculateTrendData(dates: Date[]) {
    const dateLabels: string[] = [];
    const createdCounts: number[] = [];
    const completedCounts: number[] = [];

    dates.forEach(date => {
      const dateStr = formatDate(date);
      dateLabels.push(dateStr);

      const created = todoStore.todos.filter(todo => {
        const todoDate = formatDate(new Date(todo.created_at));
        return todoDate === dateStr;
      }).length;

      const completed = todoStore.todos.filter(todo => {
        if (todo.status !== 'completed') return false;
        const todoDate = formatDate(new Date(todo.updated_at));
        return todoDate === dateStr;
      }).length;

      createdCounts.push(created);
      completedCounts.push(completed);
    });

    return {
      dateLabels,
      createdCounts,
      completedCounts
    };
  }

  return {
    statusStats,
    brokerStatsDetailed,
    brokerStats,
    timeTrendData
  };
}
