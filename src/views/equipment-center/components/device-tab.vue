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
        <NButton type="primary" @click="handleAdd">{{ $t('page.equipment.addDevice') }}</NButton>
        <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">
          {{ $t('common.batchDelete') }}
        </NButton>
      </template>
    </CommonTable>
    <EditDrawer v-model:visible="showEdit" :row="editRow" :operate-type="operateType" :edit-type="editType" @submitted="handleSubmitted" />
    <DetailDrawer v-model:visible="showDetail" :row="detailRow" :detail-type="detailType" />
    <ThresholdConfigModal v-model:visible="showThresholdConfig" :part-data="thresholdPartData" />
  </div>
</template>

<script setup lang="tsx">
import { ref, watch } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchDeleteDevice, fetchDeleteDevicePart } from '@/service/api/equipment';
import { $t } from '@/locales';
import EditDrawer from './edit-drawer.vue';
import DetailDrawer from './detail-drawer.vue';
import ThresholdConfigModal from './threshold-config-modal.vue';

defineOptions({
  name: 'DeviceTab'
});

const props = defineProps<{
  viewDeviceData?: any;
}>();

const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/factory_device/page');
const searchParams = ref({
  page: 1,
  pageSize: 10
});

const showEdit = ref(false);
const operateType = ref<'add' | 'edit' | 'addChild'>('add');
const editType = ref<'device' | 'part'>('device');
const editRow = ref<any>({});

const showDetail = ref(false);
const detailType = ref<'device' | 'part'>('device');
const detailRow = ref<any>({});

const showThresholdConfig = ref(false);
const thresholdPartData = ref<any>({});

