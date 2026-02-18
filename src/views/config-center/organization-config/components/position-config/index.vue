<template>
  <div class="rounded-10px p-10px h-full bg-container">
    <CommonTable
      ref="tableRef"
      v-model:checked-row-keys="checkedRowKeys"
      v-model:table-data="tableData"
      class="h-full w-full"
      :columns="columns"
      :url="URL"
      :search-field-list="fieldList"
      :search-params="searchParams"
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
    <PositionOperateDrawer v-model:visible="drawerVisible" :operate-type="operateType" :row-data="editingData" @submitted="handleSubmitted" />
  </div>
</template>

<script setup lang="tsx">
import { h, ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm } from 'naive-ui';
import { fetchDeletePosition } from '@/service/api';
// import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import { transDeleteParams } from '@/utils/common';
import { $t } from '@/locales';
import CommonTable from '@/components/common/common-table/index.vue';
import PositionOperateDrawer from './position-operate-drawer.vue';

defineOptions({
  name: 'PositionPage'
});

// const { hasAuth } = useAuth();
const { dictTag, dictOptions } = useDict();

const tableRef = ref<InstanceType<typeof CommonTable>>();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableData = ref<Api.SystemManage.Position[]>([]);
const URL = '/sys_position/page';

const searchParams = ref<Api.SystemManage.PositionSearchParams>({
  page: 1,
  pageSize: 20,
  name: null,
  status: null
});

const fieldList = [
  {
    key: 'name',
    label: $t('page.manage.position.name'),
    type: 'input',
    placeholder: $t('page.manage.position.form.name')
  },
  {
    key: 'status',
    label: $t('page.manage.position.status'),
    type: 'select',
    placeholder: $t('page.manage.position.form.status'),
    options: dictOptions('status')
  }
];

const drawerVisible = ref(false);
const operateType = ref<NaiveUI.TableOperateType>('add');
const editingData = ref<Api.SystemManage.Position | null>(null);

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
    key: 'name',
    title: $t('page.manage.position.name'),
    align: 'center',
    minWidth: 120
  },
  {
    key: 'code',
    title: $t('page.manage.position.code'),
    align: 'center',
    minWidth: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'abbr',
    title: $t('page.manage.position.abbr'),
    align: 'center',
    minWidth: 100
  },
  {
    key: 'description',
    title: $t('page.manage.position.description'),
    align: 'center',
    minWidth: 120
  },
  {
    key: 'sort',
    title: $t('page.manage.position.sort'),
    align: 'center',
    width: 80,
    minWidth: 80
  },
  {
    key: 'status',
    title: $t('page.manage.position.status'),
    align: 'center',
    width: 80,
    render: (row: any) => dictTag('status', row.status)
  },
  {
    key: 'operate',
    title: $t('common.operate'),
    align: 'center',
    width: 200,
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

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  drawerVisible.value = true;
}

function handleEdit(id: string) {
  operateType.value = 'edit';
  const data = tableData.value.find(item => item.id === id);
  editingData.value = data || null;
  drawerVisible.value = true;
}

async function handleDelete(id: string) {
  const { error, data: result } = await fetchDeletePosition(transDeleteParams([id]));
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
      const { error, data: result } = await fetchDeletePosition(transDeleteParams(checkedRowKeys.value.map(key => key.toString())));
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
