<template>
  <div class="h-full flex">
    <div
      class="sidebar-wrapper flex-shrink-0 h-full bg-[rgba(0,0,0,0.02)] border-r-1 border-[rgba(0,0,0,0.06)] overflow-hidden"
      :class="{ 'sidebar-collapsed': collapsed }"
    >
      <div class="h-full w-240px flex flex-col">
        <div class="sidebar-header flex items-center justify-between px-12px border-b-1 border-[rgba(0,0,0,0.06)]">
          <NText class="text-16px font-bold">{{ $t('page.workbench.ai.historyTitle') }}</NText>
          <NButton text size="tiny" @click="handleNewChat">
            <template #icon>
              <SvgIcon icon="ic:outline-add" class="text-18px" />
            </template>
          </NButton>
        </div>
        <div class="flex-1 min-h-0 overflow-hidden">
          <NScrollbar class="h-full">
            <NSpin :show="loading">
              <NEmpty v-if="sessionList.length === 0" :description="$t('page.workbench.ai.noHistory')" class="mt-40px" />
              <div v-else class="p-8px">
                <div
                  v-for="session in sessionList"
                  :key="session.sessionId"
                  class="p-10px mb-4px rounded-6px cursor-pointer transition-all-0.2s hover:bg-[rgba(0,0,0,0.04)]"
                  :class="session.sessionId === currentSessionId ? 'bg-blue-100' : ''"
                  @click="handleSelectSession(session)"
                >
                  <NFlex justify="space-between" align="center">
                    <NFlex vertical :size="2" class="flex-1 min-w-0">
                      <NEllipsis :line-clamp="1" class="text-13px font-medium">
                        {{ session.title || $t('page.workbench.ai.newChat') }}
                      </NEllipsis>
                      <NText depth="3" class="text-11px">
                        {{ formatTime(session.lastActiveTime) }}
                      </NText>
                    </NFlex>
                    <NButton
                      text
                      size="tiny"
                      class="flex-shrink-0 ml-4px hover:opacity-100 transition-opacity"
                      @click.stop="handleDeleteSession(session.sessionId)"
                    >
                      <template #icon>
                        <SvgIcon icon="ic:outline-delete" class="text-14px" />
                      </template>
                    </NButton>
                  </NFlex>
                </div>
              </div>
            </NSpin>
          </NScrollbar>
        </div>
      </div>
    </div>
    <div class="flex-1 min-w-0 h-full flex flex-col">
      <div class="main-header flex items-center justify-between px-12px border-b-1 border-[rgba(0,0,0,0.06)]">
        <NFlex align="center" :size="8">
          <NButton quaternary size="small" @click="toggleSidebar">
            <template #icon>
              <SvgIcon :icon="collapsed ? 'ic:round-chevron-right' : 'ic:round-chevron-left'" class="text-18px" />
            </template>
          </NButton>
          <NText class="text-16px font-bold">智能助手</NText>
        </NFlex>
        <NTooltip trigger="hover">
          <template #trigger>
            <NButton type="primary" text size="small" @click="handleNewChat">
              <SvgIcon icon="ic:outline-add" class="h-full text-14px" />
            </NButton>
          </template>
          {{ $t('page.workbench.ai.newChat') }}
        </NTooltip>
      </div>
      <AiChatPanel ref="chatPanelRef" class="flex-1 min-h-0 ml-4px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { NButton, NEllipsis, NEmpty, NFlex, NScrollbar, NSpin, NText, NTooltip, useMessage } from 'naive-ui';
import dayjs from 'dayjs';
import { type AiSessionVO, deleteSessionCompletion, fetchSessionHistory, fetchSessionList } from '@/service/api/ai';
import { useAiChatStore } from '@/store/modules/ai-chat';
import SvgIcon from '@/components/custom/svg-icon.vue';
import AiChatPanel from '@/components/common/ai-chat-panel.vue';
import { $t } from '@/locales';

const chatPanelRef = ref<InstanceType<typeof AiChatPanel>>();
const aiChatStore = useAiChatStore();
const message = useMessage();

const collapsed = ref(true);
const sessionList = ref<AiSessionVO[]>([]);
const loading = ref(false);
const currentSessionId = ref('');

function toggleSidebar() {
  collapsed.value = !collapsed.value;
}

function formatTime(time: string | null): string {
  if (!time) return '-';
  const parsed = dayjs(time);
  const now = dayjs();
  const diff = now.diff(parsed, 'day');

  if (diff === 0) {
    return parsed.format('HH:mm');
  } else if (diff === 1) {
    return `${$t('page.workbench.ai.yesterday')} ${parsed.format('HH:mm')}`;
  } else if (diff < 7) {
    return $t('page.workbench.ai.daysAgo', { count: diff });
  }
  return parsed.format('MM-DD HH:mm');
}

async function loadSessionList() {
  loading.value = true;
  try {
    const { data, error } = await fetchSessionList();
    if (!error && data) {
      sessionList.value = data;
    }
  } catch (e) {
    console.error('加载会话列表失败', e);
  } finally {
    loading.value = false;
  }
}

async function handleDeleteSession(sessionId: string) {
  try {
    const { data, error } = await deleteSessionCompletion(sessionId);
    if (!error && data) {
      message.success($t('common.deleteSuccess'));
      sessionList.value = sessionList.value.filter(s => s.sessionId !== sessionId);
      if (sessionId === currentSessionId.value) {
        handleNewChat();
      }
    } else {
      message.error($t('common.deleteFailed'));
    }
  } catch (_error) {
    window.$message?.error(`删除会话失败,${_error}`);
  }
}

async function handleSelectSession(session: AiSessionVO) {
  currentSessionId.value = session.sessionId;
  try {
    const { data, error } = await fetchSessionHistory(session.sessionId);
    if (!error && data) {
      aiChatStore.loadSessionHistory(session.sessionId, data);
    }
  } catch (_error) {
    window.$message?.error(`加载会话历史失败,${_error}`);
  }
}

function handleNewChat() {
  currentSessionId.value = '';
  aiChatStore.resetChat();
  loadSessionList();
}

watch(
  () => aiChatStore.sessionId,
  (val, oldVal) => {
    currentSessionId.value = val || '';
    if (val && !oldVal) {
      loadSessionList();
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadSessionList();
});

defineExpose({
  chatPanelRef
});
</script>

<style scoped>
.sidebar-wrapper {
  width: 240px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-wrapper.sidebar-collapsed {
  width: 0px;
}

.sidebar-header,
.main-header {
  height: 48px;
}
</style>
