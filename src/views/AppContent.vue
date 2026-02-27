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
import { getStatusIcon, getStatusColor, getStatusLabel } from '../utils/todo';
import { parseDateString } from '../utils/dateUtils';

logger.info('AppContent starting...', { context: 'AppContent' });

const message = useMessage();
const dialog = useDialog();
const todoStore = useTodoStore();
const brokerStore = useBrokerStore();

const showModal = ref(false);
const editingId = ref<string | null>(null);

// 结论对话框相关
const showConclusionDialog = ref(false);
const conclusionFormData = ref<{
  todo: Todo | null;
  conclusion: string;
}>({
  todo: null,
  conclusion: '',
});

const formData = ref<{
  title: string;
  status: TodoStatus;
  broker: string;
  conclusion: string;
}>({
  title: '',
  status: 'pending',
  broker: '',
  conclusion: '',
});

const filterStatus = ref<string>('incomplete');
const filterBroker = ref<string[]>(['all']);
const filterCreatedDateRange = ref<[number, number] | null>(null);
const filterUpdatedDateRange = ref<[number, number] | null>(null);
const searchQuery = ref('');

const statusOptions = [
  { label: '待办', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
];

const filterStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '未完成', value: 'incomplete' },
  { label: '已完成', value: 'completed' },
];

const brokerOptions = computed(() =>
  brokerStore.brokers.map(b => ({ label: b, value: b }))
);

const filterBrokerOptions = computed(() => [
  { label: '全部', value: 'all' },
  ...brokerOptions.value
]);

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
    if (todo.deleted_at) {
      return false;
    }

    // 状态筛选
    let statusMatch = false;
    if (filterStatus.value === 'all') {
      statusMatch = true;
    } else if (filterStatus.value === 'incomplete') {
      // "未完成"包括 pending 和 in_progress
      statusMatch = todo.status === 'pending' || todo.status === 'in_progress';
    } else if (filterStatus.value === 'completed') {
      statusMatch = todo.status === 'completed';
    }

    // 券商筛选
    const brokerMatch = filterBroker.value.includes('all') || filterBroker.value.includes(todo.broker);

    // 创建时间筛选
    let createdDateMatch = true;
    if (filterCreatedDateRange.value) {
      const [start, end] = filterCreatedDateRange.value;
      const createdTime = parseDateString(todo.created_at).getTime();
      createdDateMatch = createdTime >= start && createdTime <= end;
    }

    // 更新时间筛选
    let updatedDateMatch = true;
    if (filterUpdatedDateRange.value) {
      const [start, end] = filterUpdatedDateRange.value;
      const updatedTime = parseDateString(todo.updated_at).getTime();
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
    conclusion: '',
  };
  showModal.value = true;
};

const openEditModal = (todo: Todo) => {
  editingId.value = todo.id;
  formData.value = {
    title: todo.title,
    status: todo.status,
    broker: todo.broker,
    conclusion: todo.conclusion || '',
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

  if (formData.value.status === 'completed' && !formData.value.conclusion.trim()) {
    message.error('完成状态必须填写结论');
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

const handleDelete = async (id: string) => {
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
      filterStatus.value = 'incomplete';
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
      // 从 in_progress 切换到 completed 时，弹出结论对话框
      conclusionFormData.value.todo = todo;
      conclusionFormData.value.conclusion = todo.conclusion || '';
      showConclusionDialog.value = true;
      return; // 不直接更新，等待对话框确认
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

// 处理结论提交
const handleConclusionSubmit = async () => {
  const todo = conclusionFormData.value.todo;
  if (!todo) return;

  try {
    await todoStore.updateTodo(todo.id, {
      status: 'completed',
      conclusion: conclusionFormData.value.conclusion.trim(),
    });
    message.success('任务已完成');
    showConclusionDialog.value = false;
    conclusionFormData.value.todo = null;
    conclusionFormData.value.conclusion = '';
  } catch (e) {
    message.error('更新失败');
  }
};

// 取消结论对话框
const handleConclusionCancel = () => {
  showConclusionDialog.value = false;
  conclusionFormData.value.todo = null;
  conclusionFormData.value.conclusion = '';
};

let unlistenRefresh: (() => void) | null = null;

onMounted(async () => {
  logger.info('Component mounted', { context: 'AppContent' });
  await brokerStore.fetchBrokerPool();
  brokerStore.loadLastUsedBroker();
  await todoStore.fetchTodos();
  todoStore.startSync();

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
  todoStore.stopSync();
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
                :title="`当前: ${getStatusLabel(todo.status)}`"
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
                    {{ getStatusLabel(todo.status) }}
                  </n-tag>
                  <n-tag size="small" round type="default">
                    创建: {{ todo.created_at }}
                  </n-tag>
                  <n-tag size="small" round type="default">
                    更新: {{ todo.updated_at }}
                  </n-tag>
                </n-space>

                <!-- 显示结论 -->
                <div v-if="todo.conclusion" class="mt-2">
                  <n-text depth="2" class="text-sm">
                    结论: {{ todo.conclusion }}
                  </n-text>
                </div>
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

          <n-form-item label="结论">
            <n-input
              v-model:value="formData.conclusion"
              type="textarea"
              placeholder="任务完成结论（可选）"
              :rows="4"
              :maxlength="2000"
              show-count
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-space justify="end">
            <n-button @click="showModal = false">取消</n-button>
            <n-button type="primary" secondary @click="handleSave">保存</n-button>
          </n-space>
        </template>
      </n-modal>

      <!-- 完成任务结论对话框 -->
      <n-modal
        v-model:show="showConclusionDialog"
        title="完成任务"
        preset="card"
        style="width: 600px"
      >
        <div v-if="conclusionFormData.todo">
          <n-space vertical :size="12">
            <!-- 任务信息展示 -->
            <n-card size="small">
              <n-space vertical :size="8">
                <div>
                  <n-text strong>标题: </n-text>
                  <n-text>{{ conclusionFormData.todo.title }}</n-text>
                </div>
                <div>
                  <n-text strong>券商: </n-text>
                  <n-text>{{ conclusionFormData.todo.broker }}</n-text>
                </div>
                <div>
                  <n-text strong>状态: </n-text>
                  <n-tag type="info" size="small">进行中</n-tag>
                </div>
                <div>
                  <n-text strong>创建时间: </n-text>
                  <n-text depth="3">{{ conclusionFormData.todo.created_at }}</n-text>
                </div>
                <div>
                  <n-text strong>更新时间: </n-text>
                  <n-text depth="3">{{ conclusionFormData.todo.updated_at }}</n-text>
                </div>
              </n-space>
            </n-card>

            <!-- 结论输入框 -->
            <n-form-item label="任务结论">
              <n-input
                v-model:value="conclusionFormData.conclusion"
                type="textarea"
                placeholder="请填写任务完成结论..."
                :rows="5"
                :maxlength="2000"
                show-count
              />
            </n-form-item>
          </n-space>
        </div>

        <template #footer>
          <n-space justify="end">
            <n-button @click="handleConclusionCancel">取消</n-button>
            <n-button type="success" secondary @click="handleConclusionSubmit">
              确认完成
            </n-button>
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
