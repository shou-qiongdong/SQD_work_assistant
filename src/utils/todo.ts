import type { TodoStatus } from '../types/todo';

/**
 * 获取状态对应的图标
 */
export const getStatusIcon = (status: TodoStatus): string => {
  const icons: Record<TodoStatus, string> = {
    pending: '⭕',
    in_progress: '🔄',
    completed: '✅'
  };
  return icons[status] ?? '⭕';
};

/**
 * 获取状态对应的颜色类型
 */
export const getStatusColor = (status: TodoStatus): 'default' | 'info' | 'success' => {
  const colors: Record<TodoStatus, 'default' | 'info' | 'success'> = {
    pending: 'default',
    in_progress: 'info',
    completed: 'success'
  };
  return colors[status];
};

/**
 * 获取状态对应的中文标签
 */
export const getStatusLabel = (status: TodoStatus): string => {
  const labels: Record<TodoStatus, string> = {
    pending: '待办',
    in_progress: '进行中',
    completed: '已完成'
  };
  return labels[status] ?? '未知';
};
