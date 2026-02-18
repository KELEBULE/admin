<template>
  <div class="absolute top-0 left-0 h-full w-0 overflow-visible z-100">
    <Transition name="drawer-left">
      <div
        v-show="visible"
        class="absolute top-16px left-16px w-320px h-[calc(100%-32px)] bg-white/95 dark:bg-black/60 backdrop-blur-8px rounded-r-8px shadow-[2px_0_8px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
      >
        <div class="px-16px py-16px border-b border-b-#a8c8e8 dark:border-b-white/10">
          <span class="text-16px font-500 text-#1b3a5a dark:text-white/90">设备信息</span>
        </div>
        <NScrollbar class="flex-1">
          <div class="px-12px py-8px">
            <NCollapse :default-expanded-names="['1', '2', '3']">
              <NCollapseItem title="基本信息" name="1">
                <div class="flex items-center py-2 border-b border-b-#a8c8e8 dark:border-b-white/10">
                  <span class="text-#4a6d8c dark:text-white/60 text-13px min-w-80px">设备名称：</span>
                  <span class="text-#1b3a5a dark:text-white/90 text-13px font-500">SU7 智能设备</span>
                </div>
                <div class="flex items-center py-2 border-b border-b-#a8c8e8 dark:border-b-white/10">
                  <span class="text-#4a6d8c dark:text-white/60 text-13px min-w-80px">设备编号：</span>
                  <span class="text-#1b3a5a dark:text-white/90 text-13px font-500">DEV-2024-001</span>
                </div>
                <div class="flex items-center py-2 border-b border-b-#a8c8e8 dark:border-b-white/10">
                  <span class="text-#4a6d8c dark:text-white/60 text-13px min-w-80px">设备状态：</span>
                  <NTag type="success" size="small">运行中</NTag>
                </div>
                <div class="flex items-center py-2">
                  <span class="text-#4a6d8c dark:text-white/60 text-13px min-w-80px">运行时长：</span>
                  <span class="text-#1b3a5a dark:text-white/90 text-13px font-500">1,234 小时</span>
                </div>
              </NCollapseItem>

              <NCollapseItem title="传感器数据" name="2">
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-#d4e5f7 dark:bg-white/10 rounded-8px p-3 text-center">
                    <div class="text-18px font-600 text-#1890ff">72.5°C</div>
                    <div class="text-12px text-#4a6d8c dark:text-white/50 mt-1">温度</div>
                  </div>
                  <div class="bg-#d4e5f7 dark:bg-white/10 rounded-8px p-3 text-center">
                    <div class="text-18px font-600 text-#1890ff">45%</div>
                    <div class="text-12px text-#4a6d8c dark:text-white/50 mt-1">湿度</div>
                  </div>
                  <div class="bg-#d4e5f7 dark:bg-white/10 rounded-8px p-3 text-center">
                    <div class="text-18px font-600 text-#1890ff">1013 hPa</div>
                    <div class="text-12px text-#4a6d8c dark:text-white/50 mt-1">气压</div>
                  </div>
                  <div class="bg-#d4e5f7 dark:bg-white/10 rounded-8px p-3 text-center">
                    <div class="text-18px font-600 text-#1890ff">3.2 m/s</div>
                    <div class="text-12px text-#4a6d8c dark:text-white/50 mt-1">风速</div>
                  </div>
                </div>
              </NCollapseItem>

              <NCollapseItem title="告警信息" name="3">
                <NSpace vertical :size="8">
                  <NAlert type="warning" title="温度预警" size="small">设备温度接近上限阈值</NAlert>
                  <NAlert type="info" title="维护提醒" size="small">距离下次维护还有 15 天</NAlert>
                </NSpace>
              </NCollapseItem>
            </NCollapse>
          </div>
        </NScrollbar>
      </div>
    </Transition>

    <div
      class="absolute top-50% transform-translate-y--50% w-28px h-60px bg-white/95 dark:bg-black/60 rounded-r-8px flex items-center justify-center cursor-pointer shadow-[2px_0_8px_rgba(0,0,0,0.1)] transition-all duration-300 z-99 hover:bg-#1890ff hover:text-white"
      :class="visible ? 'left-336px' : 'left-16px'"
      @click.stop="toggleDrawer"
    >
      <SvgIcon :icon="visible ? 'mdi:chevron-left' : 'mdi:chevron-right'" class="text-18px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '@/components/custom/svg-icon.vue';

const visible = ref(true);

function toggleDrawer() {
  visible.value = !visible.value;
}
</script>

<style scoped>
.drawer-left-enter-active,
.drawer-left-leave-active {
  transition: transform 0.3s ease;
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  transform: translateX(-100%);
}
</style>
