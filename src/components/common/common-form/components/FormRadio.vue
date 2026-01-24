<template>
  <NRadioGroup v-bind="$attrs" :value="value">
    <NRadio v-for="item in list" :key="item.value" :value="item.value">
      {{ item.label }}
    </NRadio>
  </NRadioGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Field } from '../form-type';

const props = withDefaults(
  defineProps<{
    value: string; // v-model的值
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
