<template>
  <NDrawer v-model:show="show" placement="right" :width="400" class="m-8px rounded-10px">
    <NDrawerContent closable>
      <template #header>编辑{{ NoticeCategoryMap[row?.category as NoticeCategory] }}</template>
      <NFlex>
        <NForm
          label-placement="left"
          label-width="auto"
          label-align="left"
          require-mark-placement="right-hanging"
          size="small"
          :rules="rules"
          :model="formData"
        >
          <NFormItem label="标题" path="title">
            <NInput v-model:value="formData.title" placeholder="请输入标题" clearable />
          </NFormItem>
          <NFormItem label="分类" path="category">
            <NSelect v-model:value="formData.category" placeholder="请选择分类" :options="categoryOptions"></NSelect>
          </NFormItem>
          <NFormItem label="内容" path="content" clearable>
            <NInput
              v-model:value="formData.content"
              placeholder="请输入内容"
              type="textarea"
              :autosize="{
                minRows: 3,
                maxRows: 8
              }"
            />
          </NFormItem>
          <NFormItem label="状态" path="status" clearable>
            <NSelect v-model:value="formData.status" placeholder="请选择状态" :options="statusOptions"></NSelect>
          </NFormItem>
          <NFormItem label="备注" path="remark" clearable>
            <NInput v-model:value="formData.remark" placeholder="请输入备注" />
          </NFormItem>
          <NFormItem label="时间" path="releaseTime" clearable>
            <NDatePicker v-model:value="formData.releaseTime" type="datetime" placeholder="请选择发布时间" :default-value="Date.now()" />
          </NFormItem>
        </NForm>
      </NFlex>
      <template #footer>
        <NSpace reverse>
          <NButton @click="show = false">取消</NButton>
          <NButton type="primary" @click="handleSubmit">保存</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormRules } from 'naive-ui';
import { fetchUpdateNoticeInfo } from '@/service/api/manage/notice';
import type { NoticeCategory } from '@/enum/index';
import { NoticeCategoryMap } from '@/enum/index';
const props = defineProps<{
  row: any;
}>();
const show = defineModel('visible', { type: Boolean, default: false });
interface Request {
  id: string;
  category: string;
  content: string;
  releaseTime: number;
  remark: string;
  status: string;
  title: string;
  [property: string]: any;
}
const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 20, message: '标题长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 2, max: 100, message: '内容长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  releaseTime: [{ required: true, message: '请选择发布时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};
const statusOptions = [
  {
    label: '启用',
    value: '1'
  },
  {
    label: '禁用',
    value: '0'
  }
];
const categoryOptions = [
  {
    label: '通知',
    value: '1'
  },
  {
    label: '公告',
    value: '2'
  }
];
const formData = ref<Request>({
  id: '',
  category: '',
  content: '',
  releaseTime: 0,
  remark: '',
  status: '',
  title: ''
});

// 监听 row 变化，更新 formData
watch(
  () => props.row,
  newRow => {
    if (newRow) {
      formData.value = {
        id: newRow.id,
        category: newRow.category,
        content: newRow.content,
        releaseTime: newRow.releaseTime,
        remark: newRow.remark,
        status: newRow.status,
        title: newRow.title
      };
    }
  },
  { deep: true }
);

const handleSubmit = () => {
  fetchUpdateNoticeInfo(formData.value).then(res => {
    if (res) {
      window.$message?.success('发布成功');
      show.value = false;
    } else {
      window.$message?.error('发布失败');
    }
  });
};
</script>

<style scoped></style>
