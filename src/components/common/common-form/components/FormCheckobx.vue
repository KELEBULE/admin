<template>
  <NCheckboxGroup v-bind="$attrs" :value="value">
    <NCheckbox v-for="item in list" :key="item.value" :value="item.value">{{ item.label }}</NCheckbox>
  </NCheckboxGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Field } from '../form-type';

const props = withDefaults(
  defineProps<{
    value: (string | number)[] | null | undefined; // v-model的值
    field: Field;
  }>(),
  {}
);

const list = computed(() => {
  const lists = props.field?.list ?? '';
  if (Array.isArray(lists)) return lists;
  return [];
});
</script>
