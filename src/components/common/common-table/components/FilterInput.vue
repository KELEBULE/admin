<template>
  <NSpace class="p-12px" align="center">
    <NInput v-model:value="value" type="text" placeholder="请输入" />
    <NButton type="info" size="small" @click="handleSearch">查询</NButton>
    <NButton type="default" size="small" @click="resetSearch">重置</NButton>
  </NSpace>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();
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
