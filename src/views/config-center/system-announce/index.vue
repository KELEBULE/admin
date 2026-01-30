<template>
  <div>
    <NFlex class="rounded-10px p-10px h-full bg-#fff">
      <CommonTable
        ref="tableRef"
        v-model:checked-row-keys="checkedRowKeys"
        class="h-full w-full"
        :columns="columns"
        :url="URL"
        :search-field-list="fieldList"
        :search-params="searchParams"
      >
        <template #actions>
          <NButton type="primary" @click="showRelease = true">发布</NButton>
          <NButton type="error" :disabled="!checkedRowKeys.length" @click="deleteNotice">删除</NButton>
        </template>
      </CommonTable>
      <Release v-model:visible="showRelease"></Release>
      <Detail v-model:visible="showDetail" :row="detailRow"></Detail>
      <Edit v-model:visible="showEdit" :row="editRow"></Edit>
    </NFlex>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import type { DataTableColumn, DataTableRowKey } from 'naive-ui';
import { NButton, NSpace, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchDeleteNotice } from '@/service/api/manage/notice';
import { NoticeCategory, NoticeCategoryMap } from '@/enum/index';
import Release from './components/release.vue';
import Detail from './components/detail.vue';
import Edit from './components/edit.vue';
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const tableRef = ref<any>(null);
const URL = ref('/sys_notice/page');
const searchParams = ref({
  page: 1,
  pageSize: 10
});

const showDetail = ref(false);
const handleDetail = (row: any) => {
  showDetail.value = true;
  detailRow.value = row;
};

const showEdit = ref(false);
const handleEdit = (row: any) => {
  showEdit.value = true;
  editRow.value = row;
};
const editRow = ref<any>({});
const detailRow = ref<any>({});
const fieldList = ref([
  {
    label: '标题',
    value: 'title',
    span: 6,
    component: 'n-input'
  },
  {
    label: '类型',
    value: 'category',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        {
          label: '公告',
          value: 2
        },
        {
          label: '通知',
          value: 1
        }
      ]
    }
  },
  {
    label: '发布时间',
    value: 'timeRange',
    span: 6,
    component: 'n-date-picker',
    extraProps: {
      type: 'daterange',
      'value-format': 'yyyy-MM-dd HH:mm:ss',
      clearable: true
    }
  }
]);
const columns = ref<DataTableColumn[]>([
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    key: 'category',
    title: '类型',
    align: 'center',
    width: 60,
    render: (row: any) => {
      const typeMap: Record<string, any> = {
        [NoticeCategory.Announce]: 'primary',
        [NoticeCategory.Notice]: 'success'
      };
      const category = row.category as NoticeCategory;
      return <NTag type={typeMap[category]}>{NoticeCategoryMap[category]}</NTag>;
    }
  },
  {
    key: 'title',
    title: '标题',
    align: 'center',
    width: 500
  },
  // {
  //   key: 'content',
  //   title: '内容',
  //   width: 200,
  //   render: (row: any) => {
  //     return (
  //       <NEllipsis line-clamp="2" tooltip={false}>
  //         {row.content}
  //       </NEllipsis>
  //     );
  //   }
  // },
  {
    key: 'releaseTime',
    title: '发布时间',
    align: 'center',
    width: 200,
    render: (row: any) => {
      return dayjs(row.releaseTime).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  // {
  //   key: 'remark',
  //   title: '备注',
  //   width: 200,
  //   ellipsis: true
  // },
  // {
  //   key: 'status',
  //   title: '状态',
  //   width: 80,
  //   render: (row: any) => {
  //     const statusMap: Record<string, any> = {
  //       1: 'success',
  //       0: 'error'
  //     };
  //     const status = row.status as string;
  //     return <NTag type={statusMap[status]}>{status === '1' ? '启用' : '禁用'}</NTag>;
  //   }
  // },
  // {
  //   key: 'createUser',
  //   title: '创建人',
  //   width: 80
  // },
  // {
  //   key: 'createTime',
  //   title: '创建时间',
  //   width: 180,
  //   render: (row: any) => {
  //     return dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss');
  //   }
  // },
  {
    key: 'action',
    title: '操作',
    align: 'center',
    width: 60,
    render: (row: any) => {
      return (
        <NSpace justify="space-around">
          <NButton text type="primary" onClick={() => handleDetail(row)}>
            详情
          </NButton>
          <NButton text type="info" onClick={() => handleEdit(row)}>
            编辑
          </NButton>
        </NSpace>
      );
    }
  }
]);

// 发布
const showRelease = ref(false);

// 详情

// 删除
const deleteNotice = () => {
  window.$dialog?.warning({
    title: '确认删除',
    content: '确定删除选中的通知吗？',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    onPositiveClick: () => {
      // 确认删除
      fetchDeleteNotice({ ids: checkedRowKeys.value.map(key => key.toString()) }).then(() => {
        window.$message?.success('删除成功');
        checkedRowKeys.value = [];
      });
    }
  });
};
</script>
