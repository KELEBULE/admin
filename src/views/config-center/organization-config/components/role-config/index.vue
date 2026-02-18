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
        <NButton @click="exportData">导出</NButton>
      </template>
    </CommonTable>
    <RoleOperateDrawer v-model:visible="showEdit" :operate-type="operateType" :row-data="editRow" @submitted="handleSubmitted"></RoleOperateDrawer>
    <MenuAuthModal v-model:visible="showMenuAuth" :role-id="editingId" />
    <ButtonAuthModal v-model:visible="showButtonAuth" :role-id="editingId" />
    <DataScopeAuthModal v-model:visible="showDataScopeAuth" :role-id="editingId" :role-name="editRow?.roleName || ''" />
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NDropdown, NPopconfirm, NSpace } from 'naive-ui';
import { fetchDeleteRole, fetchExportRoleData } from '@/service/api/manage/role';
import { useDict } from '@/hooks/business/dict';
// import { useAuth } from '@/hooks/business/auth';
import { transDeleteParams } from '@/utils/common';
import { downloadBlob } from '@/utils/download';
import { $t } from '@/locales';
import RoleOperateDrawer from './role-operate-drawer.vue';
import MenuAuthModal from './menu-auth-modal.vue';
import ButtonAuthModal from './button-auth-modal.vue';
import DataScopeAuthModal from './data-scope-auth-modal.vue';

defineOptions({
  name: 'RolePage'
});

const { dictTag } = useDict();

// const { hasAuth } = useAuth();

const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/sys_role/page');
const searchParams = ref({
  page: 1,
  pageSize: 10
});

const showEdit = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const editRow = ref<any>({});
const showMenuAuth = ref(false);
const showButtonAuth = ref(false);
const showDataScopeAuth = ref(false);
const editingId = ref('');

const fieldList = ref([
  {
    label: $t('page.manage.role.roleName'),
    value: 'roleName',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.manage.role.roleCode'),
    value: 'roleCode',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.manage.role.status'),
    value: 'status',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' }
      ]
    }
  }
]);

type OperationKey = 'edit' | 'menuAuth' | 'buttonAuth' | 'dataScopeAuth';

const operationOptions = [
  {
    key: 'menuAuth',
    label: $t('page.manage.role.menuAuth'),
    handler: (id: string) => handleMenuAuth(id)
  },
  {
    key: 'buttonAuth',
    label: $t('page.manage.role.buttonAuth'),
    handler: (id: string) => handleButtonAuth(id)
  },
  {
    key: 'dataScopeAuth',
    label: $t('page.manage.role.dataScopeAuth'),
    handler: (id: string) => handleDataScopeAuth(id)
  }
];

const columns = ref<DataTableColumn[]>([
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    key: 'roleName',
    title: $t('page.manage.role.roleName'),
    width: 150,
    align: 'center'
  },
  {
    key: 'roleCode',
    title: $t('page.manage.role.roleCode'),
    width: 120,
    align: 'center'
  },
  {
    key: 'description',
    title: $t('page.manage.role.description'),
    width: 200,
    align: 'center'
  },
  {
    key: 'status',
    title: $t('page.manage.role.status'),
    width: 100,
    align: 'center',
    render: (row: any) => dictTag('status', row.status)
  },
  {
    key: 'sort',
    title: $t('page.manage.role.sort'),
    width: 80,
    align: 'center'
  },
  {
    key: 'action',
    title: $t('common.operate'),
    width: 80,
    align: 'center',
    fixed: 'right',
    render: (row: any) => {
      return (
        <NSpace justify="space-around">
          <NButton type="primary" text size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </NButton>
          <NDropdown options={operationOptions} onSelect={(key: OperationKey) => handleSelect(key, row.id)} show-arrow placement="bottom-end">
            {{
              default: () => (
                <NButton text type="primary" size="small">
                  {$t('common.operate')}
                </NButton>
              )
            }}
          </NDropdown>
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

function handleSelect(key: OperationKey, id: string) {
  editingId.value = id;
  if (key === 'menuAuth') {
    showMenuAuth.value = true;
  } else if (key === 'buttonAuth') {
    showButtonAuth.value = true;
  } else if (key === 'dataScopeAuth') {
    showDataScopeAuth.value = true;
  }
}

async function handleDelete(id: string) {
  const { error, data: result } = await fetchDeleteRole(transDeleteParams([id]));
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
      const { error, data: result } = await fetchDeleteRole(transDeleteParams(checkedRowKeys.value.map(key => key.toString())));
      if (!error && result) {
        window.$message?.success($t('common.deleteSuccess'));
        checkedRowKeys.value = [];
        tableRef.value?.initData();
      }
    }
  });
}

async function exportData() {
  const { error, response } = await fetchExportRoleData();
  if (!error && response) {
    downloadBlob(response);
  }
}

function handleMenuAuth(id: string) {
  editingId.value = id;
  showMenuAuth.value = true;
}

function handleButtonAuth(id: string) {
  editingId.value = id;
  showButtonAuth.value = true;
}

function handleDataScopeAuth(id: string) {
  editingId.value = id;
  showDataScopeAuth.value = true;
}

function handleSubmitted() {
  tableRef.value?.initData();
}
</script>

<style scoped></style>
