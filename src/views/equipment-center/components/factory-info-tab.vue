<template>
  <div class="rounded-10px p-10px h-full bg-container">
    <CommonTable
      ref="tableRef"
      v-model:checked-row-keys="checkedRowKeys"
      class="h-full w-full"
      :columns="columns"
      :url="URL"
      :search-field-list="fieldList"
      :search-params="searchParams"
      method="get"
      row-key="factoryId"
    >
      <template #actions>
        <NButton type="primary" @click="handleAdd">{{ $t('page.equipment.addFactory') }}</NButton>
        <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">
          {{ $t('common.batchDelete') }}
        </NButton>
      </template>
    </CommonTable>
    <EditDrawer v-model:visible="showEdit" :row="editRow" :operate-type="operateType" edit-type="factory" @submitted="handleSubmitted" />
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchDeleteFactoryInfo } from '@/service/api/equipment';
import { $t } from '@/locales';
import EditDrawer from './edit-drawer.vue';

defineOptions({
  name: 'FactoryInfoTab'
});

const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/factory_info/page');
const searchParams = ref({
  page: 1,
  pageSize: 10
});

const showEdit = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const editRow = ref<any>({});

const fieldList = ref([
  {
    label: $t('page.equipment.factoryName'),
    value: 'factoryName',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.equipment.factoryCode'),
    value: 'factoryCode',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.equipment.status'),
    value: 'status',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.manage.common.status.enable'), value: 1 },
        { label: $t('page.manage.common.status.disable'), value: 0 }
      ]
    }
  }
]);

function formatTime(time: string | number | null): string {
  if (!time) return '-';
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-';
}

const columns = ref<DataTableColumn[]>([
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    key: 'factoryCode',
    title: $t('page.equipment.factoryCode'),
    width: 120,
    align: 'center'
  },
  {
    key: 'factoryName',
    title: $t('page.equipment.factoryName'),
    width: 150,
    align: 'center'
  },
  {
    key: 'factoryAddress',
    title: $t('page.equipment.factoryAddress'),
    width: 200,
    align: 'center',
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'contactPerson',
    title: $t('page.equipment.contactPerson'),
    width: 100,
    align: 'center'
  },
  {
    key: 'contactPhone',
    title: $t('page.equipment.contactPhone'),
    width: 120,
    align: 'center'
  },
  {
    key: 'status',
    title: $t('page.equipment.status'),
    width: 80,
    align: 'center',
    render: (row: any) => {
      const statusMap: Record<number, { type: 'success' | 'error'; text: string }> = {
        1: { type: 'success', text: $t('page.manage.common.status.enable') },
        0: { type: 'error', text: $t('page.manage.common.status.disable') }
      };
      const status = statusMap[row.status] || { type: 'info', text: '-' };
      return <NTag type={status.type}>{status.text}</NTag>;
    }
  },
  {
    key: 'createTime',
    title: $t('common.createTime'),
    width: 160,
    align: 'center',
    render: (row: any) => <span>{formatTime(row.createTime)}</span>
  },
  {
    key: 'action',
    title: $t('common.operate'),
    width: 80,
    align: 'center',
    fixed: 'right',
    render: (row: any) => {
      return (
        <NSpace justify="center">
          <NButton type="info" text size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.factoryId)}>
            {{
              default: () => $t('common.confirmDelete'),
              trigger: () => (
                <NButton type="error" text size="small">
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </NSpace>
      );
    }
  }
]);

function handleAdd() {
  operateType.value = 'add';
  editRow.value = {};
  showEdit.value = true;
}

function handleEdit(row: any) {
  operateType.value = 'edit';
  editRow.value = { ...row };
  showEdit.value = true;
}

async function handleDelete(id: string) {
  const { error, data: result } = await fetchDeleteFactoryInfo({ ids: [id] });
  if (!error && result) {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

async function handleBatchDelete() {
  window.$dialog?.warning({
    title: $t('common.confirmDelete'),
    content: $t('page.equipment.confirmBatchDeleteFactory'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error, data: result } = await fetchDeleteFactoryInfo({ ids: checkedRowKeys.value.map(key => String(key)) });
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

<style scoped></style>
