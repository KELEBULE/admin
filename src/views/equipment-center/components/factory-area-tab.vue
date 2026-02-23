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
      row-key="uniqueKey"
    >
      <template #actions>
        <NButton type="primary" @click="handleAdd">{{ $t('page.equipment.addArea') }}</NButton>
        <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">
          {{ $t('common.batchDelete') }}
        </NButton>
      </template>
    </CommonTable>
    <EditDrawer v-model:visible="showEdit" :row="editRow" :operate-type="operateType" :edit-type="editType" @submitted="handleSubmitted" />
  </div>
</template>

<script setup lang="tsx">
import { computed, onMounted, ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchDeleteDevice, fetchDeleteFactoryArea, fetchGetFactoryInfoList } from '@/service/api/equipment';
import { $t } from '@/locales';
import EditDrawer from './edit-drawer.vue';

defineOptions({
  name: 'FactoryAreaTab'
});

const emit = defineEmits<{
  (e: 'viewDevice', device: any): void;
}>();

const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/factory_area/page');
const searchParams = ref({
  page: 1,
  pageSize: 10
});

const showEdit = ref(false);
const operateType = ref<'add' | 'edit' | 'addChild'>('add');
const editType = ref<'area' | 'device'>('area');
const editRow = ref<any>({});

const factoryOptions = ref<{ label: string; value: number }[]>([]);

async function loadFactoryOptions() {
  const { data: factoryList } = await fetchGetFactoryInfoList();
  if (factoryList) {
    factoryOptions.value = factoryList.map((item: any) => ({
      label: item.factoryName,
      value: item.factoryId
    }));
  }
}

const fieldList = computed(() => [
  {
    label: $t('page.equipment.factoryName'),
    value: 'factoryId',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: factoryOptions.value
    }
  },
  {
    label: $t('page.equipment.areaName'),
    value: 'areaName',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.equipment.locationCode'),
    value: 'locationCode',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.equipment.areaStatus'),
    value: 'areaStatus',
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
    fixed: 'left',
    disabled: (row: any) => Boolean(row.deviceId)
  },
  {
    key: 'index',
    title: $t('common.index'),
    width: 64,
    align: 'center'
  },
  {
    key: 'code',
    title: $t('page.equipment.code'),
    width: 120,
    align: 'center',
    render: (row: any) => {
      if (row.deviceId) {
        return <span>{row.deviceCode || '-'}</span>;
      }
      return <span>{row.locationCode || '-'}</span>;
    }
  },
  {
    key: 'name',
    title: $t('page.equipment.name'),
    width: 150,
    align: 'center',
    render: (row: any) => {
      if (row.deviceId) {
        return <span>{row.deviceName || '-'}</span>;
      }
      return <span>{row.areaName || '-'}</span>;
    }
  },
  {
    key: 'status',
    title: $t('page.equipment.status'),
    width: 100,
    align: 'center',
    render: (row: any) => {
      if (row.deviceId) {
        const statusMap: Record<number, { type: 'success' | 'warning' | 'error' | 'info'; text: string }> = {
          1: { type: 'success', text: $t('page.equipment.statusNormal') },
          2: { type: 'warning', text: $t('page.equipment.statusMaintenance') },
          3: { type: 'error', text: $t('page.equipment.statusFault') },
          0: { type: 'info', text: $t('page.equipment.statusScrapped') }
        };
        const status = statusMap[row.deviceStatus] || { type: 'info', text: '-' };
        return <NTag type={status.type}>{status.text}</NTag>;
      }
      const statusMap: Record<number, { type: 'success' | 'error'; text: string }> = {
        1: { type: 'success', text: $t('page.manage.common.status.enable') },
        0: { type: 'error', text: $t('page.manage.common.status.disable') }
      };
      const status = statusMap[row.areaStatus] || { type: 'info', text: '-' };
      return <NTag type={status.type}>{status.text}</NTag>;
    }
  },
  {
    key: 'deviceCount',
    title: $t('page.equipment.deviceCount'),
    width: 100,
    align: 'center',
    render: (row: any) => {
      if (row.deviceId) {
        return <span>-</span>;
      }
      const count = row.children?.length || 0;
      return <span>{count}</span>;
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
    width: 100,
    align: 'center',
    fixed: 'right',
    render: (row: any) => {
      if (row.deviceId) {
        return (
          <NSpace justify="end">
            <NButton type="info" text size="small" onClick={() => handleViewDevice(row)}>
              {$t('page.equipment.viewDetail')}
            </NButton>
            <NPopconfirm onPositiveClick={() => handleDeleteDevice(row.deviceId)}>
              {{
                default: () => $t('page.equipment.confirmDeleteDevice'),
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
      return (
        <NSpace justify="end">
          <NButton type="info" text size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </NButton>
          <NButton type="primary" text size="small" onClick={() => handleAddDevice(row)}>
            {$t('page.equipment.addDevice')}
          </NButton>

          <NPopconfirm onPositiveClick={() => handleDelete(row.areaId)}>
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
  editType.value = 'area';
  editRow.value = {};
  showEdit.value = true;
}

function handleAddDevice(row: any) {
  operateType.value = 'addChild';
  editType.value = 'device';
  editRow.value = { locationId: row.areaId, areaName: row.areaName };
  showEdit.value = true;
}

function handleEdit(row: any) {
  operateType.value = 'edit';
  editType.value = 'area';
  editRow.value = { ...row };
  showEdit.value = true;
}

function handleViewDevice(row: any) {
  emit('viewDevice', row);
}

async function handleDelete(id: string) {
  const { error, data: result } = await fetchDeleteFactoryArea({ ids: [id] });
  if (!error && result) {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

async function handleDeleteDevice(deviceId: number) {
  const { error, data: result } = await fetchDeleteDevice({ ids: [String(deviceId)] });
  if (!error && result) {
    window.$message?.success($t('common.deleteSuccess'));
    tableRef.value?.initData();
  }
}

async function handleBatchDelete() {
  window.$dialog?.warning({
    title: $t('common.confirmDelete'),
    content: $t('page.equipment.confirmBatchDeleteArea'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const ids = checkedRowKeys.value.map(key => String(key).replace('area_', '')).filter(key => !key.startsWith('device_'));
      const { error, data: result } = await fetchDeleteFactoryArea({ ids });
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

onMounted(() => {
  loadFactoryOptions();
});
</script>

<style scoped></style>
