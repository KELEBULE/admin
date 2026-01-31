<template>
  <div class="rounded-10px p-10px h-full bg-#fff">
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
import { ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { useDict } from '@/hooks/business/dict';
import { formatDateTime } from '@/utils/date';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import CommonTable from '@/components/common/common-table/index.vue';

defineOptions({
  name: 'MonitorLogsLogin'
});

const { dictTag } = useDict();

const tableRef = ref<InstanceType<typeof CommonTable>>();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableData = ref<Api.Monitor.LoginLog[]>([]);
const URL = '/mon_logs_login/page';

const searchParams = ref<Api.Monitor.LoginLogSearchParams>({
  page: 1,
  pageSize: 20,
  userName: null,
  userRealName: null
});

const fieldList = [
  {
    key: 'userName',
    label: $t('page.monitor.logs.login.userName'),
    type: 'input',
    placeholder: $t('page.monitor.logs.login.userName')
  },
  {
    key: 'userRealName',
    label: $t('page.monitor.logs.login.userRealName'),
    type: 'input',
    placeholder: $t('page.monitor.logs.login.userRealName')
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
    key: 'userName',
    title: $t('page.monitor.logs.login.userName'),
    align: 'center',
    minWidth: 140
  },
  {
    key: 'userRealName',
    title: $t('page.monitor.logs.login.userRealName'),
    align: 'center',
    minWidth: 100
  },
  {
    key: 'status',
    title: $t('page.monitor.logs.login.status'),
    align: 'center',
    minWidth: 100,
    render: (row: any) => dictTag('login_status', row.status)
  },
  {
    key: 'ip',
    title: $t('page.monitor.logs.login.ip'),
    align: 'center',
    minWidth: 140
  },
  {
    key: 'ipAddr',
    title: $t('page.monitor.logs.login.ipAddr'),
    align: 'center',
    minWidth: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'userAgent',
    title: $t('page.monitor.logs.login.userAgent'),
    align: 'center',
    minWidth: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'message',
    title: $t('page.monitor.logs.login.message'),
    align: 'center',
    minWidth: 120,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'createUser',
    title: $t('page.monitor.logs.login.createUser'),
    align: 'center',
    minWidth: 120
  },
  {
    key: 'createTime',
    title: $t('page.monitor.logs.login.createTime'),
    align: 'center',
    width: 200,
    render: (row: any) => formatDateTime(row.createTime)
  }
];

function handleRefresh() {
  tableRef.value?.initData();
}
</script>
