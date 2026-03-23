<template>
  <div id="monitor-center" class="relative w-full h-full overflow-hidden">
    <ModelViewer
      ref="modelViewerRef"
      :model-url="currentModelUrl"
      @loaded="handleLoaded"
      @update:tooltip="handleTooltip"
      @part-clicked="handlePartClicked"
    />

    <div v-show="loading" class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-100">
      <NSpin size="large" />
      <NText class="mt-16px">{{ $t('page.monitor.loadingModel') }}</NText>
    </div>
    <TopBar :current-device-id="currentDeviceId" @device-change="handleDeviceChange" @date-change="handleDateChange" />
    <ViewBar ref="viewBarRef" @switch-view="handleSwitchView" />
    <LeftDrawer
      :device-tree="deviceTree"
      :tree-loading="treeLoading"
      :current-device="currentDevice"
      :current-part="currentPart"
      @part-select="handlePartSelect"
      @part-click="handlePartClickFromDrawer"
    />
    <RightDrawer :current-device-id="currentDeviceId" :current-part="currentPart" :date-range="dateRange" @clear-part="handleClearPart" />

    <div
      v-show="tooltip.visible"
      class="fixed px-8px py-12px rounded-4px text-12px pointer-events-none z-100 shadow-[0_2px_8px_rgba(0,0,0,0.15)] border max-w-200px break-all"
      :style="{ left: tooltip.left, top: tooltip.top }"
    >
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMonitorCenter } from './hooks/use-monitor-center';
import ModelViewer from './components/model-viewer.vue';
import ViewBar from './components/view-bar.vue';
import LeftDrawer from './components/left-drawer.vue';
import RightDrawer from './components/right-drawer.vue';
import TopBar from './components/top-bar.vue';
import type { ViewType } from './components/view-bar.vue';

const modelViewerRef = ref<InstanceType<typeof ModelViewer>>();
const viewBarRef = ref<InstanceType<typeof ViewBar>>();

const {
  loading,
  treeLoading,
  deviceTree,
  currentDevice,
  currentModelUrl,
  currentDeviceId,
  pendingHighlightPart,
  tooltip,
  dateRange,
  currentPart,
  loadInitialData,
  updateTooltip,
  switchDevice,
  selectPart,
  loadPartDetailByCode,
  setModelLoaded,
  clearPendingHighlight,
  setDateRange,
  setCurrentPart
} = useMonitorCenter();

function handleLoaded() {
  setModelLoaded();

  if (pendingHighlightPart.value?.code) {
    setTimeout(() => {
      modelViewerRef.value?.highlightPartByNodeName(pendingHighlightPart.value!.code);
      clearPendingHighlight();
    }, 500);
  }
}

function handleTooltip(data: { visible: boolean; text: string; left: string; top: string }) {
  updateTooltip(data);
}

async function handlePartClicked(data: { partCode: string; partName: string }) {
  await loadPartDetailByCode(data.partCode);
  if (currentPart.value) {
    modelViewerRef.value?.highlightPartByNodeName(data.partCode);
  }
}

function handleSwitchView(view: ViewType) {
  const position = viewBarRef.value?.getViewPosition(view);
  if (position) {
    modelViewerRef.value?.animateCameraTo(position, undefined, 1200);
  }
}

async function handlePartSelect(part: Api.Equipment.MonitorDeviceTreeNode) {
  await selectPart(part);
  if (part.code && !part.deviceId) {
    modelViewerRef.value?.highlightPartByNodeName(part.code);
  }
}

function handlePartClickFromDrawer(part: Api.Equipment.DevicePart) {
  setCurrentPart(part);
  if (part.partCode) {
    modelViewerRef.value?.highlightPartByNodeName(part.partCode);
  }
}

function handleDeviceChange(device: { deviceId: number; modelUrl: string; deviceName: string; imageUrl: string } | null) {
  if (!device) return;
  switchDevice(device);
  modelViewerRef.value?.resetHighlight();
}

function handleDateChange(range: [number, number] | null) {
  setDateRange(range);
}

function handleClearPart() {
  setCurrentPart(null);
  modelViewerRef.value?.resetHighlight();
  modelViewerRef.value?.animateCameraTo({ x: 4, y: 3, z: 4 }, { x: 0, y: 0, z: 0 }, 800);
}

onMounted(() => {
  loadInitialData();
});
</script>
