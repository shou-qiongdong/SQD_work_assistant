<script setup lang="ts">
import { ref } from 'vue';
import { NMessageProvider, NDialogProvider, NConfigProvider, darkTheme } from 'naive-ui';
import AppContent from './components/AppContent.vue';

console.log('[App] Starting...');

// 默认使用黑夜模式
const theme = ref(darkTheme);
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <n-dialog-provider>
        <div style="min-height: 100vh; background-color: rgb(16, 16, 20);">
          <app-content />
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
/* 全局隐藏滚动条但保持滚动功能 */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

*::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

html, body {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}
</style>
