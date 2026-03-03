<template>
  <div class="absolute top-0 left-0 h-full w-0 overflow-visible z-100">
    <Transition name="drawer-left">
      <div
        v-show="visible"
        class="absolute top-16px left-16px w-320px h-[calc(100%-32px)] bg-white/95 dark:bg-black/60 backdrop-blur-8px rounded-r-8px shadow-[2px_0_8px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
      >
        <div class="px-16px py-16px border-b border-b-#a8c8e8 dark:border-b-white/10">
          <span class="text-16px font-500 text-#1b3a5a dark:text-white/90">{{ $t('page.monitor.deviceInfo') }}</span>
        </div>

        <NScrollbar class="flex-1">
          <div class="px-12px py-8px"></div>
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
import { ref, watch } from 'vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';

const props = defineProps<{
  currentDevice: Api.Equipment.LatestAlarmDevice | null;
}>();

const visible = ref(true);

const selectedPartId = ref<number | null>(null);

function toggleDrawer() {
  visible.value = !visible.value;
}

watch(
  () => props.currentDevice,
  newDevice => {
    if (newDevice?.alarmPartId) {
      selectedPartId.value = newDevice.alarmPartId;
    }
  }
);
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
