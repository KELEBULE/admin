<template>
  <div class="h-full w-full">
    <NGrid class="h-full w-full" :cols="10" x-gap="16">
      <NGridItem :span="7" class="h-full">
        <NFlex vertical class="h-full w-full" :size="16">
          <NCard class="flex-1" :bordered="false">
            <DataCard></DataCard>
          </NCard>
          <NCard class="h-450px" :bordered="false">
            <AiCard></AiCard>
          </NCard>
        </NFlex>
      </NGridItem>
      <NGridItem :span="3" class="h-full w-full">
        <NFlex vertical class="h-full w-full" :size="16">
          <NCard class="h-200px" :bordered="false">
            <UserCard></UserCard>
          </NCard>
          <NCard class="flex-1 min-h-0" :bordered="false">
            <WorkOrderCard></WorkOrderCard>
          </NCard>
          <NCard class="flex-1 min-h-0 !h-full" :bordered="false">
            <NoticeCard></NoticeCard>
          </NCard>
        </NFlex>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import WorkOrderCard from './components/work-order-card/index.vue';
import NoticeCard from './components/notice-card/index.vue';
import UserCard from './components/user-card/index.vue';
import DataCard from './components/data-card/index.vue';
import AiCard from './components/ai-card/index.vue';
</script>

<style scoped>
:deep(.n-card__content) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
