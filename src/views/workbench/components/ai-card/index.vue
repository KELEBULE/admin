<template>
  <div class="h-full flex flex-col">
    <NFlex class="items-center justify-between flex-shrink-0 mb-8px">
      <NText class="text-18px font-bold">智能助手</NText>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NFlex, NText, NTooltip } from 'naive-ui';
import { useAiChatStore } from '@/store/modules/ai-chat';
import SvgIcon from '@/components/custom/svg-icon.vue';
import AiChatPanel from '@/components/common/ai-chat-panel.vue';

const chatPanelRef = ref<InstanceType<typeof AiChatPanel>>();
const aiChatStore = useAiChatStore();

function handleNewChat() {
  aiChatStore.resetChat();
}

defineExpose({
  chatPanelRef
});
</script>
