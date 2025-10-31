<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { listen } from '@tauri-apps/api/event';
import {
  NButton,
  NInput,
  NSpace,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NSelect,
  NCard,
  NText,
  NDatePicker,
  useMessage,
  useDialog,
} from 'naive-ui';
import type { Todo, TodoStatus } from '../types/todo';
import { useTodoStore } from '../store/todo';
import { useBrokerStore } from '../store/broker';
import { logger } from '../utils/logger';

logger.info('AppContent starting...', { context: 'AppContent' });

const message = useMessage();
const dialog = useDialog();
const todoStore = useTodoStore();
const brokerStore = useBrokerStore();

const showModal = ref(false);
const editingId = ref<number | null>(null);

const formData = ref<{
  title: string;
  status: TodoStatus;
  broker: string;
}>({
  title: '',
  status: 'pending',
  broker: '',
});

const filterStatus = ref<string[]>(['all']);
const filterBroker = ref<string[]>(['all']);
const filterCreatedDateRange = ref<[number, number] | null>(null);
const filterUpdatedDateRange = ref<[number, number] | null>(null);
const searchQuery = ref('');

const statusOptions = [
  { label: '待办', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
];

const filterStatusOptions = [{ label: '全部', value: 'all' }, ...statusOptions];

const brokerOptions = computed(() =>
  brokerStore.brokers.map(b => ({ label: b, value: b }))
);

const filterBrokerOptions = computed(() => [
  { label: '全部', value: 'all' },
  ...brokerOptions.value
]);

// 处理"全部"选项的互斥逻辑
const handleStatusChange = (values: string[]) => {
  if (values.includes('all')) {
    // 如果选择了"全部"，只保留"全部"
    if (filterStatus.value.includes('all') && values.length > 1) {
      // 之前就有"全部"，现在选了其他的，移除"全部"
      filterStatus.value = values.filter(v => v !== 'all');
    } else {
      // 新选择了"全部"
      filterStatus.value = ['all'];
    }
  } else {
    filterStatus.value = values.length > 0 ? values : ['all'];
  }
};

const handleBrokerChange = (values: string[]) => {
  if (values.includes('all')) {
    // 如果选择了"全部"，只保留"全部"
    if (filterBroker.value.includes('all') && values.length > 1) {
      // 之前就有"全部"，现在选了其他的，移除"全部"
      filterBroker.value = values.filter(v => v !== 'all');
    } else {
      // 新选择了"全部"
      filterBroker.value = ['all'];
    }
  } else {
    filterBroker.value = values.length > 0 ? values : ['all'];
  }
};

const filteredTodos = computed(() => {
  return todoStore.todos.filter((todo) => {
    // 状态筛选
    const statusMatch = filterStatus.value.includes('all') || filterStatus.value.includes(todo.status);

    // 券商筛选
    const brokerMatch = filterBroker.value.includes('all') || filterBroker.value.includes(todo.broker);

    // 创建时间筛选
    let createdDateMatch = true;
    if (filterCreatedDateRange.value) {
      const [start, end] = filterCreatedDateRange.value;
      const createdTime = new Date(todo.created_at).getTime();
      createdDateMatch = createdTime >= start && createdTime <= end;
    }

    // 更新时间筛选
    let updatedDateMatch = true;
    if (filterUpdatedDateRange.value) {
      const [start, end] = filterUpdatedDateRange.value;
      const updatedTime = new Date(todo.updated_at).getTime();
      updatedDateMatch = updatedTime >= start && updatedTime <= end;
    }

    return statusMatch && brokerMatch && createdDateMatch && updatedDateMatch;
  });
});

const openCreateModal = () => {
  editingId.value = null;
  formData.value = {
    title: '',
    status: 'pending',
    broker: brokerStore.lastUsedBroker || (brokerStore.brokers.length > 0 ? brokerStore.brokers[0] : ''),
  };
  showModal.value = true;
};

const openEditModal = (todo: Todo) => {
  editingId.value = todo.id;
  formData.value = {
    title: todo.title,
    status: todo.status,
    broker: todo.broker,
  };
  showModal.value = true;
};

const handleSave = async () => {
  if (!formData.value.title.trim()) {
    message.error('请输入任务标题');
    return;
  }

  if (!formData.value.broker.trim()) {
    message.error('请选择或输入券商');
    return;
  }

  try {
    if (editingId.value) {
      await todoStore.updateTodo(editingId.value, formData.value);
      message.success('更新成功');
    } else {
      await todoStore.createTodo(formData.value);
      message.success('创建成功');
    }

    // 重新从数据库获取券商池以确保同步
    await brokerStore.fetchBrokerPool();
    brokerStore.setLastUsedBroker(formData.value.broker.trim());

    showModal.value = false;
  } catch (e) {
    logger.error('Save error', { context: 'AppContent', data: e });
    message.error('操作失败');
  }
};

const handleDelete = async (id: number) => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这个任务吗？此操作无法撤销。',
    positiveText: '删除',
    negativeText: '取消',
    positiveButtonProps: {
      type: 'error',
      ghost: true,
    },
    onPositiveClick: async () => {
      try {
        await todoStore.deleteTodo(id);
        message.success('删除成功');
      } catch (e) {
        logger.error('Delete error', { context: 'AppContent', data: e });
        message.error('删除失败');
      }
    }
  });
};

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    try {
      await todoStore.searchTodos(searchQuery.value);
      filterStatus.value = ['all'];
      filterBroker.value = ['all'];
    } catch (e) {
      message.error('搜索失败');
    }
  } else {
    await todoStore.fetchTodos();
  }
};

