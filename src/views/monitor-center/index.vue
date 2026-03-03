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

    <ViewBar ref="viewBarRef" @switch-view="handleSwitchView" />
    <LeftDrawer
      ref="leftDrawerRef"
      :device-tree="deviceTree"
      :tree-loading="treeLoading"
      :current-device="currentDevice"
      @part-select="handlePartSelect"
    />
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
import { onMounted, reactive, ref } from 'vue';
import { fetchGetDevicePart, fetchGetDevicePartByCode, fetchGetLatestAlarmDevice, fetchGetMonitorDeviceTree } from '@/service/api/equipment';
import ModelViewer from './components/model-viewer.vue';
import ViewBar from './components/view-bar.vue';
import LeftDrawer from './components/left-drawer.vue';
import RightDrawer from './components/right-drawer.vue';
import type { ViewType } from './components/view-bar.vue';

const modelViewerRef = ref<InstanceType<typeof ModelViewer>>();
const viewBarRef = ref<InstanceType<typeof ViewBar>>();
const leftDrawerRef = ref<InstanceType<typeof LeftDrawer>>();

const loading = ref(true);
const tooltipVisible = ref(false);
const tooltipText = ref('');
const tooltipStyle = reactive({ left: '0px', top: '0px' });

const selectedPart = ref<Api.Equipment.DevicePart | null>(null);
const partDetailVisible = ref(false);
const partLoading = ref(false);

const deviceTree = ref<Api.Equipment.MonitorDeviceTreeNode[]>([]);
const treeLoading = ref(false);
const currentDevice = ref<Api.Equipment.LatestAlarmDevice | null>(null);
const currentModelUrl = ref<string>('');
const currentDeviceId = ref<number | null>(null);
const pendingHighlightPart = ref<Api.Equipment.MonitorDeviceTreeNode | null>(null);

async function loadInitialData() {
  treeLoading.value = true;
  try {
    const [treeResult, alarmResult] = await Promise.all([fetchGetMonitorDeviceTree(), fetchGetLatestAlarmDevice()]);

    if (treeResult.data) {
      deviceTree.value = treeResult.data;
    }

    if (alarmResult.data) {
      currentDevice.value = alarmResult.data;
      currentDeviceId.value = alarmResult.data.deviceId;
      if (alarmResult.data.modelUrl) {
        currentModelUrl.value = alarmResult.data.modelUrl;
      }
    }
  } catch (error) {
    console.error('Failed to load initial data:', error);
  } finally {
    treeLoading.value = false;
  }
}

function handleLoaded() {
  loading.value = false;

  if (pendingHighlightPart.value?.modelNodeName) {
    setTimeout(() => {
      modelViewerRef.value?.highlightPartByNodeName(pendingHighlightPart.value!.modelNodeName!);
      pendingHighlightPart.value = null;
    }, 500);
    return;
  }

  if (currentDevice.value?.alarmPartModelNodeName) {
    setTimeout(() => {
      modelViewerRef.value?.highlightPartByNodeName(currentDevice.value!.alarmPartModelNodeName!);
    }, 500);
  }
}

function handleTooltip(data: { visible: boolean; text: string; left: string; top: string }) {
  tooltipVisible.value = data.visible;
  tooltipText.value = data.text;
  tooltipStyle.left = data.left;
  tooltipStyle.top = data.top;
}

async function handlePartClicked(data: { partCode: string; partName: string; modelNodeName: string }) {
  partDetailVisible.value = true;
  partLoading.value = true;

  try {
    const result = await fetchGetDevicePartByCode(data.partCode);
    if (result.data) {
      selectedPart.value = result.data;
    }
  } catch (error) {
    console.error('Failed to get part details:', error);
  } finally {
    partLoading.value = false;
  }
}

async function loadPartDetailById(partId: number) {
  partDetailVisible.value = true;
  partLoading.value = true;

  try {
    const result = await fetchGetDevicePart(partId);
    if (result.data) {
      selectedPart.value = result.data;
    }
  } catch (error) {
    console.error('Failed to get part details:', error);
  } finally {
    partLoading.value = false;
  }
}

function handleSwitchView(view: ViewType) {
  const position = viewBarRef.value?.getViewPosition(view);
  if (position) {
    modelViewerRef.value?.animateCameraTo(position, undefined, 1200);
  }
}

async function handlePartSelect(part: Api.Equipment.MonitorDeviceTreeNode) {
  const needSwitchDevice = part.deviceId && part.deviceId !== currentDeviceId.value && part.modelUrl;

  if (needSwitchDevice) {
    loading.value = true;
    currentModelUrl.value = part.modelUrl!;
    currentDeviceId.value = part.deviceId!;
    pendingHighlightPart.value = part;
  } else if (part.modelNodeName) {
    modelViewerRef.value?.highlightPartByNodeName(part.modelNodeName);
  }

  if (part.id) {
    await loadPartDetailById(part.id);
  }
}

onMounted(() => {
  loadInitialData();
});
</script>
