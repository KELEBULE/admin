<template>
  <div v-if="isWorkbench()">
    <NPopover
      v-model:show="popoverVisible"
      trigger="click"
      placement="left"
      :show-arrow="true"
      :width="400"
      :style="{ backdropFilter: 'blur(80px)', background: 'rgba(255, 255, 255, 0.10)' }"
    >
      <template #trigger>
        <NButton
          circle
          type="primary"
          class="w-45px h-45px absolute z-999 cursor-pointer"
          :style="{ left: position.x + 'px', top: position.y + 'px' }"
          @mousedown="startDrag"
          @click="handleClick"
        >
          <SvgIcon icon="material-symbols:robot-2-outline-rounded" class="text-40px" />
        </NButton>
      </template>

      <NFlex vertical class="max-h-500px min-h-500px" :size="8">
        <NFlex class="items-center justify-between">
          <NText>智能助手</NText>
          <NTooltip trigger="hover">
            <template #trigger>
              <NButton type="primary" text size="small" @click="handleNewChat">
                <SvgIcon icon="ic:outline-add" class="text-14px" />
              </NButton>
            </template>
            新建对话
          </NTooltip>
        </NFlex>
        <AiChatPanel ref="chatPanelRef" class="flex-1 min-h-0" />
      </NFlex>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NFlex, NPopover, NText, NTooltip } from 'naive-ui';
import { useAiChatStore } from '@/store/modules/ai-chat';
import SvgIcon from '@/components/custom/svg-icon.vue';
import AiChatPanel from '@/components/common/ai-chat-panel.vue';

const route = useRoute();
const aiChatStore = useAiChatStore();

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
const popoverVisible = ref(false);
let dragAnimationFrame: number | null = null;

const chatPanelRef = ref<InstanceType<typeof AiChatPanel>>();

function startDrag(e: MouseEvent) {
  isDragging.value = true;
  hasMoved.value = false;
  startPos.value = { x: e.clientX, y: e.clientY };
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  };
  popoverVisible.value = false;
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

function handleNewChat() {
  aiChatStore.resetChat();
}

onMounted(() => {
  isWorkbench();
});

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>
