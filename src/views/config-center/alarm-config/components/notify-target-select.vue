<template>
  <NSpace vertical class="w-full">
    <NCascader
      v-model:value="selectedValue"
      :options="cascaderOptions"
      :placeholder="$t('page.alarm.notifyTarget')"
      multiple
      check-strategy="all"
      clearable
      :show-path="true"
      class="w-full"
      label-field="label"
      value-field="value"
      children-field="children"
      :max-tag-count="1"
      expand-trigger="hover"
    />
  </NSpace>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { NCascader, NSpace } from 'naive-ui';
import { request } from '@/service/request';

defineOptions({
  name: 'NotifyTargetSelect'
});

interface TreeItem {
  id: string;
  name: string;
  type: 'org' | 'user';
  children?: TreeItem[];
}

interface CascaderOption {
  value: string;
  label: string;
  type: 'org' | 'user';
  children?: CascaderOption[];
}

const props = defineProps<{
  notifyTargetIds?: string[];
}>();

const emit = defineEmits<{
  'update:notifyTargetIds': [value: string[]];
}>();

const cascaderOptions = ref<CascaderOption[]>([]);
const selectedValue = ref<string[]>([]);
const fullTreeData = ref<TreeItem[]>([]);
let isInternalUpdate = false;

async function loadOrgUserTree() {
  const { data, error } = await request<TreeItem[]>({
    url: '/alarm_rule/org_user_tree',
    method: 'GET'
  });
  if (!error && data) {
    fullTreeData.value = data;
    cascaderOptions.value = transformToCascader(data);
    if (props.notifyTargetIds && props.notifyTargetIds.length > 0) {
      selectedValue.value = findUserKeys(props.notifyTargetIds);
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

function getAllUserIds(items: TreeItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.type === 'user') {
      ids.push(item.id);
    }
    if (item.children && item.children.length > 0) {
      ids.push(...getAllUserIds(item.children));
    }
  }
  return ids;
}

function findItemById(data: TreeItem[], type: string, id: string): TreeItem | null {
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

function getUserIdsFromSelection(keys: string[]): string[] {
  const userIds: string[] = [];
  for (const key of keys) {
    const parts = key.split('_');
    const type = parts[0];
    const id = parts.slice(1).join('_');

    if (type === 'user') {
      userIds.push(id);
    } else {
      const item = findItemById(fullTreeData.value, type, id);
      if (item) {
        userIds.push(...getAllUserIds([item]));
      }
    }
  }
  return [...new Set(userIds)];
}

function findUserKeys(userIds: string[]): string[] {
  const keys: string[] = [];

  function search(items: TreeItem[]) {
    for (const item of items) {
      if (item.type === 'user' && userIds.includes(item.id)) {
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

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

watch(
  () => props.notifyTargetIds,
  val => {
    if (isInternalUpdate) {
      isInternalUpdate = false;
      return;
    }
    selectedValue.value = val ? findUserKeys(val) : [];
  },
  { immediate: true }
);

watch(
  selectedValue,
  val => {
    const userIds = getUserIdsFromSelection(val);
    const currentIds = props.notifyTargetIds || [];
    if (!arraysEqual(userIds, currentIds)) {
      isInternalUpdate = true;
      emit('update:notifyTargetIds', userIds);
    }
  },
  { deep: true }
);

onMounted(() => {
  loadOrgUserTree();
});
</script>
