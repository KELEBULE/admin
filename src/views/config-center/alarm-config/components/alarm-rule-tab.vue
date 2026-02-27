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
      row-key="ruleId"
    >
      <template #actions>
        <NButton type="primary" @click="handleAdd">
          {{ $t('common.add') }}
        </NButton>
        <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">
          {{ $t('common.delete') }}
        </NButton>
      </template>
    </CommonTable>
    <AlarmRuleOperateModal v-model:visible="modalVisible" :operate-type="operateType" :row-data="editingData" @submitted="handleSubmitted" />
  </div>
</template>

<script setup lang="tsx">
import { h, ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { fetchDeleteAlarmRule } from '@/service/api/alarm';
import { useDict } from '@/hooks/business/dict';
import { transDeleteParams } from '@/utils/common';
import { $t } from '@/locales';
import CommonTable from '@/components/common/common-table/index.vue';
import AlarmRuleOperateModal from './alarm-rule-operate-modal.vue';

defineOptions({
  name: 'AlarmRuleTab'
});

const { dictTag, dictOptions } = useDict();

const tableRef = ref<InstanceType<typeof CommonTable>>();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableData = ref<Api.Alarm.AlarmRule[]>([]);
const URL = '/alarm_rule/page';

const searchParams = ref<Api.Alarm.AlarmRuleSearchParams>({
  page: 1,
  pageSize: 20,
  ruleName: null,
  ruleStatus: null
});

const fieldList = [
  {
    key: 'ruleName',
    label: $t('page.alarm.ruleName'),
    type: 'input',
    placeholder: $t('page.alarm.form.ruleName')
  },
  {
    key: 'ruleStatus',
    label: $t('page.alarm.ruleStatus'),
    type: 'select',
    placeholder: $t('page.alarm.form.ruleStatus'),
    options: dictOptions('status')
  }
];

const modalVisible = ref(false);
const operateType = ref<NaiveUI.TableOperateType>('add');
const editingData = ref<Api.Alarm.AlarmRule | null>(null);

const columns: DataTableColumn<any>[] = [
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    key: 'ruleCode',
    title: $t('page.alarm.ruleCode'),
    align: 'center',
    minWidth: 120,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'ruleName',
    title: $t('page.alarm.ruleName'),
    align: 'center',
    minWidth: 120
  },
  {
    key: 'deviceCount',
    title: $t('page.alarm.deviceCount'),
    align: 'center',
    minWidth: 80,
    render: row => {
      return Array.isArray(row.deviceIds) ? row.deviceIds.length : 0;
    }
  },
  {
    key: 'alarmLevels',
    title: $t('page.alarm.alarmLevels.title'),
    align: 'center',
    minWidth: 120,
    render: row => {
      if (!row.alarmLevels || !Array.isArray(row.alarmLevels)) return '-';
      const levelMap: Record<number, { label: string; type: 'default' | 'info' | 'warning' | 'error' | 'success' }> = {
        1: { label: $t('page.alarm.alarmLevels.level1'), type: 'error' },
        2: { label: $t('page.alarm.alarmLevels.level2'), type: 'warning' },
        3: { label: $t('page.alarm.alarmLevels.level3'), type: 'info' }
      };
      return h(NSpace, { size: 'small', justify: 'center' }, () =>
        row.alarmLevels
          .map((level: number) => {
            const item = levelMap[level];
            return item ? h(NTag, { type: item.type, size: 'small' }, { default: () => item.label }) : null;
          })
          .filter(Boolean)
      );
    }
  },
  {
    key: 'notifyTargetCount',
    title: $t('page.alarm.notifyTarget'),
    align: 'center',
    minWidth: 80,
    render: row => {
      return Array.isArray(row.notifyTargetIds) ? row.notifyTargetIds.length : 0;
    }
  },
  {
    key: 'ruleStatus',
    title: $t('page.alarm.ruleStatus'),
    align: 'center',
    minWidth: 80,
    render: row => dictTag('status', String(row.ruleStatus))
  },
  {
    key: 'action',
    title: $t('common.action'),
    align: 'center',
    width: 120,
    fixed: 'right',
    render: row => {
      return h(NSpace, { justify: 'center' }, () => [
        h(
          NButton,
          {
            size: 'small',
            text: true,
            type: 'primary',
            onClick: () => handleEdit(row)
          },
          { default: () => $t('common.edit') }
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.ruleId)
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  text: true,
                  type: 'error'
                },
                { default: () => $t('common.delete') }
              ),
            default: () => $t('common.confirmDelete')
          }
        )
      ]);
    }
  }
];

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  modalVisible.value = true;
}

function handleEdit(row: Api.Alarm.AlarmRule) {
  operateType.value = 'edit';
  editingData.value = row;
  modalVisible.value = true;
}

async function handleDelete(ruleId: number) {
  const { error, data } = await fetchDeleteAlarmRule(transDeleteParams([String(ruleId)]));
  if (!error && data) {
    window.$message?.success($t('common.deleteSuccess'));
    tableRef.value?.initData();
  }
}

async function handleBatchDelete() {
  const { error, data } = await fetchDeleteAlarmRule(transDeleteParams(checkedRowKeys.value as string[]));
  if (!error && data) {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

function handleSubmitted() {
  modalVisible.value = false;
  tableRef.value?.initData();
}

function refresh() {
  tableRef.value?.initData();
}

defineExpose({
  refresh
});
</script>

<style scoped></style>
