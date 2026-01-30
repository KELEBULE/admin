<template>
  <div>
    <h1>组织配置</h1>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { getAlarmList } from '@/service/api/alarm/index';

onMounted(() => {
  getAlarmList({
    pageNum: 1,
    pageSize: 10
  }).then(res => {
    console.log(res);
  });
});
</script>

<style scoped></style>
