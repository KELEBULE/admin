<template>
  <div class="absolute top-26px left-50% w-500px transform-translate-x--50% z-1002">
    <NSpace class="w-full h-48px bg-white dark:bg-dark items-center rounded-30px" justify="space-around">
      <NCascader
        v-model:value="selectedValue"
        :options="cascaderOptions"
        :placeholder="$t('page.monitor.selectDevice')"
        :loading="loading"
        label-field="label"
        value-field="value"
        clearable
        :bordered="false"
        :show-path="true"
        class="w-180px"
        @update:value="handleValueChange"
      />
      <NDatePicker
        v-model:value="dateRange"
        type="daterange"
        :placeholder="$t('page.monitor.selectDate')"
        clearable
        :bordered="false"
        class="w-300px"
        @update:value="handleDateChange"
      />
    </NSpace>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { fetchGetMonitorDeviceTree } from '@/service/api/equipment';
import { $t } from '@/locales';

defineOptions({
  name: 'TopBar'
});

const props = defineProps<{
  currentDeviceId?: number | null;
}>();

const emit = defineEmits<{
  'device-change': [device: { deviceId: number; modelUrl: string; deviceName: string; imageUrl: string } | null];
  'date-change': [dateRange: [number, number] | null];
}>();

function getDefaultDateRange(): [number, number] {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  return [start.getTime(), end.getTime()];
}

interface CascaderOption {
  label: string;
  value: string | number;
  type: 'factory' | 'area' | 'device';
  deviceId?: number;
  modelUrl?: string;
  deviceName?: string;
  imageUrl?: string;
  children?: CascaderOption[];
  disabled?: boolean;
}

const selectedValue = ref<string | number | null>(null);
const dateRange = ref<[number, number]>(getDefaultDateRange());
const cascaderOptions = ref<CascaderOption[]>([]);
const loading = ref(false);
const deviceMap = ref<Map<string | number, CascaderOption>>(new Map());

async function loadDeviceTree() {
  loading.value = true;
  try {
    const { data, error } = await fetchGetMonitorDeviceTree();

    if (!error && data) {
      cascaderOptions.value = transformTreeData(data);
    }
  } catch (err) {
    console.error('Failed to load device tree:', err);
  } finally {
    loading.value = false;
  }
}

function transformTreeData(data: Api.Equipment.MonitorDeviceTreeNode[]): CascaderOption[] {
  return data
    .filter(node => node.type === 'factory')
    .map(factory => {
      const factoryOption: CascaderOption = {
        label: factory.name,
        value: factory.uniqueKey,
        type: 'factory'
      };

      if (factory.children && factory.children.length > 0) {
        factoryOption.children = factory.children
          .filter(area => area.type === 'area')
          .map(area => {
            const areaOption: CascaderOption = {
              label: area.name,
              value: area.uniqueKey,
              type: 'area'
            };

            if (area.children && area.children.length > 0) {
              areaOption.children = area.children
                .filter(device => device.type === 'device')
                .map(device => {
                  const deviceOption: CascaderOption = {
                    label: device.name,
                    value: device.uniqueKey,
                    type: 'device',
                    deviceId: device.id,
                    modelUrl: device.modelUrl,
                    deviceName: device.name,
                    imageUrl: device.imageUrl
                  };
                  deviceMap.value.set(device.uniqueKey, deviceOption);
                  return deviceOption;
                });
            }

            return areaOption;
          });
      }

      return factoryOption;
    });
}

function handleValueChange(value: string | number | null) {
  if (value === null) {
    emit('device-change', null);
    return;
  }

  const deviceOption = deviceMap.value.get(value);
  if (deviceOption && deviceOption.type === 'device') {
    emit('device-change', {
      deviceId: deviceOption.deviceId!,
      modelUrl: deviceOption.modelUrl || '',
      deviceName: deviceOption.deviceName || '',
      imageUrl: deviceOption.imageUrl || ''
    });
  }
}

function handleDateChange(value: [number, number] | null) {
  if (value) {
    emit('date-change', value);
  } else {
    dateRange.value = getDefaultDateRange();
    emit('date-change', dateRange.value);
  }
}

watch(
  () => props.currentDeviceId,
  newDeviceId => {
    if (newDeviceId) {
      selectedValue.value = `device_${newDeviceId}`;
    } else {
      selectedValue.value = null;
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadDeviceTree();
  emit('date-change', dateRange.value);
});

defineExpose({
  setSelectedDevice: (deviceId: number | null) => {
    selectedValue.value = deviceId ? `device_${deviceId}` : null;
  }
});
</script>

<style scoped lang="scss"></style>
