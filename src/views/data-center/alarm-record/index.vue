<template>
  <div>
    <NFlex class="rounded-10px p-8px h-full w-full bg-container">
      <CommonTable
        ref="tableRef"
        v-model:checked-row-keys="checkedRowKeys"
        class="h-full w-full"
        :columns="columns"
        :url="URL"
        :search-field-list="fieldList"
        method="get"
        row-key="alarmId"
      >
        <template #actions>
          <NButton type="primary" :disabled="!checkedRowKeys.length" @click="handleExport">
            {{ $t('common.export') }}
          </NButton>
        </template>
      </CommonTable>
      <AlarmDetailModal
        v-model:visible="detailVisible"
        :alarm-data="currentAlarm"
        @confirm="handleModalConfirm"
        @create-work-order="handleModalCreateWorkOrder"
      />
      <AlarmCreateWorkOrderModal v-model:visible="createWorkOrderVisible" :alarm-data="currentAlarm" @success="handleSubmitted" />
    </NFlex>
  </div>
</template>

<script setup lang="tsx">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { fetchConfirmDeviceAlarm, fetchExportDeviceAlarm, fetchGetDeviceAlarm } from '@/service/api/alarm';
import { downloadBlob } from '@/utils/download';
import { $t } from '@/locales';
import CommonTable from '@/components/common/common-table/index.vue';
import AlarmDetailModal from './components/alarm-detail-modal.vue';
import AlarmCreateWorkOrderModal from './components/alarm-create-work-order-modal.vue';

defineOptions({
  name: 'AlarmRecordPage'
});

const route = useRoute();
const router = useRouter();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/device_alarm/page');

const detailVisible = ref(false);
const createWorkOrderVisible = ref(false);
const currentAlarm = ref<Api.Alarm.DeviceAlarm | null>(null);

const fieldList = ref([
  {
    label: $t('page.alarm.record.alarmCode'),
    value: 'alarmCode',
    span: 6,
    component: 'n-input',
    placeholder: $t('page.alarm.record.form.alarmCode')
  },
  {
    label: $t('page.alarm.record.alarmLevel'),
    value: 'alarmLevel',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.alarm.alarmLevels.level1'), value: 1 },
        { label: $t('page.alarm.alarmLevels.level2'), value: 2 },
        { label: $t('page.alarm.alarmLevels.level3'), value: 3 }
      ]
    }
  },
  {
    label: $t('page.alarm.record.confirmStatus'),
    value: 'confirmStatus',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.alarm.record.unconfirmed'), value: 0 },
        { label: $t('page.alarm.record.confirmed'), value: 1 }
      ]
    }
  },
  {
    label: $t('page.alarm.record.clearStatus'),
    value: 'clearStatus',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.alarm.record.uncleared'), value: 0 },
        { label: $t('page.alarm.record.cleared'), value: 1 }
      ]
    }
  }
]);

function getAlarmLevelTag(level: number): { type: 'error' | 'warning' | 'info'; text: string } {
  const levelMap: Record<number, { type: 'error' | 'warning' | 'info'; text: string }> = {
    1: { type: 'error', text: $t('page.alarm.alarmLevels.level1') },
    2: { type: 'warning', text: $t('page.alarm.alarmLevels.level2') },
    3: { type: 'info', text: $t('page.alarm.alarmLevels.level3') }
  };
  return levelMap[level] || { type: 'info', text: '-' };
}

