<template>
  <div>
    <NModal v-model:show="visible" class="w-400px" preset="card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold">发布通知</span>
        </div>
      </template>
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
              minRows: 2,
              maxRows: 3
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
      <template #footer>
        <NSpace reverse>
          <NButton @click="visible = false">取消</NButton>
          <NButton type="primary" @click="handleSubmit">发布</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
// import dayjs from 'dayjs';
import type { FormRules } from 'naive-ui';
import { fetchAddNotice } from '@/service/api/manage/notice';
const visible = defineModel<boolean>('visible');

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
  category: '1',
  content: '',
  releaseTime: Date.now(),
  remark: '',
  status: '1',
  title: ''
});

const handleSubmit = () => {
  fetchAddNotice(formData.value).then(res => {
    if (res) {
      window.$message?.success('发布成功');
      formData.value = {
        id: '',
        category: '1',
        content: '',
        releaseTime: Date.now(),
        remark: '',
        status: '1',
        title: ''
      };
      visible.value = false;
    } else {
      window.$message?.error('发布失败');
    }
  });
};
</script>

<style scoped></style>
