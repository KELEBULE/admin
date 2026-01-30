<template>
  <div>
    <NModal v-model:show="visible" preset="card" size="huge" class="custom-card" :bordered="false" :segmented="segmented" :style="bodyStyle">
      <template #header>
        <div class="flex items-center justify-between">
          <span>详情</span>
        </div>
      </template>
      <NFlex vertical :size="24">
        <div class="font-bold text-lg text-center">{{ row.title }}</div>
        <div style="text-indent: 2em">
          {{ row.content }}
        </div>
        <div>
          <div class="font-bold">备注： {{ row.remark }}</div>
        </div>
        <div class="text-right text-sm text-gray-500">
          {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
      </NFlex>
      <template #footer>
        <NSpace reverse>
          <NButton @click="visible = false">已读</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
const visible = defineModel<boolean>('visible');
const row = defineModel<any>('row');
const bodyStyle = {
  width: '600px'
};
const segmented = {
  content: 'soft',
  footer: 'soft'
} as const;
</script>
