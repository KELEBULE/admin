<template>
  <NSpace class="p-12px" align="center">
    <NSelect
      v-bind="$attrs"
      v-model:value="value"
      remote
      clearable
      filterable
      :loading="loading"
      :multiple="multiple"
      :value-field="valueKey"
      :label-field="labelKey"
      :options="options"
      :clear-filter-after-select="false"
      class="min-w-200px"
      @search="handleRemoteSearch"
    />
    <NButton type="info" size="small" @click="handleSearch">查询</NButton>
    <NButton type="default" size="small" @click="resetSearch">重置</NButton>
  </NSpace>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { map } from 'lodash-es';
import { request } from '@/service/request';

type RequestMethod = 'get' | 'post' | 'put' | 'delete';

const props = withDefaults(
  defineProps<{
    url?: string;
    modelValue: string | number;
    params?: object; // 请求参数
    type?: RequestMethod;
    valueKey?: string;
    labelKey?: string;
    dataKey?: string;
    multiple?: boolean;
    list?: Array<{ label: string; value: string | number }>;
  }>(),
  {
    url: '',
    type: 'post',
    valueKey: 'value',
    labelKey: 'label',
    dataKey: '',
    params: () => ({}),
    multiple: false,
    list: () => {
      return [];
    }
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

const options = ref<any>([]);
const loading = ref(false);
const handleRemoteSearch = async (query: string) => {
  if (!props.url) {
    options.value = props.list;
    return;
  }
  loading.value = true;
  try {
    const resp: any = await (
      request[props.type.toLocaleLowerCase() as keyof typeof request] as any as <Resp>(url: string, data: any) => Promise<Resp>
    )(
      props.url,
      {
        page: 1,
        size: 100,
        pageNum: 1,
        pageSize: 100,
        [props.dataKey || props.labelKey]: query,
        ...props.params
      }
      // {
      //   loading: false
      // }
    );
    options.value = map((resp?.list || resp) ?? [], (item: any) => ({
      ...item,
      [props.labelKey]: item[props.labelKey],
      [props.valueKey]: item[props.valueKey]
    }));
  } catch (e) {
    console.log(e);
  }
  loading.value = false;
};

onMounted(() => {
  if (props.url) {
    handleRemoteSearch('');
    return;
  }
  if (props.list && Array.isArray(props.list)) {
    options.value = props.list;
  }
});

watch(
  () => props.params,
  () => {
    handleRemoteSearch('');
  },
  { deep: true }
);

// 查询
const handleSearch = () => {
  emit('update:modelValue', value.value);
  emit('search', value.value);
};

// 重置
const resetSearch = () => {
  emit('update:modelValue', null);
  emit('search', null);
};
</script>
