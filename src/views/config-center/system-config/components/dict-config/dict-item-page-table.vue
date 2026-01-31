<template>
  <div class="h-full">
    <CommonTable
      ref="tableRef"
      v-model:checked-row-keys="checkedRowKeys"
      v-model:table-data="tableData"
      class="h-full w-full"
      :columns="columns"
      :url="URL"
      :search-field-list="fieldList"
      :search-params="searchParams"
      :before-initdata="beforeInitData"
      method="get"
    >
      <template #actions>
        <NButton type="primary" @click="handleAdd">
          {{ $t('common.add') }}
        </NButton>
        <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">
          {{ $t('common.delete') }}
        </NButton>
      </template>
    </CommonTable>
    <DictItemOperateDrawer :id="editingId" v-model:visible="drawerVisible" :dict="dict" :operate-type="operateType" @submitted="handleSubmitted" />
  </div>
</template>

<script setup lang="tsx">
import { computed, h, ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm } from 'naive-ui';
import { fetchDeleteDictItem } from '@/service/api';
// import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import { transDeleteParams } from '@/utils/common';
import { $t } from '@/locales';
import CommonTable from '@/components/common/common-table/index.vue';
import DictItemOperateDrawer from './dict-item-operate-drawer.vue';

defineOptions({
  name: 'DictItemPageListTable'
});

interface Props {
  dict: Api.SystemManage.DictTree;
}

const props = defineProps<Props>();

// const { hasAuth } = useAuth();
const { dictTag } = useDict();

const tableRef = ref<InstanceType<typeof CommonTable>>();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableData = ref<Api.SystemManage.DictItem[]>([]);
const URL = '/sys_dict_item/page';

const dictId = computed(() => props.dict?.id);

const searchParams = ref<Api.SystemManage.DictItemSearchParams>({
  page: 1,
  pageSize: 20,
  dictId: dictId.value,
  value: null,
  description: null,
  zhCN: null,
  enUS: null
});

const fieldList = [
  {
    key: 'zhCN',
    label: $t('page.manage.dictItem.zhCN'),
    type: 'input',
    placeholder: $t('page.manage.dictItem.form.zhCN')
  },
  {
    key: 'enUS',
    label: $t('page.manage.dictItem.enUS'),
    type: 'input',
    placeholder: $t('page.manage.dictItem.form.enUS')
  },
  {
    key: 'description',
    label: $t('page.manage.dictItem.description'),
    type: 'input',
    placeholder: $t('page.manage.dictItem.form.description')
  }
];

const drawerVisible = ref(false);
const operateType = ref<NaiveUI.TableOperateType>('add');
const editingId = ref<string>('');

const columns: DataTableColumn[] = [
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    key: 'index',
    title: $t('common.index'),
    width: 64,
    align: 'center'
  },
  {
    key: 'value',
    title: $t('page.manage.dictItem.value'),
    minWidth: 64,
    align: 'center'
  },
  {
    key: 'zhCN',
    title: $t('page.manage.dictItem.zhCN'),
    minWidth: 64,
    align: 'center'
  },
  {
    key: 'enUS',
    title: $t('page.manage.dictItem.enUS'),
    minWidth: 64,
    align: 'center'
  },
  {
    key: 'sort',
    title: $t('page.manage.dictItem.sort'),
    minWidth: 64,
    align: 'center'
  },
  {
    key: 'status',
    title: $t('page.manage.dictItem.status'),
    align: 'center',
    width: 80,
    render: (row: any) => dictTag('status', row.status)
  },
  {
    key: 'description',
    title: $t('page.manage.dictItem.description'),
    minWidth: 64,
    align: 'center',
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'operate',
    title: $t('common.operate'),
    align: 'center',
    width: 140,
    fixed: 'right',
    render: (row: any) =>
      h('div', { class: 'flex-center gap-8px' }, [
        h(
          NButton,
          {
            type: 'primary',
            quaternary: true,
            size: 'small',
            onClick: () => handleEdit(row.id)
          },
          () => $t('common.edit')
        ),

        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id)
          },
          {
            default: () => $t('common.confirmDelete'),
            trigger: () =>
              h(
                NButton,
                {
                  type: 'error',
                  quaternary: true,
                  size: 'small'
                },
                () => $t('common.delete')
              )
          }
        )
      ])
  }
];

function beforeInitData(params: Api.SystemManage.DictItemSearchParams) {
  return {
    ...params,
    dictId: dictId.value
  };
}

function handleAdd() {
  operateType.value = 'add';
  editingId.value = '';
  drawerVisible.value = true;
}

function handleEdit(id: string) {
  operateType.value = 'edit';
  editingId.value = id;
  drawerVisible.value = true;
}

async function handleDelete(id: string) {
  const { error, data: result } = await fetchDeleteDictItem(transDeleteParams([id]));
  if (!error && result) {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

async function handleBatchDelete() {
  window.$dialog?.warning({
    title: $t('common.confirmDelete'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error, data: result } = await fetchDeleteDictItem(transDeleteParams(checkedRowKeys.value.map(key => key.toString())));
      if (!error && result) {
        window.$message?.success($t('common.deleteSuccess'));
        checkedRowKeys.value = [];
        tableRef.value?.initData();
      }
    }
  });
}

function handleSubmitted() {
  tableRef.value?.initData();
}
</script>
