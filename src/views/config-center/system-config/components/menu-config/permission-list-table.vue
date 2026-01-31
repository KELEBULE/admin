<template>
  <div class="flex flex-grow">
    <NCard v-if="showData.type === '2'" :title="$t('page.manage.permission.title')" :bordered="false" size="small">
      <template #header-extra>
        <NButton type="primary" ghost size="small" @click="handleAddButton()">
          {{ $t('common.add') }}
        </NButton>
      </template>
      <CommonTable
        ref="tableRef"
        v-model:checked-row-keys="checkedRowKeys"
        v-model:table-data="tableData"
        class="sm:h-full"
        :columns="columns"
        :url="URL"
        :search-params="searchParams"
        :before-initdata="beforeInitData"
        method="get"
        :show-column-setting="false"
      />
    </NCard>
    <NCard v-else :bordered="false" size="small">
      <NEmpty :description="$t('page.manage.menu.menuTypeIsDirectory')" class="h-full justify-center" />
    </NCard>
    <PermissionOperateModal
      v-model:visible="modalVisible"
      :operate-type="operateType"
      :menu-data="showData"
      :row-data="editingData"
      @submitted="handleSubmitted"
    />
    <PermissionDataRulesModal v-model:visible="dataRulesModalVisible" :menu-data="showData" :permission-data="editingData" />
  </div>
</template>

<script setup lang="tsx">
import { h, ref, watch } from 'vue';
import type { DataTableColumn } from 'naive-ui';
import { NButton, NPopconfirm } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { fetchDeletePermission } from '@/service/api';
// import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import { transDeleteParams } from '@/utils/common';
import { $t } from '@/locales';
import CommonTable from '@/components/common/common-table/index.vue';
import PermissionOperateModal from './permission-operate-modal.vue';
import PermissionDataRulesModal from './permission-data-rules-modal.vue';

defineOptions({
  name: 'PermissionListTable'
});

interface Props {
  showData: Api.SystemManage.MenuTreeData;
}

const props = defineProps<Props>();

const { dictTag } = useDict();

const { bool: modalVisible, setTrue: openModalVisible } = useBoolean();
const { bool: dataRulesModalVisible, setTrue: openDataRulesModalVisible } = useBoolean();

const tableRef = ref<InstanceType<typeof CommonTable>>();
const checkedRowKeys = ref<string[]>([]);
const operateType = ref<NaiveUI.TableOperateType>('add');
const editingData = ref<Api.SystemManage.Permission | null>(null);
const tableData = ref<Api.SystemManage.Permission[]>([]);

const URL = '/sys_permission/page';

const searchParams = ref<Api.SystemManage.PermissionSearchParams>({
  page: 1,
  pageSize: 20,
  menuId: props.showData.id,
  name: null
});

function beforeInitData(params: Api.SystemManage.PermissionSearchParams) {
  return {
    ...params,
    menuId: props.showData.id
  };
}

const columns: DataTableColumn[] = [
  {
    key: 'name',
    title: $t('page.manage.permission.name'),
    align: 'center',
    width: 150
  },
  {
    key: 'resource',
    title: $t('page.manage.permission.resource'),
    align: 'center',
    width: 200,
    ellipsis: true
  },
  {
    key: 'status',
    title: $t('page.manage.menu.status'),
    align: 'center',
    width: 50,
    render: (row: any) => dictTag('status', row.status)
  },
  {
    key: 'sort',
    title: $t('page.manage.permission.sort'),
    align: 'center',
    width: 50
  },
  {
    key: 'description',
    title: $t('page.manage.permission.description'),
    align: 'center',
    width: 120,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'operate',
    title: $t('common.operate'),
    align: 'center',
    width: 100,
    fixed: 'right',
    render: (row: any) =>
      h('div', { class: 'flex-center gap-8px' }, [
        h(
          NButton,
          {
            type: 'primary',
            quaternary: true,
            size: 'small',
            onClick: () => handleEditButton(row.id)
          },
          () => $t('common.edit')
        ),
        h(
          NButton,
          {
            type: 'warning',
            quaternary: true,
            size: 'small',
            onClick: () => handleDataRulesButton(row.id)
          },
          () => $t('page.manage.permission.dataRules')
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDeleteButton(row.id)
          },
          {
            default: () => $t('common.confirmDelete'),
            trigger: () =>
              h(
                NButton,
                {
                  type: 'error',
                  quaternary: true,
                  size: 'small'
                },
                () => $t('common.delete')
              )
          }
        )
      ])
  }
];

function handleAddButton() {
  operateType.value = 'add';
  editingData.value = null;
  openModalVisible();
}

async function handleEditButton(id: string) {
  operateType.value = 'edit';
  const data = tableData.value.find(item => item.id === id);
  editingData.value = data || null;
  openModalVisible();
}

function handleDataRulesButton(id: string) {
  const data = tableData.value.find(item => item.id === id);
  editingData.value = data || null;
  openDataRulesModalVisible();
}

async function handleDeleteButton(id: string) {
  const { error, data: result } = await fetchDeletePermission(transDeleteParams([id]));
  if (!error && result) {
    tableRef.value?.initData();
  }
}

function handleSubmitted() {
  tableRef.value?.initData();
}

watch(
  () => props.showData,
  () => {
    searchParams.value.menuId = props.showData.id;
    tableRef.value?.initData();
  }
);
</script>
