<template>
  <section class="h-full flex flex-col">
    <slot name="header"></slot>
    <slot name="search">
      <CommonForm
        v-show="searchFieldList && searchFieldList.length > 0"
        inline
        label-placement="left"
        :size="$attrs.size"
        :model="searchForm"
        :field-list="searchFieldList"
        show-fold-button
        :cancel-text="$t('common.reset')"
        :confirm-text="$t('common.search')"
        class="flex flex-wrap"
        @confirm="handleSearch('confirm')"
        @cancel="handleSearch('cancel')"
      ></CommonForm>
    </slot>
    <div v-if="Object.keys($slots).includes('actions') || showColumnSetting" class="pb-12px flex items-center justify-between">
      <div class="w-full flex items-center gap-2">
        <slot name="actions"></slot>
      </div>
      <ColumnSetting v-if="showColumnSetting" :init-data="cacheColumns" @control-columns="handleControlColumns"></ColumnSetting>
    </div>
    <div class="flex-1">
      <!-- :max-height="tableData.length > 0 ? maxHeight : undefined" -->
      <NDataTable
        ref="NDataTableRef"
        v-model:checked-row-keys="checkedRowKeys"
        :row-key="row => row[rowKey]"
        :columns="column"
        :data="tableData"
        :row-props="rowProps"
        :flex-height="computedFlexHeight"
        :scroll-x="computedScrollX"
        :loading="loading"
        class="min-h-full"
        v-bind="$attrs"
        @update:checked-row-keys="handleCheck"
        @update:sorter="handleSorterChange"
      />
    </div>

    <NPagination
      class="justify-end pt-20px"
      :page="pagination.page"
      :page-size="pagination.size"
      :item-count="pagination.total"
      show-quick-jumper
      show-size-picker
      :page-sizes="pagination.pageSizes"
      :size="$attrs.size ? ($attrs.size as any) : 'medium'"
      @update:page="handlePageChange"
      @update:page-size="handleSizeChange"
    >
      <template #prefix>
        <span class="c-gray mr-3">共 {{ pagination.total }} 条</span>
      </template>
    </NPagination>
  </section>
</template>

<script setup lang="tsx">
import { computed, h, nextTick, onMounted, ref, unref, useAttrs, watch } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { cloneDeep } from 'lodash-es';
import { request } from '@/service/request';
import ColumnSetting from './components/ColumnSetting.vue';
import FilterDate from './components/FilterDate.vue';
import FilterInput from './components/FilterInput.vue';
import FilterInputNumber from './components/FilterInputNumber.vue';
import FilterSelect from './components/FilterSelect.vue';

const props = withDefaults(
  defineProps<{
    url: string;
    columns: DataTableColumn[];
    queryRules?: any;
    searchFieldList?: any;
    searchParams?: Record<string, any>; // 搜索参数(不需要回显在表单中的搜索参数，持久化不能被重置)
    showColumnSetting?: boolean; // 是否显示列字段控制功能
    immediate?: boolean; // 是否立即请求数据
    beforeInitdata?: ((params: any) => any) | null;
    rowKey?: string;
  }>(),
  {
    queryRules: {},
    searchFieldList: [],
    searchParams: () => {
      return {};
    },
    showColumnSetting: true,
    immediate: true,
    beforeInitdata: null,
    rowKey: 'id'
  }
);
const emit = defineEmits(['page', 'pageSize', 'selection', 'dbClick', 'oneClick', 'search', 'controlColumns', 'dataReady']);
const attrs = useAttrs();
const pagination = defineModel('pagination', {
  type: Object,
  default: () => {
    return { page: 1, size: 10, total: 0, pageSizes: [10, 50, 100] };
  }
});
interface PageResult {
  endRow?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  isFirstPage?: boolean;
  isLastPage?: boolean;
  list?: any[];
  navigateFirstPage?: number;
  navigateLastPage?: number;
  navigatepageNums?: number[];
  navigatePages?: number;
  nextPage?: number;
  pageNum?: number;
  pages?: number;
  pageSize?: number;
  prePage?: number;
  size?: number;
  startRow?: number;
  total?: number;
}

const com: Record<string, any> = {
  'filter-input': FilterInput,
  'filter-input-number': FilterInputNumber,
  'filter-date': FilterDate,
  'filter-select': FilterSelect
};

const queryRules = ref(props.queryRules ?? {});
const column: any = ref([]);
const cacheColumns: any = ref([]);
watch(
  () => props.columns,
  () => {
    const columns = props.columns || [];
    column.value = columns.map((item: any) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: item.children.map((i: any) => {
            return handleFilterColumns(i);
          })
        };
      }
      return handleFilterColumns(item);
    });
    cacheColumns.value = unref(column);
  },
  { immediate: true, deep: true }
);

