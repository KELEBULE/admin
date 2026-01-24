<template>
  <NModal v-model:show="visible" class="w-700px h-510px">
    <NCard title="个人中心">
      <NTabs v-model:value="Tab" type="line" animated class="w-full h-full">
        <NTabPane name="user-info" :tab="$t('page.userCenter.userInfo')" class="h-full">
          <UserInfo></UserInfo>
        </NTabPane>
        <NTabPane name="account-config" :tab="$t('page.userCenter.accountConfig')" class="h-full">
          <AccountConfig></AccountConfig>
        </NTabPane>
      </NTabs>
    </NCard>
  </NModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserInfo from './components/user-info/index.vue';
import AccountConfig from './components/account-config/index.vue';
const visible = defineModel<boolean>('visible', { required: true });
const Tab = ref('user-info');
</script>

<style scoped>
:deep(.n-tabs-pane-wrapper) {
  height: 100%;
}
:deep(.n-tabs-pane) {
  height: 100%;
}
</style>