// 循环切换状态：待办 → 进行中 → 已完成 → 待办
const cycleStatus = async (todo: Todo) => {
  let newStatus: TodoStatus;

  switch (todo.status) {
    case 'pending':
      newStatus = 'in_progress';
      break;
    case 'in_progress':
      newStatus = 'completed';
      break;
    case 'completed':
      newStatus = 'pending';
      break;
    default:
      newStatus = 'pending';
  }

  try {
    await todoStore.updateTodo(todo.id, { status: newStatus });
  } catch (e) {
    message.error('更新失败');
  }
};

// 获取状态图标
const getStatusIcon = (status: TodoStatus) => {
  switch (status) {
    case 'pending':
      return '⭕';  // 待办
    case 'in_progress':
      return '🔄';  // 进行中
    case 'completed':
      return '✅';  // 已完成
    default:
      return '⭕';
  }
};

const getStatusColor = (status: TodoStatus) => {
  return status === 'pending' ? 'default' : status === 'in_progress' ? 'info' : 'success';
};

let unlistenRefresh: (() => void) | null = null;

onMounted(async () => {
  logger.info('Component mounted', { context: 'AppContent' });
  await brokerStore.fetchBrokerPool();
  brokerStore.loadLastUsedBroker();
  await todoStore.fetchTodos();

  // 监听刷新事件
  unlistenRefresh = await listen('refresh-todos', async () => {
    logger.info('Received refresh-todos event', { context: 'AppContent' });
    await todoStore.fetchTodos();
    await brokerStore.fetchBrokerPool(); // 同时刷新券商池
  });
});

onUnmounted(() => {
  // 清理事件监听
  if (unlistenRefresh) {
    unlistenRefresh();
  }
});
</script>

