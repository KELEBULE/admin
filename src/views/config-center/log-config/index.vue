<template>
  <div>
    <NFlex class="rounded-10px p-10px h-full bg-#fff">
      <NTabs class="w-full">
        <NTabPane name="login-log" tab="登录日志" class="w-full h-full">
          <LoginLog></LoginLog>
        </NTabPane>
        <NTabPane name="operation-log" tab="操作日志" class="w-full h-full">
          <OperationLog></OperationLog>
        </NTabPane>
        <NTabPane name="error-log" tab="错误日志" class="w-full h-full">
          <ErrorLog></ErrorLog>
        </NTabPane>
        <NTabPane name="dispatch-log" tab="调度日志" class="w-full h-full">
          <DispatchLog></DispatchLog>
        </NTabPane>
      </NTabs>
    </NFlex>
  </div>
</template>

<script setup lang="ts">
import LoginLog from './components/login-log/index.vue';
import OperationLog from './components/operation-log/index.vue';
import ErrorLog from './components/error-log/index.vue';
import DispatchLog from './components/dispatch-log/index.vue';
</script>

<style scoped></style>
