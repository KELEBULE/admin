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
import { formatDateTime } from '@/utils/date';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import CommonTable from '@/components/common/common-table/index.vue';

defineOptions({
  name: 'MonitorLogsOperation'
});

const tableRef = ref<InstanceType<typeof CommonTable>>();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableData = ref<Api.Monitor.OperationLog[]>([]);
const URL = '/mon_logs_operation/page';

const searchParams = ref<Api.Monitor.OperationLogSearchParams>({
  page: 1,
  pageSize: 20,
  createUser: null
});

const fieldList = [
  {
    key: 'createUser',
    label: $t('page.monitor.logs.operation.createUser'),
    type: 'input',
    placeholder: $t('page.monitor.logs.operation.createUser')
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
        h(NText, {}, () => `${$t('page.monitor.logs.operation.ip')}: ${rowData.ip}`),
        h(NText, {}, () => `${$t('page.monitor.logs.operation.ipAddr')}: ${rowData.ipAddr}`),
        h(NText, {}, () => `${$t('page.monitor.logs.operation.requestId')}: ${rowData.requestId}`),
        h(NText, {}, () => `${$t('page.monitor.logs.operation.userAgent')}: ${rowData.userAgent}`),
        h(NText, {}, () => `${$t('page.monitor.logs.operation.requestUri')}: ${rowData.requestUri}`),
        h(NText, {}, () => `${$t('page.monitor.logs.operation.contentType')}: ${rowData.contentType}`),
        h(NText, {}, () => `${$t('page.monitor.logs.operation.methodParams')}: ${rowData.methodParams}`)
      ]);
    }
  },
  {
    key: 'createUser',
    title: $t('page.monitor.logs.operation.createUser'),
    align: 'center',
    width: 140
  },
  {
    key: 'createTime',
    title: $t('page.monitor.logs.operation.createTime'),
    align: 'center',
    width: 200,
    render: (row: any) => formatDateTime(row.createTime)
  },
  {
    key: 'ip',
    title: $t('page.monitor.logs.operation.ip'),
    align: 'center',
    width: 140
  },
  {
    key: 'ipAddr',
    title: $t('page.monitor.logs.operation.ipAddr'),
    align: 'center',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'requestUri',
    title: $t('page.monitor.logs.operation.requestUri'),
    align: 'center',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'requestMethod',
    title: $t('page.monitor.logs.operation.requestMethod'),
    align: 'center',
    width: 80
  },
  {
    key: 'methodName',
    title: $t('page.monitor.logs.operation.methodName'),
    align: 'center',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'operation',
    title: $t('page.monitor.logs.operation.operation'),
    align: 'center',
    width: 250,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'useTime',
    title: $t('page.monitor.logs.operation.useTime'),
    align: 'center',
    width: 100
  }
];

function handleRefresh() {
  tableRef.value?.initData();
}
</script>
