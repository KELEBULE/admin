<template>
  <div>
    <NFlex class="rounded-10px p-10px h-full bg-#fff">
      <NTabs class="w-full">
        <NTabPane name="menu-config" tab="菜单配置" class="w-full h-full">
          <MenuConfig></MenuConfig>
        </NTabPane>
        <NTabPane name="role-config" tab="角色配置" class="w-full h-full"></NTabPane>
        <NTabPane name="user-config" tab="用户配置" class="w-full h-full"></NTabPane>
      </NTabs>
    </NFlex>
  </div>
</template>

<script setup lang="ts">
import MenuConfig from './components/menu-config/index.vue';
</script>

<style scoped></style>
