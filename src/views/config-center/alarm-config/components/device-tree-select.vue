<template>
  <NSpace vertical class="w-full">
    <NCascader
      v-model:value="selectedValue"
      :options="cascaderOptions"
      :placeholder="$t('page.alarm.deviceSelect')"
      multiple
      check-strategy="all"
      clearable
      :show-path="true"
      class="w-full"
      label-field="label"
      value-field="value"
      children-field="children"
      expand-trigger="hover"
    />
  </NSpace>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { NCascader, NSpace } from 'naive-ui';
import { request } from '@/service/request';

defineOptions({
  name: 'DeviceTreeSelect'
});

interface TreeItem {
  id: number;
  name: string;
  code: string;
  type: 'factory' | 'area' | 'device';
  children?: TreeItem[];
}

interface CascaderOption {
  value: string;
  label: string;
  type: 'factory' | 'area' | 'device';
  children?: CascaderOption[];
}

const props = defineProps<{
  value?: number[];
}>();

const emit = defineEmits<{
  'update:value': [value: number[]];
}>();

const cascaderOptions = ref<CascaderOption[]>([]);
const selectedValue = ref<string[]>([]);
const fullTreeData = ref<TreeItem[]>([]);
let isInternalUpdate = false;

async function loadDeviceTree() {
  const { data, error } = await request<TreeItem[]>({
    url: '/alarm_rule/device_tree',
    method: 'GET'
  });
  if (!error && data) {
    fullTreeData.value = data;
    cascaderOptions.value = transformToCascader(data);
    if (props.value && props.value.length > 0) {
      selectedValue.value = findDeviceKeys(props.value);
    }
  }
}

function transformToCascader(data: TreeItem[]): CascaderOption[] {
  return data.map(item => {
    const result: CascaderOption = {
      value: `${item.type}_${item.id}`,
      label: item.name,
      type: item.type
    };
    if (item.children && item.children.length > 0) {
      result.children = transformToCascader(item.children);
    }
    return result;
  });
}

function getAllDeviceIds(items: TreeItem[]): number[] {
  const ids: number[] = [];
  for (const item of items) {
    if (item.type === 'device') {
      ids.push(item.id);
    }
    if (item.children && item.children.length > 0) {
      ids.push(...getAllDeviceIds(item.children));
    }
  }
  return ids;
}

function findItemById(data: TreeItem[], type: string, id: number): TreeItem | null {
  for (const item of data) {
    if (item.type === type && item.id === id) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findItemById(item.children, type, id);
      if (found) return found;
    }
  }
  return null;
}

function getDeviceIdsFromSelection(keys: string[]): number[] {
  const deviceIds: number[] = [];
  for (const key of keys) {
    const parts = key.split('_');
    const type = parts[0];
    const id = Number(parts.slice(1).join('_'));

    if (type === 'device') {
      deviceIds.push(id);
    } else {
      const item = findItemById(fullTreeData.value, type, id);
      if (item) {
        deviceIds.push(...getAllDeviceIds([item]));
      }
    }
  }
  return [...new Set(deviceIds)];
}

function findDeviceKeys(deviceIds: number[]): string[] {
  const keys: string[] = [];

  function search(items: TreeItem[]) {
    for (const item of items) {
      if (item.type === 'device' && deviceIds.includes(item.id)) {
        keys.push(`${item.type}_${item.id}`);
      }
      if (item.children && item.children.length > 0) {
        search(item.children);
      }
    }
  }

  search(fullTreeData.value);
  return keys;
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

watch(
  () => props.value,
  val => {
    if (isInternalUpdate) {
      isInternalUpdate = false;
      return;
    }
    selectedValue.value = val ? findDeviceKeys(val) : [];
  },
  { immediate: true }
);

watch(
  selectedValue,
  val => {
    const deviceIds = getDeviceIdsFromSelection(val);
    const currentIds = props.value || [];
    if (!arraysEqual(deviceIds, currentIds)) {
      isInternalUpdate = true;
      emit('update:value', deviceIds);
    }
  },
  { deep: true }
);

onMounted(() => {
  loadDeviceTree();
});
</script>
