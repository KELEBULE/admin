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
      method="get"
      row-key="id"
    >
      <template #actions>
        <NButton type="primary" :disabled="!checkedRowKeys.length" @click="handleMarkRead">
          {{ $t('page.alarm.notice.markRead') }}
        </NButton>
        <NButton type="info" @click="handleMarkAllRead">
          {{ $t('page.alarm.notice.markAllRead') }}
        </NButton>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="tsx">
import { h, ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NTag } from 'naive-ui';
import { fetchMarkAlarmNoticeRead } from '@/service/api/alarm';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';
import CommonTable from '@/components/common/common-table/index.vue';

defineOptions({
  name: 'AlarmNoticeTab'
});

const authStore = useAuthStore();

const tableRef = ref<InstanceType<typeof CommonTable>>();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableData = ref<Api.Alarm.AlarmNotice[]>([]);
const URL = '/alarm_notice/page';

const searchParams = ref<Api.Alarm.AlarmNoticeSearchParams>({
  page: 1,
  pageSize: 20,
  deviceName: null,
  alarmLevel: null,
  readStatus: null,
  notifyUserId: authStore.userInfo?.id as string
});

const fieldList = [
  {
    key: 'deviceName',
    label: $t('page.alarm.notice.deviceName'),
    type: 'input',
    placeholder: $t('page.alarm.notice.deviceName')
  },
  {
    key: 'alarmLevel',
    label: $t('page.alarm.alarmLevel'),
    type: 'select',
    placeholder: $t('page.alarm.form.alarmLevel'),
    options: [
      { label: $t('page.alarm.alarmLevels.level1'), value: 1 },
      { label: $t('page.alarm.alarmLevels.level2'), value: 2 },
      { label: $t('page.alarm.alarmLevels.level3'), value: 3 }
    ]
  },
  {
    key: 'readStatus',
    label: $t('page.alarm.notice.readStatus'),
    type: 'select',
    placeholder: $t('page.alarm.notice.readStatus'),
    options: [
      { label: $t('page.alarm.notice.readStatuses.unread'), value: 0 },
      { label: $t('page.alarm.notice.readStatuses.read'), value: 1 }
    ]
  }
];

const notifyStatusOptions = [
  { label: $t('page.alarm.notice.notifyStatuses.pending'), value: 0 },
  { label: $t('page.alarm.notice.notifyStatuses.sent'), value: 1 },
  { label: $t('page.alarm.notice.notifyStatuses.failed'), value: 2 }
];

const readStatusOptions = [
  { label: $t('page.alarm.notice.readStatuses.unread'), value: 0 },
  { label: $t('page.alarm.notice.readStatuses.read'), value: 1 }
];

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
    key: 'deviceName',
    title: $t('page.alarm.notice.deviceName'),
    align: 'center',
    minWidth: 120,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'deviceCode',
    title: $t('page.alarm.notice.deviceCode'),
    align: 'center',
    minWidth: 100
  },
  {
    key: 'alarmLevel',
    title: $t('page.alarm.alarmLevel'),
    align: 'center',
    minWidth: 80,
    render: (row: any) => {
      const levelMap: Record<number, { label: string; type: 'default' | 'info' | 'warning' | 'error' | 'success' }> = {
        1: { label: $t('page.alarm.alarmLevels.level1'), type: 'error' },
        2: { label: $t('page.alarm.alarmLevels.level2'), type: 'warning' },
        3: { label: $t('page.alarm.alarmLevels.level3'), type: 'info' }
      };
      const item = levelMap[row.alarmLevel];
      return item ? h(NTag, { type: item.type, size: 'small' }, { default: () => item.label }) : '-';
    }
  },
  {
    key: 'alarmMessage',
    title: $t('page.alarm.notice.alarmMessage'),
    align: 'center',
    minWidth: 150,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'currentValue',
    title: $t('page.alarm.notice.currentValue'),
    align: 'center',
    minWidth: 80
  },
  {
    key: 'thresholdValue',
    title: $t('page.alarm.notice.thresholdValue'),
    align: 'center',
    minWidth: 80
  },
  {
    key: 'notifyStatus',
    title: $t('page.alarm.notice.notifyStatus'),
    align: 'center',
    minWidth: 80,
    render: (row: any) => {
      const item = notifyStatusOptions.find(opt => opt.value === row.notifyStatus);
      const typeMap: Record<number, 'default' | 'info' | 'warning' | 'error' | 'success'> = {
        0: 'warning',
        1: 'success',
        2: 'error'
      };
      return item ? h(NTag, { type: typeMap[row.notifyStatus], size: 'small' }, { default: () => item.label }) : '-';
    }
  },
  {
    key: 'readStatus',
    title: $t('page.alarm.notice.readStatus'),
    align: 'center',
    minWidth: 80,
    render: (row: any) => {
      const item = readStatusOptions.find(opt => opt.value === row.readStatus);
      const typeMap: Record<number, 'default' | 'info' | 'warning' | 'error' | 'success'> = {
        0: 'warning',
        1: 'success'
      };
      return item ? h(NTag, { type: typeMap[row.readStatus], size: 'small' }, { default: () => item.label }) : '-';
    }
  },
  {
    key: 'createTime',
    title: $t('page.alarm.notice.createTime'),
    align: 'center',
    minWidth: 150
  }
];

async function handleMarkRead() {
  const { error, data } = await fetchMarkAlarmNoticeRead({
    ids: checkedRowKeys.value as string[],
    notifyUserId: authStore.userInfo?.id as string
  });
  if (!error && data) {
    window.$message?.success($t('common.updateSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

async function handleMarkAllRead() {
  const unreadItems = tableData.value.filter(item => item.readStatus === 0);
  if (unreadItems.length === 0) {
    window.$message?.info($t('common.noData'));
    return;
  }
  const { error, data } = await fetchMarkAlarmNoticeRead({
    ids: unreadItems.map(item => item.id),
    notifyUserId: authStore.userInfo?.id as string
  });
  if (!error && data) {
    window.$message?.success($t('common.updateSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

function refresh() {
  tableRef.value?.initData();
}

defineExpose({
  refresh
});
</script>

<style scoped></style>
