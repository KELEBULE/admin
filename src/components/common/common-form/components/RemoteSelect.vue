<template>
  <NSelect
    v-bind="$attrs"
    :value="value"
    remote
    clearable
    filterable
    :loading="loading"
    :multiple="multiple"
    :value-field="valueKey"
    :label-field="labelKey"
    :options="options"
    :clear-filter-after-select="false"
    @search="handleSearch"
  />
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { map } from 'lodash-es';
import { request } from '@/service/request';

type RequestMethod = 'get' | 'post' | 'put' | 'delete';
interface Props {
  url: string;
  value: string | number | undefined;
  params?: object;
  type?: RequestMethod;
  valueKey?: string;
  labelKey?: string;
  dataKey?: string;
  multiple?: boolean;
}

// 设置 props 默认值
const props = withDefaults(defineProps<Props>(), {
  type: 'post',
  valueKey: 'value',
  labelKey: 'label',
  params: () => ({}),
  multiple: false
});
const options = ref<any>([]);
const loading = ref(false);

const handleSearch = async (query: string) => {
  loading.value = true;
  try {
    const resp: any = await request({
      url: props.url,
      method: props.type,
      data: {
        page: 1,
        size: 100,
        pageNum: 1,
        pageSize: 100,
        [props.dataKey || props.labelKey]: query,
        ...props.params
      }
    });
    options.value = map((resp?.list || resp?.data?.list || resp?.data?.records || resp) ?? [], (item: any) => ({
      ...item,
      [props.labelKey]: item[props.labelKey],
      [props.valueKey]: item[props.valueKey]
    }));
  } catch (e) {
    console.log(e);
  }
  loading.value = false;
  // console.log(options.value);
};
onMounted(() => {
  handleSearch('');
});
watch(
  () => props.params,
  () => {
    handleSearch('');
  },
  { deep: true }
);
</script>
