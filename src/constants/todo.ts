// Todo 状态常量
export const TODO_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export type TodoStatus = typeof TODO_STATUS[keyof typeof TODO_STATUS];

// 状态选项
export const STATUS_OPTIONS = [
  { label: '待办', value: TODO_STATUS.PENDING },
  { label: '进行中', value: TODO_STATUS.IN_PROGRESS },
  { label: '已完成', value: TODO_STATUS.COMPLETED },
];

// 状态图标
export const STATUS_ICONS = {
  [TODO_STATUS.PENDING]: '⭕',
  [TODO_STATUS.IN_PROGRESS]: '🔄',
  [TODO_STATUS.COMPLETED]: '✅',
} as const;

// 状态颜色类型（NaiveUI）
export const STATUS_COLORS = {
  [TODO_STATUS.PENDING]: 'default',
  [TODO_STATUS.IN_PROGRESS]: 'info',
  [TODO_STATUS.COMPLETED]: 'success',
} as const;

// 验证常量
export const VALIDATION = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 500,
  DESCRIPTION_MAX_LENGTH: 2000,
  BROKER_MIN_LENGTH: 1,
  BROKER_MAX_LENGTH: 100,
} as const;