const fieldList = ref([
  {
    label: $t('page.equipment.deviceName'),
    value: 'deviceName',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.equipment.deviceCode'),
    value: 'deviceCode',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.equipment.deviceStatus'),
    value: 'deviceStatus',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.equipment.statusNormal'), value: 1 },
        { label: $t('page.equipment.statusMaintenance'), value: 2 },
        { label: $t('page.equipment.statusFault'), value: 3 },
        { label: $t('page.equipment.statusScrapped'), value: 0 }
      ]
    }
  },
  {
    label: $t('page.equipment.manufacturer'),
    value: 'manufacturer',
    span: 6,
    component: 'n-input'
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
    disabled: (row: any) => Boolean(row.partId)
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
      if (row.partId) {
        return <span>{row.partCode || '-'}</span>;
      }
      return <span>{row.deviceCode || '-'}</span>;
    }
  },
  {
    key: 'name',
    title: $t('page.equipment.name'),
    width: 150,
    align: 'center',
    render: (row: any) => {
      if (row.partId) {
        return <NTag type="info">{row.partName || '-'}</NTag>;
      }
      return <span>{row.deviceName || '-'}</span>;
    }
  },
  {
    key: 'model',
    title: $t('page.equipment.deviceModel'),
    width: 120,
    align: 'center',
    render: (row: any) => {
      if (row.partId) {
        return <span>{row.partType || '-'}</span>;
      }
      return <span>{row.deviceModel || '-'}</span>;
    }
  },
  {
    key: 'status',
    title: $t('page.equipment.status'),
    width: 100,
    align: 'center',
    render: (row: any) => {
      if (row.partId) {
        const statusMap: Record<number, { type: 'success' | 'error'; text: string }> = {
          1: { type: 'success', text: $t('page.manage.common.status.enable') },
          0: { type: 'error', text: $t('page.manage.common.status.disable') }
        };
        const status = statusMap[row.partStatus] || { type: 'info', text: '-' };
        return <NTag type={status.type}>{status.text}</NTag>;
      }
      const statusMap: Record<number, { type: 'success' | 'warning' | 'error' | 'info'; text: string }> = {
        1: { type: 'success', text: $t('page.equipment.statusNormal') },
        2: { type: 'warning', text: $t('page.equipment.statusMaintenance') },
        3: { type: 'error', text: $t('page.equipment.statusFault') },
        0: { type: 'info', text: $t('page.equipment.statusScrapped') }
      };
      const status = statusMap[row.deviceStatus] || { type: 'info', text: '-' };
      return <NTag type={status.type}>{status.text}</NTag>;
    }
  },
  {
    key: 'monitor',
    title: $t('page.equipment.monitorEnabled'),
    width: 80,
    align: 'center',
    render: (row: any) => {
      if (row.partId) {
        return (
          <NTag type={row.monitorEnabled === 1 ? 'success' : 'default'}>
            {row.monitorEnabled === 1 ? $t('page.equipment.monitorEnabledYes') : $t('page.equipment.monitorEnabledNo')}
          </NTag>
        );
      }
      return <span>-</span>;
    }
  },
  {
    key: 'manufacturer',
    title: $t('page.equipment.manufacturer'),
    width: 120,
    align: 'center',
    render: (row: any) => {
      if (row.partId) {
        return <span>{row.installPosition || '-'}</span>;
      }
      return <span>{row.manufacturer || '-'}</span>;
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
    width: 280,
    align: 'center',
    fixed: 'right',
    render: (row: any) => {
      if (row.partId) {
        return (
          <NSpace justify="end">
            <NButton type="info" text size="small" onClick={() => handleThresholdConfig(row)}>
              {$t('page.equipment.thresholdConfig')}
            </NButton>
            <NButton type="info" text size="small" onClick={() => handleDetailPart(row)}>
              {$t('page.equipment.viewDetail')}
            </NButton>
            <NButton type="info" text size="small" onClick={() => handleEditPart(row)}>
              {$t('common.edit')}
            </NButton>
            <NPopconfirm onPositiveClick={() => handleDeletePart(row.partId, row.deviceId)}>
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
      return (
        <NSpace justify="end">
          <NButton type="primary" text size="small" onClick={() => handleAddPart(row)}>
            {$t('page.equipment.addPart')}
          </NButton>
          <NButton type="info" text size="small" onClick={() => handleDetail(row)}>
            {$t('page.equipment.viewDetail')}
          </NButton>

          <NButton type="info" text size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.deviceId)}>
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
  editType.value = 'device';
  editRow.value = {};
  showEdit.value = true;
}

function handleAddPart(row: any) {
  operateType.value = 'addChild';
  editType.value = 'part';
  editRow.value = { deviceId: row.deviceId, deviceName: row.deviceName };
  showEdit.value = true;
}

function handleEditPart(row: any) {
  operateType.value = 'edit';
  editType.value = 'part';
  editRow.value = { ...row };
  showEdit.value = true;
}

function handleEdit(row: any) {
  operateType.value = 'edit';
  editType.value = 'device';
  editRow.value = { ...row };
  showEdit.value = true;
}

function handleDetail(row: any) {
  detailType.value = 'device';
  detailRow.value = { ...row };
  showDetail.value = true;
}

function handleDetailPart(row: any) {
  detailType.value = 'part';
  detailRow.value = { ...row };
  showDetail.value = true;
}

function handleThresholdConfig(row: any) {
  thresholdPartData.value = { ...row };
  showThresholdConfig.value = true;
}

async function handleDelete(id: string) {
  const { error, data: result } = await fetchDeleteDevice({ ids: [id] });
  if (!error && result) {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

async function handleDeletePart(partId: number, _deviceId: number) {
  const { error, data: result } = await fetchDeleteDevicePart({ ids: [String(partId)] });
  if (!error && result) {
    window.$message?.success($t('common.deleteSuccess'));
    tableRef.value?.initData();
  }
}

async function handleBatchDelete() {
  window.$dialog?.warning({
    title: $t('common.confirmDelete'),
    content: $t('page.equipment.confirmBatchDeleteDevice'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const ids = checkedRowKeys.value.map(key => String(key).replace('device_', '')).filter(key => !key.startsWith('part_'));
      const { error, data: result } = await fetchDeleteDevice({ ids });
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

watch(
  () => props.viewDeviceData,
  data => {
    if (data) {
      detailType.value = 'device';
      detailRow.value = { ...data };
      showDetail.value = true;
    }
  },
  { immediate: true }
);
</script>

<style scoped></style>
