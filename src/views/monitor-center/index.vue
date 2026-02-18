<template>
  <div id="monitor-center" class="relative w-full h-full overflow-hidden">
    <Modal ref="modalRef" @loaded="handleLoaded" @update:tooltip="handleTooltip" />

    <div v-show="loading" class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-100">
      <NSpin size="large" />
      <NText class="mt-16px">正在加载模型...</NText>
    </div>

    <ViewBar ref="viewBarRef" @switch-view="handleSwitchView" />
    <LeftDrawer />
    <RightDrawer />

    <div
      v-show="tooltipVisible"
      class="fixed px-8px py-12px rounded-4px text-12px pointer-events-none z-100 shadow-[0_2px_8px_rgba(0,0,0,0.15)] border max-w-200px break-all"
      :style="tooltipStyle"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Modal from './components/modal.vue';
import ViewBar from './components/view-bar.vue';
import LeftDrawer from './components/left-drawer.vue';
import RightDrawer from './components/right-drawer.vue';
import type { ViewType } from './components/view-bar.vue';

const modalRef = ref<InstanceType<typeof Modal>>();
const viewBarRef = ref<InstanceType<typeof ViewBar>>();

const loading = ref(true);
const tooltipVisible = ref(false);
const tooltipText = ref('');
const tooltipStyle = reactive({ left: '0px', top: '0px' });

function handleLoaded() {
  loading.value = false;
}

function handleTooltip(data: { visible: boolean; text: string; left: string; top: string }) {
  tooltipVisible.value = data.visible;
  tooltipText.value = data.text;
  tooltipStyle.left = data.left;
  tooltipStyle.top = data.top;
}

function handleSwitchView(view: ViewType) {
  const position = viewBarRef.value?.getViewPosition(view);
  if (position) {
    modalRef.value?.animateCameraTo(position, 1200);
  }
}
</script>