function handleFilterColumns(item: any) {
  if (!item.filter) return item;
  // const queryRulesIndex = queryRules.value && Object.keys(queryRules.value).findIndex((q: any) => q === item.key);
  // if (queryRulesIndex === -1) {
  //   console.error(`字段${item.title}-${item.key}未在queryRules中配置`);
  //   return item;
  // }
  const value = queryRules.value[item.key];
  const filterOptionValue = value || value === 0 ? value : null; // 保留值为0的情况
  const data = ref({
    ...unref(item),
    filterOptionValue, // 当前激活的过滤器选项值（设置过滤图标高亮效果）
    renderFilterMenu: ({ hide }: any) => {
      return h(com[item.extraProps.component || 'filter-input'], {
        modelValue: queryRules.value[item.key],
        'onUpdate:modelValue': (val: any) => {
          queryRules.value[item.key] = val;
        },
        ...item.extraProps,
        onSearch: (val: any) => {
          const index = column.value && column.value.findIndex((q: any) => q.key === item.key);
          if (index > -1) {
            column.value[index].filterOptionValue = val || val === 0 ? val : null;
          }
          hide();
          pagination.value.page = 1;
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          initData();
        }
      });
    }
  });
  return data.value;
}

// 计算 scroll-x 值
const computedScrollX = computed(() => {
  if (attrs['scroll-x']) {
    return attrs['scroll-x'];
  }
  const sum = column.value.reduce((pre: number, curr: any) => {
    return pre + (curr.width || 0);
  }, 0);

  return sum;
});

const initSearchForm = defineModel('searchForm', { type: Object, default: { orderBy: '' } }); // 搜索表单的内容,(需要回显在表单中)
const searchForm = ref({ ...initSearchForm.value });

const tableData = ref<any>([]);
const NDataTableRef = ref();
const loading = ref(false);
const initData = async () => {
  if (!props.url) return;
  loading.value = true;
  let params: any = {
    pageNum: pagination.value.page,
    pageSize: pagination.value.size,
    ...queryRules.value,
    ...searchForm.value, // 搜索表单中的参数
    ...props.searchParams
  };

  if (props.beforeInitdata) {
    const processedParams = props.beforeInitdata(cloneDeep(params));
    if (processedParams) {
      params = processedParams;
    }
  }

  request<PageResult>({
    url: props.url,
    method: 'post',
    data: params
  })
    .then(async (res: any) => {
      loading.value = false;
      // 兼容两种数据结构：1. { data: { list: [], total: 0 } } 2. { data: [] }
      if (Array.isArray(res.data)) {
        tableData.value = res.data ?? [];
        pagination.value.total = res.data?.length ?? 0;
      } else {
        tableData.value = res.data?.list ?? [];
        pagination.value.total = res.data ? Number(res.data.total ?? 0) : 0;
      }

      await nextTick();
      emit('dataReady', tableData.value);
    })
    .catch(() => {
      loading.value = false;
      tableData.value = [{}];
      pagination.value.total = 0;
    });
};

onMounted(async () => {
  if (props.immediate) {
    await initData();
  }
  await nextTick();
});

// 列字段显隐控制
const handleControlColumns = (list: any) => {
  if (!Array.isArray(list)) {
    return;
  }
  column.value = list;
  emit('controlColumns', list);
};

// 设置 flex-height 值
const computedFlexHeight = computed(() => {
  if ('flex-height' in attrs) {
    const flexHeight = attrs['flex-height'];
    return flexHeight === true || flexHeight === 'true';
  }
  return tableData.value.length > 0;
});

// 搜索事件
const handleSearch = (type: 'confirm' | 'cancel') => {
  pagination.value.page = 1;
  initData();
  emit('search', type, searchForm.value);
};

// 表格勾选事件
const checkedRowKeys = defineModel<DataTableRowKey[]>('checkedRowKeys', { type: Array, default: () => [] });
const checkedRows = ref<any>([]);
const handleCheck = (rowKeys: DataTableRowKey[], rows: any) => {
  checkedRowKeys.value = rowKeys;
  checkedRows.value = rows;
  emit('selection', rowKeys, rows);
};

// 翻页事件
const handlePageChange = (current: number) => {
  pagination.value.page = current;
  initData();
  emit('page', current);
};

// 每页条目事件
const handleSizeChange = (pageSize: number) => {
  pagination.value.size = pageSize;
  pagination.value.page = 1;
  initData();
  emit('pageSize', pageSize);
};

// 行事件
const rowData = ref<any>();
const rowProps = (row: any) => ({
  // 双击
  onDblclick: () => {
    rowData.value = JSON.parse(JSON.stringify(row));
    emit('dbClick', rowData.value);
  },
  // 单击
  onClick: () => {
    rowData.value = JSON.parse(JSON.stringify(row));
    emit('oneClick', rowData.value);
  }
});

// 排序事件
const handleSorterChange = (sorter: any) => {
  if (sorter.order) {
    searchForm.value.orderBy = `${sorter.columnKey} ${sorter.order === 'ascend' ? 'asc' : 'desc'}`;
  } else {
    searchForm.value.orderBy = '';
  }
  initData();
};

// 表格滚动方法
const scrollTo = (options: { left?: number; top?: number; behavior?: ScrollBehavior }) => {
  NDataTableRef.value.scrollTo(options);
};

watch(
  () => props.url,
  async () => {
    await initData();
  }
);
// 监听默认搜索参数的变化
watch(
  () => props.searchParams,
  () => {
    pagination.value.page = 1;
    initData();
  },
  { deep: true }
);

defineExpose({
  initData,
  tableData,
  searchForm,
  scrollTo
});
</script>
