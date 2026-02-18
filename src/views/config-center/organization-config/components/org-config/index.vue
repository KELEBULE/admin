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
    >
      <template #actions>
        <NButton type="primary" @click="handleAdd">新增</NButton>
        <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">删除</NButton>
      </template>
    </CommonTable>
    <Edit v-model:visible="showEdit" :row="editRow" :operate-type="operateType" @submitted="handleSubmitted"></Edit>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NPopconfirm, NSpace } from 'naive-ui';
import { fetchDeleteOrgUnits } from '@/service/api/manage/org-units';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import Edit from './edit.vue';

defineOptions({
  name: 'OrgUnitsPage'
});

const { dictOptions, dictTag } = useDict();

const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/sys_org_units/page');
const searchParams = ref({
  page: 1,
  pageSize: 10
});

const showEdit = ref(false);
const operateType = ref<'add' | 'edit' | 'addChild'>('add');
const editRow = ref<any>({});

const fieldList = ref([
  {
    label: $t('page.manage.orgUnits.name'),
    value: 'name',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.manage.orgUnits.status'),
    value: 'status',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: dictOptions('status')
    }
  }
]);

const columns = ref<DataTableColumn[]>([
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
    key: 'name',
    title: $t('page.manage.orgUnits.name'),
    width: 150,
    align: 'center'
  },
  {
    key: 'code',
    title: $t('page.manage.orgUnits.code'),
    width: 100,
    align: 'center'
  },
  {
    key: 'abbr',
    title: $t('page.manage.orgUnits.abbr'),
    width: 100,
    align: 'center'
  },
  {
    key: 'description',
    title: $t('page.manage.orgUnits.description'),
    width: 120,
    align: 'center'
  },
  {
    key: 'sort',
    title: $t('page.manage.orgUnits.sort'),
    width: 80,
    align: 'center'
  },
  {
    key: 'status',
    title: $t('page.manage.orgUnits.status'),
    width: 80,
    align: 'center',
    render: (row: any) => dictTag('status', row.status)
  },
  {
    key: 'action',
    title: $t('common.operate'),
    width: 100,
    align: 'center',
    fixed: 'right',
    render: (row: any) => {
      return (
        <NSpace justify="space-around">
          <NButton type="primary" text size="small" onClick={() => handleAddChild(row)}>
            {$t('page.manage.orgUnits.addChildOrgUnits')}
          </NButton>
          <NButton type="info" text size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
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
  editRow.value = {};
  showEdit.value = true;
}

function handleEdit(row: any) {
  operateType.value = 'edit';
  editRow.value = { ...row };
  showEdit.value = true;
}

function handleAddChild(row: any) {
  operateType.value = 'addChild';
  editRow.value = { ...row };
  showEdit.value = true;
}

async function handleDelete(id: string) {
  const { error, data: result } = await fetchDeleteOrgUnits({ ids: [id] });
  if (!error && result) {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    tableRef.value?.initData();
  }
}

async function handleBatchDelete() {
  window.$dialog?.warning({
    title: $t('common.confirmDelete'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error, data: result } = await fetchDeleteOrgUnits({ ids: checkedRowKeys.value.map(key => key.toString()) });
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
