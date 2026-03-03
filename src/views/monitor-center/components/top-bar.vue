<template>
  <div class="absolute top-26px left-50% w-500px transform-translate-x--50% z-1002">
    <NSpace class="w-full h-48px bg-white items-center rounded-30px" justify="space-around">
      <NCascader placeholder="请选择设备" clearable :bordered="false" class="w-180px"></NCascader>
      <NDatePicker type="daterange" placeholder="请选择日期" clearable :bordered="false" class="w-300px"></NDatePicker>
    </NSpace>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