<template>
  <div class="app-content-wrapper">
    <!-- 内容 -->
    <div class="p-6">
      <n-space vertical :size="20">
        <!-- 操作栏 -->
        <n-space justify="space-between">
          <n-space>
            <n-input
              v-model:value="searchQuery"
              placeholder="搜索任务..."
              clearable
              @keyup.enter="handleSearch"
              @clear="todoStore.fetchTodos"
              style="width: 300px"
            />
            <n-button type="primary" secondary @click="handleSearch">搜索</n-button>
          </n-space>
          <n-button type="success" secondary @click="openCreateModal">+ 新建任务</n-button>
        </n-space>

        <!-- 过滤器 -->
        <n-space>
          <n-text depth="3">过滤：</n-text>
          <n-select
            v-model:value="filterStatus"
            :options="filterStatusOptions"
            multiple
            :max-tag-count="2"
            @update:value="handleStatusChange"
            style="width: 160px"
            placeholder="选择状态"
          />
          <n-select
            v-model:value="filterBroker"
            :options="filterBrokerOptions"
            multiple
            :max-tag-count="2"
            @update:value="handleBrokerChange"
            style="width: 160px"
            placeholder="选择券商"
          />
          <n-date-picker
            v-model:value="filterCreatedDateRange"
            type="daterange"
            clearable
            placeholder="创建时间范围"
            style="width: 240px"
          />
          <n-date-picker
            v-model:value="filterUpdatedDateRange"
            type="daterange"
            clearable
            placeholder="更新时间范围"
            style="width: 240px"
          />
          <n-text depth="3">共 {{ filteredTodos.length }} 条任务</n-text>
        </n-space>

        <!-- 任务列表 -->
        <div v-if="filteredTodos.length > 0" class="space-y-3">
          <n-card
            v-for="todo in filteredTodos"
            :key="todo.id"
            hoverable
          >
            <div class="flex items-start gap-3">
              <n-button
                :type="getStatusColor(todo.status)"
                circle
                size="small"
                @click="cycleStatus(todo)"
                :title="`当前: ${statusOptions.find(s => s.value === todo.status)?.label}`"
              >
                {{ getStatusIcon(todo.status) }}
              </n-button>

              <div class="flex-1 min-w-0">
                <n-text
                  strong
                  :depth="todo.status === 'completed' ? 3 : 1"
                  class="text-base"
                >
                  {{ todo.title }}
                </n-text>
                <n-space :size="8" class="mt-2">
                  <n-tag type="info" size="small" round>
                    券商: {{ todo.broker }}
                  </n-tag>
                  <n-tag :type="getStatusColor(todo.status)" size="small" round>
                    {{ statusOptions.find(s => s.value === todo.status)?.label }}
                  </n-tag>
                  <n-tag size="small" round type="default">
                    ⏰ 创建: {{ todo.created_at }}
                  </n-tag>
                  <n-tag size="small" round type="default">
                    🔄 更新: {{ todo.updated_at }}
                  </n-tag>
                </n-space>
              </div>

              <n-space>
                <n-button size="small" secondary @click="openEditModal(todo)">编辑</n-button>
                <n-button size="small" type="error" secondary @click="handleDelete(todo.id)">删除</n-button>
              </n-space>
            </div>
          </n-card>
        </div>

        <n-card v-else>
          <div class="text-center py-16">
            <div class="text-6xl mb-4">📝</div>
            <n-text depth="3" class="text-lg">暂无任务</n-text>
          </div>
        </n-card>
      </n-space>

      <!-- 新建/编辑对话框 -->
      <n-modal
        v-model:show="showModal"
        :title="editingId ? '编辑任务' : '新建任务'"
        preset="card"
        style="width: 600px"
      >
        <n-form :model="formData">
          <n-form-item label="标题" required>
            <n-input v-model:value="formData.title" placeholder="输入任务标题" />
          </n-form-item>

          <n-form-item label="券商" required>
            <n-select
              v-model:value="formData.broker"
              :options="brokerOptions"
              filterable
              tag
              placeholder="选择或输入券商"
            />
          </n-form-item>

          <n-form-item label="状态">
            <n-select v-model:value="formData.status" :options="statusOptions" />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-space justify="end">
            <n-button @click="showModal = false">取消</n-button>
            <n-button type="primary" secondary @click="handleSave">保存</n-button>
          </n-space>
        </template>
      </n-modal>
    </div>
  </div>
</template>

<style scoped>
.app-content-wrapper {
  min-height: 100vh;
  overflow-y: auto;
}

/* 隐藏滚动条但保持滚动功能 */
:deep(*) {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

:deep(*::-webkit-scrollbar) {
  display: none; /* Chrome, Safari, Opera */
}
</style>
