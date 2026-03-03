<template>
  <div class="absolute top-0 right-0 h-full w-0 overflow-visible z-100">
    <Transition name="drawer-right">
      <div
        v-show="visible"
        class="absolute top-16px right-16px w-360px h-[calc(100%-32px)] bg-white/95 dark:bg-black/60 backdrop-blur-8px rounded-l-8px shadow-[-2px_0_8px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
      >
        <div class="px-16px py-16px border-b border-b-#a8c8e8 dark:border-b-white/10">
          <span class="text-16px font-500 text-#1b3a5a dark:text-white/90">监测数据</span>
        </div>
        <NScrollbar class="flex-1">
          <div class="px-12px py-8px">
            <NCollapse v-if="type === 'device'">
              <NCollapseItem title="频繁报警部件">1</NCollapseItem>
              <NCollapseItem title="频繁告警时间">2</NCollapseItem>
              <NCollapseItem title="频繁报警等级">3</NCollapseItem>
              <NCollapseItem title="检测温度趋势">4</NCollapseItem>
              <NCollapseItem title="报警数量日趋势">5</NCollapseItem>
            </NCollapse>
            <NCollapse v-else>
              <NCollapseItem title="检测温度趋势">1</NCollapseItem>
              <NCollapseItem title="报警温度趋势">2</NCollapseItem>
              <NCollapseItem title="历史报警时间-横轴24小时-纵轴报警次数">3</NCollapseItem>
              <NCollapseItem title="频繁报警等级">4</NCollapseItem>
            </NCollapse>
          </div>
        </NScrollbar>
      </div>
    </Transition>

    <div
      class="absolute top-50% transform-translate-y--50% w-28px h-60px bg-white/95 dark:bg-black/60 rounded-l-8px flex items-center justify-center cursor-pointer shadow-[-2px_0_8px_rgba(0,0,0,0.1)] transition-all duration-300 z-99 hover:bg-#1890ff hover:text-white"
      :class="visible ? 'right-376px' : 'right-16px'"
      @click.stop="toggleDrawer"
    >
      <SvgIcon :icon="visible ? 'mdi:chevron-right' : 'mdi:chevron-left'" class="text-18px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
const type = ref('device');
const visible = ref(true);
function toggleDrawer() {
  visible.value = !visible.value;
}
</script>

<style scoped>
.drawer-right-enter-active,
.drawer-right-leave-active {
  transition: transform 0.3s ease;
}

.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(100%);
}
</style>
