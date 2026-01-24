<template>
  <NSpace class="p-12px" align="center">
    <NCascader v-bind="$attrs" v-model:value="value" :options="options" style="width: 250px" />

    <NButton type="info" size="small" @click="handleSearch">查询</NButton>
    <NButton type="default" size="small" @click="resetSearch">重置</NButton>
  </NSpace>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import type { CascaderOption } from 'naive-ui';

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    list: CascaderOption[];
  }>(),
  {}
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

const options = ref<any>([]);

onMounted(() => {
  if (props.list && Array.isArray(props.list)) {
    options.value = props.list;
  }
});

// 查询
const handleSearch = () => {
  emit('update:modelValue', value.value);
  emit('search', value.value);
};

// 重置
const resetSearch = () => {
  emit('update:modelValue', '');
  emit('search', '');
};
</script>
