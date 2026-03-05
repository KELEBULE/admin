import { reactive, readonly, ref } from 'vue';
import { fetchGetDevicePart, fetchGetDevicePartByCode, fetchGetLatestAlarmDevice, fetchGetMonitorDeviceTree } from '@/service/api/equipment';

export function useMonitorCenter() {
  const loading = ref(true);
  const treeLoading = ref(false);

  const deviceTree = ref<Api.Equipment.MonitorDeviceTreeNode[]>([]);
  const currentDevice = ref<Api.Equipment.LatestAlarmDevice | null>(null);
  const currentModelUrl = ref<string>('');
  const currentDeviceId = ref<number | null>(null);
  const pendingHighlightPart = ref<Api.Equipment.MonitorDeviceTreeNode | null>(null);

  const dateRange = ref<[number, number] | null>(null);

  const tooltip = reactive({
    visible: false,
    text: '',
    left: '0px',
    top: '0px'
  });

  const selectedPart = ref<Api.Equipment.DevicePart | null>(null);
  const partDetailVisible = ref(false);
  const partLoading = ref(false);

  const currentPart = ref<Api.Equipment.DevicePart | null>(null);

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

  function updateTooltip(data: { visible: boolean; text: string; left: string; top: string }) {
    tooltip.visible = data.visible;
    tooltip.text = data.text;
    tooltip.left = data.left;
    tooltip.top = data.top;
  }

  function switchDevice(device: { deviceId: number; modelUrl: string; deviceName: string; imageUrl: string } | null) {
    if (!device || device.deviceId === currentDeviceId.value) {
      return;
    }

    currentDeviceId.value = device.deviceId;
    currentDevice.value = {
      deviceId: device.deviceId,
      deviceCode: '',
      deviceName: device.deviceName,
      modelUrl: device.modelUrl,
      imageUrl: device.imageUrl
    } as Api.Equipment.LatestAlarmDevice;

    if (device.modelUrl) {
      loading.value = true;
      currentModelUrl.value = device.modelUrl;
    } else {
      loading.value = false;
      currentModelUrl.value = '';
    }

    currentPart.value = null;
  }

  async function selectPart(part: Api.Equipment.MonitorDeviceTreeNode) {
    const needSwitchDevice = part.deviceId && part.deviceId !== currentDeviceId.value && part.modelUrl;

    if (needSwitchDevice) {
      loading.value = true;
      currentModelUrl.value = part.modelUrl!;
      currentDeviceId.value = part.deviceId!;
      pendingHighlightPart.value = part;
    }

    if (part.id) {
      await loadPartDetailById(part.id);
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

  async function loadPartDetailByCode(partCode: string) {
    partDetailVisible.value = true;
    partLoading.value = true;

    try {
      const result = await fetchGetDevicePartByCode(partCode);
      if (result.data) {
        selectedPart.value = result.data;
        currentPart.value = result.data;
      }
    } catch (error) {
      console.error('Failed to get part details:', error);
    } finally {
      partLoading.value = false;
    }
  }

  function setModelLoaded() {
    loading.value = false;
  }

  function clearPendingHighlight() {
    pendingHighlightPart.value = null;
  }

  function setDateRange(range: [number, number] | null) {
    dateRange.value = range;
  }

  function setCurrentPart(part: Api.Equipment.DevicePart | null) {
    currentPart.value = part;
  }

  return {
    loading,
    treeLoading,
    deviceTree: readonly(deviceTree),
    currentDevice: readonly(currentDevice),
    currentModelUrl: readonly(currentModelUrl),
    currentDeviceId: readonly(currentDeviceId),
    pendingHighlightPart,
    tooltip: readonly(tooltip),
    selectedPart: readonly(selectedPart),
    partDetailVisible,
    partLoading,
    dateRange,
    currentPart: readonly(currentPart),

    loadInitialData,
    updateTooltip,
    switchDevice,
    selectPart,
    loadPartDetailById,
    loadPartDetailByCode,
    setModelLoaded,
    clearPendingHighlight,
    setDateRange,
    setCurrentPart
  };
}
