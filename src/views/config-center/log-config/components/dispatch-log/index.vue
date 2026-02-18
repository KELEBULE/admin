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
        <NButton type="primary" @click="handleRefresh">
          <template #icon>
            <SvgIcon icon="ic:round-refresh" />
          </template>
          刷新
        </NButton>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="tsx">
import { h, ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NSpace, NText } from 'naive-ui';
import { useDict } from '@/hooks/business/dict';
import { formatDateTime } from '@/utils/date';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import CommonTable from '@/components/common/common-table/index.vue';

defineOptions({
  name: 'MonitorLogsScheduler'
});

const { dictTag } = useDict();

const tableRef = ref<InstanceType<typeof CommonTable>>();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableData = ref<Api.Monitor.SchedulerLog[]>([]);
const URL = '/mon_logs_scheduler/page';

const searchParams = ref<Api.Monitor.SchedulerLogSearchParams>({
  page: 1,
  pageSize: 20,
  jobName: null
});

const fieldList = [
  {
    key: 'jobName',
    label: $t('page.monitor.logs.scheduler.jobName'),
    type: 'input',
    placeholder: $t('page.monitor.logs.scheduler.jobName')
  }
];

const columns: DataTableColumn[] = [
  {
    key: 'index',
    title: $t('common.index'),
    width: 64,
    align: 'center'
  },
  {
    type: 'expand',
    expandable: () => true,
    renderExpand: (rowData: any) => {
      return h(NSpace, { vertical: true }, [
        h(NText, {}, () => `${$t('page.monitor.logs.scheduler.exceptionMessage')}: ${rowData.exceptionMessage}`),
        h(NText, {}, () => `${$t('page.monitor.logs.scheduler.line')}: ${rowData.line}`),
        h(NText, {}, () => `${$t('page.monitor.logs.scheduler.exceptionClass')}: ${rowData.exceptionClass}`),
        h(NText, {}, () => `${$t('page.monitor.logs.scheduler.stackTrace')}: ${rowData.stackTrace}`)
      ]);
    }
  },
  {
    key: 'createTime',
    title: $t('page.monitor.logs.scheduler.createTime'),
    align: 'center',
    minWidth: 200,
    width: 200,
    render: (row: any) => formatDateTime(row.createTime)
  },
  {
    key: 'status',
    title: $t('page.monitor.logs.scheduler.status'),
    align: 'center',
    minWidth: 100,
    render: (row: any) => dictTag('scheduler_execute_staus', row.status)
  },
  {
    key: 'useTime',
    title: $t('page.monitor.logs.scheduler.useTime'),
    align: 'center',
    width: 100
  },
  {
    key: 'jobName',
    title: $t('page.monitor.logs.scheduler.jobName'),
    align: 'center',
    minWidth: 140,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'jobGroup',
    title: $t('page.monitor.logs.scheduler.jobGroup'),
    align: 'center',
    minWidth: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'exceptionMessage',
    title: $t('page.monitor.logs.scheduler.exceptionMessage'),
    align: 'center',
    width: 250,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'exceptionClass',
    title: $t('page.monitor.logs.scheduler.exceptionClass'),
    align: 'center',
    width: 250,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'line',
    title: $t('page.monitor.logs.scheduler.line'),
    align: 'center',
    width: 100
  }
];

function handleRefresh() {
  tableRef.value?.initData();
}
</script>
