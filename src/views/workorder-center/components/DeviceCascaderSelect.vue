<template>
  <NSpace class="w-full" justify="space-between">
    <NCascader
      v-model:value="selectedAreaId"
      :options="factoryAreaOptions"
      :placeholder="$t('page.workorder.selectFactoryArea')"
      label-field="name"
      value-field="id"
      clearable
      :show-path="true"
      class="w-200px"
      @update:value="handleAreaChange"
    />
    <NCascader
      v-model:value="selectedDeviceId"
      :options="devicePartOptions"
      :placeholder="$t('page.workorder.selectDevicePart')"
      label-field="name"
      value-field="id"
      clearable
      :show-path="true"
      :disabled="!selectedAreaId"
      class="w-200px"
      @update:value="handleDeviceChange"
    />
  </NSpace>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { request } from '@/service/request';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceCascaderSelect'
});

const props = defineProps<{
  value?: number | null;
}>();

const emit = defineEmits<{
  'update:value': [value: number | null];
}>();

const selectedAreaId = ref<number | null>(null);
const selectedDeviceId = ref<number | null>(null);
const factoryAreaOptions = ref<any[]>([]);
const devicePartOptions = ref<any[]>([]);

async function loadFactoryAreaTree() {
  const { data, error } = await request<any>({
    url: '/factory_info/tree',
    method: 'GET'
  });
  if (!error && data) {
    factoryAreaOptions.value = transformFactoryAreaTree(data);
  }
}

async function loadDevicePartTree(locationId: number) {
  const { data, error } = await request<any>({
    url: `/factory_device/tree/${locationId}`,
    method: 'GET'
  });
  if (!error && data) {
    devicePartOptions.value = transformDevicePartTree(data);
  } else {
    devicePartOptions.value = [];
  }
}

function transformFactoryAreaTree(data: any[]): any[] {
  return data.map(factory => {
    const result: any = {
      id: factory.id,
      name: factory.name,
      code: factory.code,
      type: factory.type
    };
    if (factory.children && factory.children.length > 0) {
      result.children = factory.children.map((area: any) => ({
        id: area.id,
        name: area.name,
        code: area.code,
        type: area.type
      }));
    }
    return result;
  });
}

function transformDevicePartTree(data: any[]): any[] {
  return data.map(device => {
    const result: any = {
      id: device.id,
      name: device.name,
      code: device.code,
      type: device.type,
      deviceId: device.id
    };
    if (device.children && device.children.length > 0) {
      result.children = device.children.map((part: any) => ({
        id: part.id,
        name: part.name,
        code: part.code,
        type: part.type,
        deviceId: device.id
      }));
    }
    return result;
  });
}

function handleAreaChange(value: number | null) {
  selectedAreaId.value = value;
  selectedDeviceId.value = null;
  devicePartOptions.value = [];
  if (value) {
    loadDevicePartTree(value);
  }
  emit('update:value', null);
}

function handleDeviceChange(value: number | null) {
  selectedDeviceId.value = value;
  const selectedItem = findSelectedItem(devicePartOptions.value, value);
  if (selectedItem) {
    emit('update:value', selectedItem.deviceId);
  } else {
    emit('update:value', null);
  }
}

function findSelectedItem(options: any[], value: number | null): any {
  for (const item of options) {
    if (item.id === value) {
      return item;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.id === value) {
          return child;
        }
      }
    }
  }
  return null;
}

watch(
  () => props.value,
  val => {
    if (val) {
      selectedDeviceId.value = val;
    } else {
      selectedAreaId.value = null;
      selectedDeviceId.value = null;
      devicePartOptions.value = [];
    }
  },
  { immediate: true }
);

loadFactoryAreaTree();
</script>
