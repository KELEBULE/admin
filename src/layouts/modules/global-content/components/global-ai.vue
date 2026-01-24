<template>
  <div v-if="isWorkbench()">
    <NDropdown trigger="click" :show-arrow="true" :options="options" placement="left">
      <NButton circle class="w-50px h-50px absolute bottom-30px right-30px z-999">AI助手</NButton>
    </NDropdown>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NAvatar, NText } from 'naive-ui';
const route = useRoute();

const isWorkbench = () => {
  if (route.path === '/workbench') {
    return false;
  }
  return true;
};

function renderCustomHeader() {
  return h(
    'div',
    {
      style: 'display: flex; align-items: center; padding: 8px 12px; width: 400px; height: 200px;'
    },
    [
      h(NAvatar, {
        round: true,
        style: 'margin-right: 12px;',
        src: 'https://07akioni.oss-cn-beijing.aliyuncs.com/demo1.JPG'
      }),
      h('div', null, [
        h('div', null, [h(NText, { depth: 2 }, { default: () => '打工仔' })]),
        h('div', { style: 'font-size: 12px;' }, [h(NText, { depth: 3 }, { default: () => '毫无疑问，你是办公室里最亮的星' })])
      ])
    ]
  );
}
const options = ref([
  {
    key: 'custom-header',
    type: 'render',
    render: renderCustomHeader
  }
]);

onMounted(() => {
  isWorkbench();
});
</script>

<style scoped></style>