function formatDuration(duration?: number): string {
  if (duration === null || duration === undefined) return '-';
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

const columns = ref<DataTableColumn[]>([
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    key: 'alarmCode',
    title: $t('page.alarm.record.alarmCode'),
    width: 180,
    align: 'center',
    ellipsis: { tooltip: true }
  },
  {
    key: 'deviceName',
    title: $t('page.alarm.record.deviceName'),
    width: 150,
    align: 'center',
    render: (row: any) => <span>{row.deviceName || row.deviceCode || '-'}</span>
  },
  {
    key: 'partName',
    title: $t('page.alarm.record.partName'),
    width: 120,
    align: 'center',
    render: (row: any) => <span>{row.partName || '-'}</span>
  },
  {
    key: 'alarmLevel',
    title: $t('page.alarm.record.alarmLevel'),
    width: 100,
    align: 'center',
    render: (row: any) => {
      const level = getAlarmLevelTag(row.alarmLevel);
      return <NTag type={level.type}>{level.text}</NTag>;
    }
  },
  {
    key: 'alarmTime',
    title: $t('page.alarm.record.alarmTime'),
    width: 170,
    align: 'center'
  },
  {
    key: 'currentValue',
    title: $t('page.alarm.record.currentValue'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{row.currentValue ?? '-'}</span>
  },
  {
    key: 'thresholdValue',
    title: $t('page.alarm.record.thresholdValue'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{row.thresholdValue ?? '-'}</span>
  },
  {
    key: 'confirmStatus',
    title: $t('page.alarm.record.confirmStatus'),
    width: 100,
    align: 'center',
    render: (row: any) => (
      <NTag type={row.confirmStatus === 1 ? 'success' : 'default'}>
        {row.confirmStatus === 1 ? $t('page.alarm.record.confirmed') : $t('page.alarm.record.unconfirmed')}
      </NTag>
    )
  },
  {
    key: 'clearStatus',
    title: $t('page.alarm.record.clearStatus'),
    width: 100,
    align: 'center',
    render: (row: any) => (
      <NTag type={row.clearStatus === 1 ? 'success' : 'default'}>
        {row.clearStatus === 1 ? $t('page.alarm.record.cleared') : $t('page.alarm.record.uncleared')}
      </NTag>
    )
  },
  {
    key: 'isFalseAlarm',
    title: $t('page.alarm.record.isFalseAlarm'),
    width: 100,
    align: 'center',
    render: (row: any) => (
      <NTag type={row.isFalseAlarm === 1 ? 'warning' : 'success'}>
        {row.isFalseAlarm === 1 ? $t('page.alarm.record.falseAlarmYes') : $t('page.alarm.record.falseAlarmNo')}
      </NTag>
    )
  },
  {
    key: 'alarmDuration',
    title: $t('page.alarm.record.alarmDuration'),
    width: 80,
    align: 'center',
    render: (row: any) => <span>{formatDuration(row.alarmDuration)}</span>
  },
  {
    key: 'workOrderCode',
    title: $t('page.alarm.record.workOrderCode'),
    width: 120,
    align: 'center',
    ellipsis: { tooltip: true },
    render: (row: any) => <span>{row.workOrderCode || '-'}</span>
  },
  {
    key: 'action',
    title: $t('common.operate'),
    width: 180,
    align: 'center',
    fixed: 'right',
    render: (row: any) => {
      const actions: any[] = [];

      actions.push(
        <NButton type="primary" text size="small" onClick={() => handleViewDetail(row)}>
          {$t('page.alarm.record.viewDetail')}
        </NButton>
      );

      if (row.confirmStatus === 0) {
        actions.push(
          <NPopconfirm onPositiveClick={() => handleConfirm(row, 0)}>
            {{
              default: () => $t('page.alarm.record.confirmAlarm'),
              trigger: () => (
                <NButton type="warning" text size="small">
                  {$t('page.alarm.record.confirm')}
                </NButton>
              )
            }}
          </NPopconfirm>
        );
        actions.push(
          <NPopconfirm onPositiveClick={() => handleConfirm(row, 1)}>
            {{
              default: () => $t('page.alarm.record.confirmFalseAlarm'),
              trigger: () => (
                <NButton type="error" text size="small">
                  {$t('page.alarm.record.falseAlarmYes')}
                </NButton>
              )
            }}
          </NPopconfirm>
        );
      }

      if (row.confirmStatus === 1 && row.clearStatus === 0 && !row.workOrderId && row.isFalseAlarm !== 1) {
        actions.push(
          <NButton type="info" text size="small" onClick={() => handleOpenCreateWorkOrder(row)}>
            {$t('page.alarm.record.createWorkOrder')}
          </NButton>
        );
      }

      return <NSpace justify="start">{actions}</NSpace>;
    }
  }
]);

function handleViewDetail(row: Api.Alarm.DeviceAlarm) {
  currentAlarm.value = row;
  detailVisible.value = true;
}

async function handleConfirm(row: Api.Alarm.DeviceAlarm, isFalseAlarm: number) {
  const { error } = await fetchConfirmDeviceAlarm({ alarmId: row.alarmId, isFalseAlarm });
  if (!error) {
    window.$message?.success($t('common.actionSuccess'));
    tableRef.value?.initData();
  }
}

function handleOpenCreateWorkOrder(row: Api.Alarm.DeviceAlarm) {
  currentAlarm.value = row;
  createWorkOrderVisible.value = true;
}

async function handleModalConfirm(isFalseAlarm: number) {
  if (!currentAlarm.value) return;
  const { error } = await fetchConfirmDeviceAlarm({ alarmId: currentAlarm.value.alarmId, isFalseAlarm });
  if (!error) {
    window.$message?.success($t('common.actionSuccess'));
    detailVisible.value = false;
    tableRef.value?.initData();
  }
}

function handleModalCreateWorkOrder() {
  detailVisible.value = false;
  createWorkOrderVisible.value = true;
}

function handleSubmitted() {
  tableRef.value?.initData();
}

async function handleExport() {
  const ids = checkedRowKeys.value.map(key => Number(key));
  const { error, response } = await fetchExportDeviceAlarm(ids);
  if (!error && response) {
    downloadBlob(response, '报警记录.xlsx');
    checkedRowKeys.value = [];
  }
}

async function openAlarmDetail(alarmId: number) {
  const { error, data } = await fetchGetDeviceAlarm(String(alarmId));
  if (!error && data) {
    currentAlarm.value = data;
    detailVisible.value = true;
  }
}

function handleRouteQuery() {
  const alarmId = route.query.alarmId;
  if (alarmId) {
    openAlarmDetail(Number(alarmId));
    router.replace({ query: {} });
  }
}

watch(
  () => route.query.alarmId,
  () => {
    handleRouteQuery();
  }
);

onMounted(() => {
  handleRouteQuery();
});
</script>

<style scoped></style>
