<template>
  <NCard class="h-full w-full">
    <NTabs v-model:value="Tab" type="line" animated>
      <NTabPane name="user-info" :label="$t('page.userCenter.userInfo')">
        <UserInfo></UserInfo>
      </NTabPane>
      <NTabPane name="account-config" :label="$t('page.userCenter.accountConfig')">
        <AccountConfig></AccountConfig>
      </NTabPane>
    </NTabs>
  </NCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserInfo from './components/user-info/index.vue';
import AccountConfig from './components/account-config/index.vue';
const Tab = ref('user-info');
</script>

<style scoped></style>
