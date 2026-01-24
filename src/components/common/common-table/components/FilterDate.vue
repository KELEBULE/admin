<template>
  <NSpace class="p-12px" align="center">
    <NDatePicker v-model:formatted-value="value" :value-format="valueFormat" :type="type" clearable />
    <NButton type="info" size="small" @click="handleSearch">查询</NButton>
    <NButton type="default" size="small" @click="resetSearch">重置</NButton>
  </NSpace>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DatePickerType } from 'naive-ui/es/date-picker/src/config';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    valueFormat?: string;
    type?: DatePickerType | undefined;
  }>(),
  {
    valueFormat: 'yyyy-MM-dd HH:mm:ss',
    type: 'datetimerange'
  }
);
const emit = defineEmits(['update:modelValue', 'search']);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(v: string | any) {
    emit('update:modelValue', v);
  }
});

const handleSearch = () => {
  emit('update:modelValue', value.value);
  emit('search', value.value);
};
const resetSearch = () => {
  emit('update:modelValue', '');
  emit('search', '');
};
</script>
