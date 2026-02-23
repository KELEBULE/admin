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
        :search-params="searchParams"
        method="get"
        row-key="orderId"
      >
        <template #actions>
          <NButton type="primary" @click="handleAdd">{{ $t('page.workorder.addWorkOrder') }}</NButton>
          <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">
            {{ $t('common.batchDelete') }}
          </NButton>
        </template>
      </CommonTable>
      <EditDrawer v-model:visible="showEdit" :row="editRow" :operate-type="operateType" @submitted="handleSubmitted" />
      <DetailDrawer v-model:visible="showDetail" :row="detailRow" @flow="handleFlow" />
      <FlowDrawer v-model:visible="showFlow" :row="flowRow" :flow-type="flowType" @submitted="handleSubmitted" />
    </NFlex>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchDeleteWorkOrder } from '@/service/api/workorder';
import { $t } from '@/locales';
import EditDrawer from './components/edit-drawer.vue';
import DetailDrawer from './components/detail-drawer.vue';
import FlowDrawer from './components/flow-drawer.vue';

defineOptions({
  name: 'WorkOrderCenterPage'
});
const searchParams = ref({
  page: 1,
  pageSize: 10
});
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/device_work_order/page');

const showEdit = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const editRow = ref<any>({});

const showDetail = ref(false);
const detailRow = ref<any>({});

const showFlow = ref(false);
const flowRow = ref<any>({});
const flowType = ref<'start' | 'complete' | 'review' | 'cancel' | 'assign' | 'evaluate'>('start');

const fieldList = ref([
  {
    label: $t('page.workorder.orderCode'),
    value: 'orderCode',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.workorder.orderType'),
    value: 'orderType',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.workorder.orderTypes.repair'), value: 1 },
        { label: $t('page.workorder.orderTypes.maintenance'), value: 2 },
        { label: $t('page.workorder.orderTypes.inspection'), value: 3 },
        { label: $t('page.workorder.orderTypes.calibration'), value: 4 }
      ]
    }
  },
  {
    label: $t('page.workorder.orderStatus'),
    value: 'orderStatus',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.workorder.orderStatuses.pending'), value: 0 },
        { label: $t('page.workorder.orderStatuses.processing'), value: 1 },
        { label: $t('page.workorder.orderStatuses.reviewing'), value: 2 },
        { label: $t('page.workorder.orderStatuses.completed'), value: 3 },
        { label: $t('page.workorder.orderStatuses.cancelled'), value: 4 }
      ]
    }
  },
  {
    label: $t('page.workorder.priority'),
    value: 'priority',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.workorder.priorities.urgent'), value: 1 },
        { label: $t('page.workorder.priorities.high'), value: 2 },
        { label: $t('page.workorder.priorities.medium'), value: 3 },
        { label: $t('page.workorder.priorities.low'), value: 4 }
      ]
    }
  }
]);

function formatTime(time: string | number | null): string {
  if (!time) return '-';
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-';
}

function getOrderTypeText(type: number): string {
  const typeMap: Record<number, string> = {
    1: $t('page.workorder.orderTypes.repair'),
    2: $t('page.workorder.orderTypes.maintenance'),
    3: $t('page.workorder.orderTypes.inspection'),
    4: $t('page.workorder.orderTypes.calibration')
  };
  return typeMap[type] || '-';
}

function getOrderStatusTag(status: number): { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string } {
  const statusMap: Record<number, { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string }> = {
    0: { type: 'default', text: $t('page.workorder.orderStatuses.pending') },
    1: { type: 'info', text: $t('page.workorder.orderStatuses.processing') },
    2: { type: 'warning', text: $t('page.workorder.orderStatuses.reviewing') },
    3: { type: 'success', text: $t('page.workorder.orderStatuses.completed') },
    4: { type: 'error', text: $t('page.workorder.orderStatuses.cancelled') }
  };
  return statusMap[status] || { type: 'default', text: '-' };
}

function getPriorityTag(priority: number): { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string } {
  const priorityMap: Record<number, { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string }> = {
    1: { type: 'error', text: $t('page.workorder.priorities.urgent') },
    2: { type: 'warning', text: $t('page.workorder.priorities.high') },
    3: { type: 'info', text: $t('page.workorder.priorities.medium') },
    4: { type: 'default', text: $t('page.workorder.priorities.low') }
  };
  return priorityMap[priority] || { type: 'default', text: '-' };
}

