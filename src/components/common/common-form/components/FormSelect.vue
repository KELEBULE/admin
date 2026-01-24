<template>
  <NSelect :value="value" :options="list" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Value } from 'naive-ui/es/select/src/interface';
import type { Field } from '../form-type';

const props = withDefaults(
  defineProps<{
    valueKey?: string;
    labelKey?: string;
    value?: Value | null | undefined; // v-model的值
    field: Field;
  }>(),
  {
    valueKey: 'value',
    labelKey: 'label'
  }
);

const list = computed(() => {
  const lists = props.field?.list ?? '';
  if (Array.isArray(lists)) return lists;
  return [];
});
</script>
