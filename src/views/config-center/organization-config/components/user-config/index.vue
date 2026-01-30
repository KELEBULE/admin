<template>
  <div class="rounded-10px p-10px h-full bg-#fff">
    <NGrid :x-gap="8" :y-gap="8" item-responsive responsive="screen" cols="1 s:1 m:5 l:5 xl:5 2xl:5" class="h-full-hidden">
      <NGridItem span="1" class="h-full-hidden"><OrgUnitTree @select="handleSelect" /></NGridItem>
      <NGridItem span="4" class="h-full overflow-auto">
        <NFlex v-if="userItemVisible" class="rounded-10px p-10px h-full flex-col">
          <CommonTable
            ref="tableRef"
            v-model:checked-row-keys="checkedRowKeys"
            class="flex-1 w-full"
            :columns="columns"
            :url="URL"
            :search-field-list="fieldList"
            :search-params="searchParams"
            :before-initdata="beforeInitData"
            method="get"
          >
            <template #actions>
              <NButton type="primary" @click="handleAdd">新增</NButton>
              <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">删除</NButton>
            </template>
          </CommonTable>
          <UserEdit v-model:visible="showEdit" :row="editRow" :operate-type="operateType" @submitted="handleSubmitted"></UserEdit>
          <Responsibilities v-model:visible="showResponsibilities" :user-id="editingId" @submitted="handleSubmitted"></Responsibilities>
        </NFlex>
        <NCard v-else :bordered="false" size="small" class="h-full">
          <NEmpty :description="$t('page.manage.user.selectTreeIsEmptyTip')" class="h-full justify-center" />
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NDropdown, NPopconfirm, NSpace, useModal } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { fetchDeleteUser, fetchResetUserPassword } from '@/service/api/manage/user';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import { collectIdsFromItem } from './userShared';
import OrgUnitTree from './org-utils-tree.vue';
import UserEdit from './user-edit.vue';
import Responsibilities from './responsibilities.vue';

defineOptions({
  name: 'UserPage'
});

const { bool: userItemVisible } = useBoolean();

const { dictTag } = useDict();

const modal = useModal();

const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/sys_user/page');
const searchParams = ref({
  page: 1,
  pageSize: 10
});

const orgUnitsData = ref<Api.SystemManage.OrgUnitsTree>({
  id: '0',
  code: '',
  name: '',
  children: []
});

const showEdit = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const editRow = ref<any>({});
const showResponsibilities = ref(false);
const editingId = ref('');

const fieldList = ref([
  {
    label: $t('page.manage.user.userName'),
    value: 'userName',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.manage.user.realName'),
    value: 'realName',
    span: 6,
    component: 'n-input'
  },
  {
    label: $t('page.manage.user.email'),
    value: 'email',
    span: 6,
    component: 'n-input'
  }
]);
// 更多操作
const handleOp = async (row: any, type: string) => {
  editingId.value = row.id;
  switch (type) {
    case 'resetPwd':
      handleResetPassword(row.id);
      break;
    case 'responsibilities':
      handleResponsibilities(row.id);
      break;
    default:
      break;
  }
};
const columns = ref<DataTableColumn[]>([
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    key: 'userName',
    title: $t('page.manage.user.userName'),
    width: 120,
    align: 'center'
  },
  {
    key: 'realName',
    title: $t('page.manage.user.realName'),
    width: 120,
    align: 'center'
  },
  {
    key: 'gender',
    title: $t('page.manage.user.gender'),
    width: 80,
    align: 'center',
    render: (row: any) => dictTag('gender', row.gender)
  },
  {
    key: 'phone',
    title: $t('page.manage.user.phone'),
    width: 130,
    align: 'center'
  },
  {
    key: 'email',
    title: $t('page.manage.user.email'),
    width: 200,
    align: 'center'
  },
  {
    key: 'status',
    title: $t('page.manage.user.status'),
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
      const dropdownOptions = [
        {
          label: $t('page.manage.user.resetPwd'),
          key: 'resetPwd',
          onClick: () => handleResetPassword(row.id)
        },
        {
          label: $t('page.manage.user.responsibilities'),
          key: 'responsibilities',
          onClick: () => handleResponsibilities(row.id)
        }
      ];

      return (
        <NSpace justify="space-around">
          <NButton type="primary" text size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </NButton>
          <NDropdown options={dropdownOptions} show-arrow placement="bottom-end" onSelect={v => handleOp(row, v)}>
            {{
              default: () => (
                <NButton text type="primary" size="small">
                  更多
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

function beforeInitData(params: any) {
  const orgIds = collectIdsFromItem(orgUnitsData.value);
  return {
    ...params,
    orgIds
  };
}

function handleSelect(visible: boolean, item: Api.SystemManage.OrgUnitsTree) {
  userItemVisible.value = visible;
  orgUnitsData.value = item;
  if (visible) {
    tableRef.value?.initData();
  }
}

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

async function handleDelete(id: string) {
  const { error, data: result } = await fetchDeleteUser({ ids: [id] });
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
      const { error, data: result } = await fetchDeleteUser({ ids: checkedRowKeys.value.map(key => key.toString()) });
      if (!error && result) {
        window.$message?.success($t('common.deleteSuccess'));
        checkedRowKeys.value = [];
        tableRef.value?.initData();
      }
    }
  });
}

async function handleResetPassword(id: string) {
  modal.create({
    title: $t('page.manage.user.resetPwd'),
    content: $t('page.manage.user.confirmResetPwd'),
    preset: 'dialog',
    negativeText: $t('common.cancel'),
    positiveText: $t('common.confirm'),
    onPositiveClick: async () => {
      const { error, data: password } = await fetchResetUserPassword(id);
      if (!error) {
        modal.create({
          title: '',
          content: password,
          preset: 'dialog'
        });
      }
    }
  });
}

function handleResponsibilities(id: string) {
  editingId.value = id;
  showResponsibilities.value = true;
}

function handleSubmitted() {
  tableRef.value?.initData();
}
</script>

<style scoped></style>
