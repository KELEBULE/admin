<template>
  <div v-if="isWorkbench()">
    <NDropdown
      :key="`${position.x}-${position.y}`"
      v-model:show="dropdownVisible"
      trigger="click"
      :show-arrow="true"
      :options="options"
      placement="left"
    >
      <NButton
        circle
        class="w-50px h-50px absolute z-999 cursor-pointer"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
        @mousedown="startDrag"
        @click="handleClick"
      >
        AI助手
      </NButton>
    </NDropdown>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NAvatar, NInput, NText } from 'naive-ui';
const route = useRoute();

const isWorkbench = () => {
  if (route.path.includes('/workbench') || route.path.includes('/login/')) {
    return false;
  }
  return true;
};

const position = ref({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const hasMoved = ref(false);
const startPos = ref({ x: 0, y: 0 });
const dropdownVisible = ref(false);
let dragAnimationFrame: number | null = null;

function startDrag(e: MouseEvent) {
  isDragging.value = true;
  hasMoved.value = false;
  startPos.value = { x: e.clientX, y: e.clientY };
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  };
  dropdownVisible.value = false;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value) return;

  const moveThreshold = 5;
  const deltaX = Math.abs(e.clientX - startPos.value.x);
  const deltaY = Math.abs(e.clientY - startPos.value.y);

  if (deltaX > moveThreshold || deltaY > moveThreshold) {
    hasMoved.value = true;
  }

  if (dragAnimationFrame !== null) {
    cancelAnimationFrame(dragAnimationFrame);
  }

  dragAnimationFrame = requestAnimationFrame(() => {
    let newX = e.clientX - dragOffset.value.x;
    let newY = e.clientY - dragOffset.value.y;

    const maxX = window.innerWidth - 50;
    const maxY = window.innerHeight - 50;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    position.value = { x: newX, y: newY };
    dragAnimationFrame = null;
  });
}

function stopDrag() {
  isDragging.value = false;
  if (dragAnimationFrame !== null) {
    cancelAnimationFrame(dragAnimationFrame);
    dragAnimationFrame = null;
  }
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function handleClick(e: MouseEvent) {
  if (hasMoved.value) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function renderCustomHeader() {
  return h(
    'div',
    {
      style: 'display: flex; align-items: center; padding: 8px 12px; width: 400px;'
    },
    [
      h(NAvatar, {
        round: true,
        style: 'margin-right: 12px;',
        src: 'https://07akioni.oss-cn-beijing.aliyuncs.com/demo1.JPG'
      }),
      h('div', null, [
        h('div', null, [h(NText, { depth: 2 }, { default: () => '打工仔' })]),
        h('div', { style: 'font-size: 12px;' }, [h(NText, { depth: 3 }, { default: () => '毫无疑问，你是办公室里最亮的星' })]),
        h('div', { style: 'font-size: 12px;' }, [h(NInput, { depth: 3 })])
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

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped></style>
