<template>
  <div>
    <NFlex class="rounded-10px p-10px h-full bg-container">
      <NTabs class="w-full">
        <NTabPane name="menu-config" tab="菜单配置" class="w-full h-full">
          <MenuConfig></MenuConfig>
        </NTabPane>
        <NTabPane name="dict-config" tab="字典配置" class="w-full h-full">
          <DictConfig></DictConfig>
        </NTabPane>
        <NTabPane name="system-monitor" tab="系统监控" class="h-full">
          <SystemMonitor></SystemMonitor>
        </NTabPane>
        <NTabPane name="cache-monitor" tab="缓存监控" class="h-full">
          <CacheMonitor></CacheMonitor>
        </NTabPane>
        <NTabPane name="ai-config" tab="AI配置" class="h-full">
          <AiConfig></AiConfig>
        </NTabPane>
      </NTabs>
    </NFlex>
  </div>
</template>

<script setup lang="ts">
import MenuConfig from './components/menu-config/index.vue';
import DictConfig from './components/dict-config/index.vue';
import SystemMonitor from './components/system-monitor/index.vue';
import CacheMonitor from './components/cache-monitor/index.vue';
import AiConfig from './components/Ai-config/index.vue';
</script>

<style scoped></style>
