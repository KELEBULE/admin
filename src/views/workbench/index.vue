<template>
  <div class="h-full w-full">
    <NGrid class="h-full w-full" :cols="10" x-gap="16">
      <NGridItem :span="7" class="h-full w-full">
        <NFlex vertical class="h-full w-full">
          <NGrid class="h-full w-full" :cols="1" y-gap="16">
            <NGridItem class="w-full">
              <NCard class="h-full w-full" :bordered="false">
                <DataCard></DataCard>
              </NCard>
            </NGridItem>
            <NGridItem class="w-full">
              <NCard class="h-full w-full" :bordered="false">
                <AiCard></AiCard>
              </NCard>
            </NGridItem>
          </NGrid>
        </NFlex>
      </NGridItem>
      <NGridItem :span="3" class="h-full w-full">
        <NFlex vertical class="h-full w-full">
          <NGrid class="h-full w-full" :cols="1" y-gap="16">
            <NGridItem class="w-full">
              <NCard class="h-full w-full" :bordered="false">
                <UserCard></UserCard>
              </NCard>
            </NGridItem>
            <NGridItem class="w-full">
              <NCard class="h-full w-full" :bordered="false">
                <WorkOrderCard></WorkOrderCard>
              </NCard>
            </NGridItem>
            <NGridItem class="w-full">
              <NCard class="h-full w-full" :bordered="false">
                <NoticeCard></NoticeCard>
              </NCard>
            </NGridItem>
          </NGrid>
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

<style scoped></style>