const columns = ref<DataTableColumn[]>([
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    key: 'orderCode',
    title: $t('page.workorder.orderCode'),
    width: 160,
    align: 'center'
  },
  {
    key: 'orderType',
    title: $t('page.workorder.orderType'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{getOrderTypeText(row.orderType)}</span>
  },
  {
    key: 'orderStatus',
    title: $t('page.workorder.orderStatus'),
    width: 100,
    align: 'center',
    render: (row: any) => {
      const status = getOrderStatusTag(row.orderStatus);
      return <NTag type={status.type}>{status.text}</NTag>;
    }
  },
  {
    key: 'priority',
    title: $t('page.workorder.priority'),
    width: 80,
    align: 'center',
    render: (row: any) => {
      const priority = getPriorityTag(row.priority);
      return <NTag type={priority.type}>{priority.text}</NTag>;
    }
  },
  {
    key: 'deviceName',
    title: $t('page.workorder.deviceName'),
    width: 150,
    align: 'center',
    render: (row: any) => <span>{row.deviceName || row.deviceCode || '-'}</span>
  },
  {
    key: 'faultDescription',
    title: $t('page.workorder.faultDescription'),
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render: (row: any) => <span>{row.faultDescription || '-'}</span>
  },
  {
    key: 'assigneeName',
    title: $t('page.workorder.assigneeName'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{row.assigneeName || '-'}</span>
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
    width: 320,
    align: 'center',
    fixed: 'right',
    render: (row: any) => {
      const actions: any[] = [];

      actions.push(
        <NButton type="info" text size="small" onClick={() => handleDetail(row)}>
          {$t('page.workorder.viewDetail')}
        </NButton>
      );

      if (row.orderStatus === 0) {
        actions.push(
          <NButton type="primary" text size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </NButton>
        );
        actions.push(
          <NButton type="info" text size="small" onClick={() => handleFlowAction(row, 'assign')}>
            {$t('page.workorder.assignHandler')}
          </NButton>
        );
        actions.push(
          <NButton type="primary" text size="small" onClick={() => handleFlowAction(row, 'start')}>
            {$t('page.workorder.startProcess')}
          </NButton>
        );
      }

      if (row.orderStatus === 1) {
        actions.push(
          <NButton type="success" text size="small" onClick={() => handleFlowAction(row, 'complete')}>
            {$t('page.workorder.completeProcess')}
          </NButton>
        );
      }

      if (row.orderStatus === 2) {
        actions.push(
          <NButton type="success" text size="small" onClick={() => handleFlowAction(row, 'review')}>
            {$t('page.workorder.passReview')}
          </NButton>
        );
      }

      if (row.orderStatus === 3 && !row.evaluationScore) {
        actions.push(
          <NButton type="warning" text size="small" onClick={() => handleFlowAction(row, 'evaluate')}>
            {$t('page.workorder.evaluate')}
          </NButton>
        );
      }

      if (row.orderStatus === 0 || row.orderStatus === 1) {
        actions.push(
          <NButton type="error" text size="small" onClick={() => handleFlowAction(row, 'cancel')}>
            {$t('page.workorder.cancelOrder')}
          </NButton>
        );
      }

      if (row.orderStatus === 0) {
        actions.push(
          <NPopconfirm onPositiveClick={() => handleDelete(row.orderId)}>
            {{
              default: () => $t('page.workorder.confirmDelete'),
              trigger: () => (
                <NButton type="error" text size="small">
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        );
      }

      return <NSpace justify="end">{actions}</NSpace>;
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

function handleDetail(row: any) {
  detailRow.value = { ...row };
  showDetail.value = true;
}

function handleFlowAction(row: any, type: 'start' | 'complete' | 'review' | 'cancel' | 'assign' | 'evaluate') {
  flowRow.value = { ...row };
  flowType.value = type;
  showFlow.value = true;
}

function handleFlow(row: any, type: 'start' | 'complete' | 'review' | 'cancel' | 'assign' | 'evaluate') {
  showDetail.value = false;
  handleFlowAction(row, type);
}

async function handleDelete(id: number) {
  const { error, data: result } = await fetchDeleteWorkOrder({ ids: [String(id)] });
  if (!error && result) {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

async function handleBatchDelete() {
  window.$dialog?.warning({
    title: $t('common.confirmDelete'),
    content: $t('page.workorder.confirmBatchDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const ids = checkedRowKeys.value.map(key => String(key));
      const { error, data: result } = await fetchDeleteWorkOrder({ ids });
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
