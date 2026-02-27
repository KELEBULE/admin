<template>
  <div>
    <NFlex class="rounded-10px p-10px h-full bg-container">
      <NTabs v-model:value="activeTab" class="w-full" type="line" @update:value="handleTabChange">
        <NTabPane name="rule" :tab="$t('page.alarm.addRule').replace('新增', '')" class="w-full h-full">
          <AlarmRuleTab ref="ruleTabRef" />
        </NTabPane>
        <NTabPane name="notice" :tab="$t('page.alarm.notice.title')" class="w-full h-full">
          <AlarmNoticeTab ref="noticeTabRef" />
        </NTabPane>
      </NTabs>
    </NFlex>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NFlex, NTabPane, NTabs } from 'naive-ui';
import { $t } from '@/locales';
import AlarmRuleTab from './components/alarm-rule-tab.vue';
import AlarmNoticeTab from './components/alarm-notice-tab.vue';

defineOptions({
  name: 'AlarmConfigPage'
});

const activeTab = ref('rule');
const ruleTabRef = ref<InstanceType<typeof AlarmRuleTab>>();
const noticeTabRef = ref<InstanceType<typeof AlarmNoticeTab>>();

function handleTabChange(value: string) {
  if (value === 'notice') {
    noticeTabRef.value?.refresh();
  }
}
</script>
