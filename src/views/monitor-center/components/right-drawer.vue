<template>
  <div class="absolute top-0 right-0 h-full w-0 overflow-visible z-100">
    <Transition name="drawer-right">
      <div
        v-show="visible"
        class="absolute top-16px right-16px w-360px h-[calc(100%-32px)] bg-white/95 dark:bg-black/60 backdrop-blur-8px rounded-l-8px shadow-[-2px_0_8px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
      >
        <div class="px-16px py-16px border-b border-b-#a8c8e8 dark:border-b-white/10">
          <span class="text-16px font-500 text-#1b3a5a dark:text-white/90">操作面板</span>
        </div>
        <NScrollbar class="flex-1">
          <div class="px-12px py-8px">
            <NSpace vertical :size="16">
              <NCard size="small" title="快捷操作">
                <NSpace vertical :size="8">
                  <NButton type="primary" block>
                    <template #icon>
                      <SvgIcon icon="mdi:play" class="text-16px" />
                    </template>
                    启动设备
                  </NButton>
                  <NButton block>
                    <template #icon>
                      <SvgIcon icon="mdi:stop" class="text-16px" />
                    </template>
                    停止设备
                  </NButton>
                  <NButton block>
                    <template #icon>
                      <SvgIcon icon="mdi:refresh" class="text-16px" />
                    </template>
                    重置状态
                  </NButton>
                </NSpace>
              </NCard>

              <NCard size="small" title="参数调节">
                <NSpace vertical :size="12">
                  <div class="flex items-center gap-3">
                    <span class="min-w-50px text-13px text-#4a6d8c dark:text-white/60">速度</span>
                    <NSlider v-model:value="speed" :step="1" :min="0" :max="100" class="flex-1" />
                    <span class="min-w-40px text-right text-13px text-#1890ff font-500">{{ speed }}%</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="min-w-50px text-13px text-#4a6d8c dark:text-white/60">亮度</span>
                    <NSlider v-model:value="brightness" :step="1" :min="0" :max="100" class="flex-1" />
                    <span class="min-w-40px text-right text-13px text-#1890ff font-500">{{ brightness }}%</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="min-w-50px text-13px text-#4a6d8c dark:text-white/60">灵敏度</span>
                    <NSlider v-model:value="sensitivity" :step="1" :min="0" :max="100" class="flex-1" />
                    <span class="min-w-40px text-right text-13px text-#1890ff font-500">{{ sensitivity }}%</span>
                  </div>
                </NSpace>
              </NCard>

              <NCard size="small" title="视图设置">
                <NSpace vertical :size="8">
                  <div class="flex justify-between items-center text-13px text-#1b3a5a dark:text-white/90">
                    <span>显示网格</span>
                    <NSwitch v-model:value="showGrid" />
                  </div>
                  <div class="flex justify-between items-center text-13px text-#1b3a5a dark:text-white/90">
                    <span>显示坐标轴</span>
                    <NSwitch v-model:value="showAxis" />
                  </div>
                  <div class="flex justify-between items-center text-13px text-#1b3a5a dark:text-white/90">
                    <span>自动旋转</span>
                    <NSwitch v-model:value="autoRotate" />
                  </div>
                  <div class="flex justify-between items-center text-13px text-#1b3a5a dark:text-white/90">
                    <span>显示阴影</span>
                    <NSwitch v-model:value="showShadow" />
                  </div>
                </NSpace>
              </NCard>

              <NCard size="small" title="操作日志">
                <NScrollbar style="max-height: 150px">
                  <div class="text-12px">
                    <div
                      v-for="(log, index) in logs"
                      :key="index"
                      class="flex gap-2 py-1.5 border-b border-b-#a8c8e8 dark:border-b-white/10 last:border-b-none"
                    >
                      <span class="text-#4a6d8c dark:text-white/50 min-w-60px">{{ log.time }}</span>
                      <span class="text-#1b3a5a dark:text-white/90">{{ log.message }}</span>
                    </div>
                  </div>
                </NScrollbar>
              </NCard>
            </NSpace>
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

const visible = ref(true);
const speed = ref(50);
const brightness = ref(80);
const sensitivity = ref(60);
const showGrid = ref(false);
const showAxis = ref(true);
const autoRotate = ref(false);
const showShadow = ref(true);

const logs = ref([
  { time: '10:23:45', message: '设备启动成功' },
  { time: '10:22:30', message: '参数更新：速度 50%' },
  { time: '10:21:15', message: '连接已建立' },
  { time: '10:20:00', message: '系统初始化完成' }
]);

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
