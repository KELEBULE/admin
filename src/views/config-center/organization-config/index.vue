<template>
  <div>
    <NFlex class="rounded-10px p-10px h-full bg-container">
      <NTabs class="w-full">
        <NTabPane name="organization-config" tab="组织配置" class="w-full h-full">
          <OrganizationConfig></OrganizationConfig>
        </NTabPane>
        <NTabPane name="role-config" tab="角色配置" class="w-full h-full">
          <RoleConfig></RoleConfig>
        </NTabPane>
        <NTabPane name="user-config" tab="用户配置" class="w-full h-full">
          <UserConfig></UserConfig>
        </NTabPane>
        <NTabPane name="position-config" tab="岗位配置" class="w-full h-full">
          <PositionConfig></PositionConfig>
        </NTabPane>
      </NTabs>
    </NFlex>
  </div>
</template>

<script setup lang="ts">
import OrganizationConfig from './components/org-config/index.vue';
import RoleConfig from './components/role-config/index.vue';
import UserConfig from './components/user-config/index.vue';
import PositionConfig from './components/position-config/index.vue';
</script>

<style scoped></style>
