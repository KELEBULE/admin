<template>
  <NCard class="w-full h-full bg-black">
    <CommonTable ref="commonTable" :url="url" :columns="columns" :search-field-list="fieldList" />
  </NCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const url = '';
const commonTable = ref();
const fieldList = ref([
  {
    label: '工单编号',
    value: 'workorderNo',
    span: 6,
    component: 'n-input'
  },
  {
    label: '工单类型',
    value: 'workorderType',
    span: 6
  },
  {
    label: '工单状态',
    value: 'workorderStatus',
    span: 6
  },
  {
    label: '工单标题',
    value: 'workorderTitle',
    span: 6
  },
  {
    label: '工单内容',
    value: 'workorderContent',
    span: 6
  },
  {
    label: '工单创建时间',
    value: 'workorderCreateTime',
    span: 6
  },
  {
    label: '工单更新时间',
    value: 'workorderUpdateTime',
    span: 6
  }
]);
const columns = [
  {
    title: '工单编号',
    key: 'workorderNo',
    width: 100
  }
];
</script>

<style scoped></style>
