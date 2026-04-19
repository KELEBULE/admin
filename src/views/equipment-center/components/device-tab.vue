<template>
  <div class="rounded-10px p-10px h-full bg-container">
    <CommonTable
      ref="tableRef"
      v-model:checked-row-keys="checkedRowKeys"
      class="h-full w-full"
      :columns="columns"
      :url="URL"
      :search-field-list="fieldList"
      method="get"
      row-key="uniqueKey"
    >
      <template #actions>
        <NButton v-if="hasAuth('factory:device:add')" type="primary" @click="handleAdd">{{ $t('page.equipment.addDevice') }}</NButton>
        <NButton v-if="hasAuth('equipment:import')" type="success" @click="handleImport">
          {{ $t('page.equipment.import.title') }}
        </NButton>
        <NButton v-if="hasAuth('equipment:export')" type="info" :disabled="!checkedRowKeys.length" @click="handleExport">
          {{ $t('page.equipment.export.title') }}
        </NButton>
        <NButton v-if="hasAuth('factory:device:scrap')" type="warning" :disabled="!checkedRowKeys.length" @click="handleBatchScrap">
          {{ $t('page.equipment.batchScrap') }}
        </NButton>
        <NButton v-if="hasAuth('factory:device:updateStatus')" type="info" :disabled="!checkedRowKeys.length" @click="handleBatchEditStatus">
          {{ $t('page.equipment.batchEditStatus') }}
        </NButton>
        <NButton v-if="hasAuth('factory:device:delete')" type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">
          {{ $t('common.batchDelete') }}
        </NButton>
      </template>
    </CommonTable>
    <EditDrawer v-model:visible="showEdit" :row="editRow" :operate-type="operateType" :edit-type="editType" @submitted="handleSubmitted" />
    <DetailDrawer v-model:visible="showDetail" :row="detailRow" :detail-type="detailType" />
    <ThresholdConfigModal v-model:visible="showThresholdConfig" :part-data="thresholdPartData" />
    <StatusChangeModal
      v-model:show="showStatusChangeModal"
      :device-ids="selectedDeviceIds"
      :mode="statusChangeMode"
      @success="handleStatusChangeSuccess"
    />
    <ImportModal v-model:show="showImportModal" @success="handleImportSuccess" />
  </div>
</template>

<script setup lang="tsx">
import { ref, watch } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchDeleteDevice, fetchDeleteDevicePart, fetchExportEquipment } from '@/service/api/equipment';
import { useAuth } from '@/hooks/business/auth';
import { $t } from '@/locales';
import EditDrawer from './edit-drawer.vue';
import DetailDrawer from './detail-drawer.vue';
import ThresholdConfigModal from './threshold-config-modal.vue';
import StatusChangeModal from './status-change-modal.vue';
import ImportModal from './import-modal.vue';

defineOptions({
  name: 'DeviceTab'
});

const { hasAuth } = useAuth();

const props = defineProps<{
  viewDeviceData?: any;
}>();

const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/factory_device/page');

const showEdit = ref(false);
const operateType = ref<'add' | 'edit' | 'addChild'>('add');
const editType = ref<'device' | 'part'>('device');
const editRow = ref<any>({});

const showDetail = ref(false);
const detailType = ref<'device' | 'part'>('device');
const detailRow = ref<any>({});

const showThresholdConfig = ref(false);
const thresholdPartData = ref<any>({});

const showStatusChangeModal = ref(false);
const statusChangeMode = ref<'status' | 'scrap'>('status');
const selectedDeviceIds = ref<number[]>([]);

const showImportModal = ref(false);

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
        { label: $t('page.equipment.statusDisabled'), value: 0 }
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
        0: { type: 'info', text: $t('page.equipment.statusDisabled') }
      };
      const status = statusMap[row.deviceStatus] || { type: 'info', text: '-' };
      return <NTag type={status.type}>{status.text}</NTag>;
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
        const partActions: any[] = [];

        if (hasAuth('part:threshold:save')) {
          partActions.push(
            <NButton type="info" text size="small" onClick={() => handleThresholdConfig(row)}>
              {$t('page.equipment.thresholdConfig')}
            </NButton>
          );
        }

        if (hasAuth('device:part:get')) {
          partActions.push(
            <NButton type="info" text size="small" onClick={() => handleDetailPart(row)}>
              {$t('page.equipment.viewDetail')}
            </NButton>
          );
        }

        if (hasAuth('device:part:update')) {
          partActions.push(
            <NButton type="info" text size="small" onClick={() => handleEditPart(row)}>
              {$t('common.edit')}
            </NButton>
          );
        }

        if (hasAuth('device:part:delete')) {
          partActions.push(
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
          );
        }

        return <NSpace justify="end">{partActions}</NSpace>;
      }

      const deviceActions: any[] = [];

      if (hasAuth('device:part:add')) {
        deviceActions.push(
          <NButton type="primary" text size="small" onClick={() => handleAddPart(row)}>
            {$t('page.equipment.addPart')}
          </NButton>
        );
      }

      if (hasAuth('factory:device:get')) {
        deviceActions.push(
          <NButton type="info" text size="small" onClick={() => handleDetail(row)}>
            {$t('page.equipment.viewDetail')}
          </NButton>
        );
      }

      if (hasAuth('factory:device:update')) {
        deviceActions.push(
          <NButton type="info" text size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </NButton>
        );
      }

      if (hasAuth('factory:device:delete')) {
        deviceActions.push(
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
        );
      }

      return <NSpace justify="end">{deviceActions}</NSpace>;
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

async function handleBatchScrap() {
  const ids = checkedRowKeys.value.map(key => String(key).replace('device_', '')).filter(key => !key.startsWith('part_'));
  if (ids.length === 0) {
    window.$message?.warning('请选择要报废的设备');
    return;
  }
  selectedDeviceIds.value = ids.map(id => Number(id));
  statusChangeMode.value = 'scrap';
  showStatusChangeModal.value = true;
}

function handleBatchEditStatus() {
  const ids = checkedRowKeys.value.map(key => String(key).replace('device_', '')).filter(key => !key.startsWith('part_'));
  if (ids.length === 0) {
    window.$message?.warning('请选择要修改状态的设备');
    return;
  }
  selectedDeviceIds.value = ids.map(id => Number(id));
  statusChangeMode.value = 'status';
  showStatusChangeModal.value = true;
}

function handleStatusChangeSuccess() {
  checkedRowKeys.value = [];
  tableRef.value?.initData();
}

function handleImport() {
  showImportModal.value = true;
}

function handleImportSuccess() {
  tableRef.value?.initData();
}

async function handleExport() {
  const ids = checkedRowKeys.value.map(key => String(key).replace('device_', '')).filter(key => !key.startsWith('part_'));
  if (ids.length === 0) {
    window.$message?.warning($t('page.equipment.export.selectDevice'));
    return;
  }

  try {
    const { error, data } = await fetchExportEquipment(ids.map(id => Number(id)));

    if (!error && data) {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = '设备数据.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      window.$message?.success($t('page.equipment.export.success'));
    }
  } catch {
    window.$message?.error($t('page.equipment.export.failed'));
  }
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
