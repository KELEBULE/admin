import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getAuthorization } from '@/service/request/shared';
import { getServiceBaseURL } from '@/utils/service';
import { SetupStoreId } from '@/enum';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  files?: Array<{ name: string }>;
}

export interface AiChatHistoryVO {
  id: number;
  sessionId: string;
  role: string;
  content: string;
  tokensUsed?: number;
  processingTime?: number;
  createTime: string;
}

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

export const useAiChatStore = defineStore(SetupStoreId.AiChat, () => {
  const sessionId = ref('');
  const messages = ref<ChatMessage[]>([
    {
      role: 'ai',
      content: '你好！我是你的 AI 助手，有什么可以帮助你的吗？'
    }
  ]);

  function resetChat() {
    sessionId.value = '';
    messages.value = [
      {
        role: 'ai',
        content: '你好！我是你的 AI 助手，有什么可以帮助你的吗？'
      }
    ];
  }

  async function deleteSession(id: string) {
    try {
      await fetch(`${baseURL}/ai_chat/session/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: getAuthorization() || ''
        }
      });
    } catch (error) {
      console.error('删除会话失败', error);
    }
  }

  function addMessage(message: ChatMessage) {
    messages.value.push(message);
  }

  function updateMessage(index: number, message: ChatMessage) {
    messages.value[index] = message;
  }

  function setSessionId(id: string) {
    sessionId.value = id;
  }

  function loadSessionHistory(id: string, history: AiChatHistoryVO[]) {
    sessionId.value = id;
    messages.value = [];

    if (history && history.length > 0) {
      history.forEach(item => {
        messages.value.push({
          role: item.role === 'assistant' ? 'ai' : 'user',
          content: item.content
        });
      });
    } else {
      messages.value.push({
        role: 'ai',
        content: '你好！我是你的 AI 助手，有什么可以帮助你的吗？'
      });
    }
  }

  return {
    sessionId,
    messages,
    resetChat,
    deleteSession,
    addMessage,
    updateMessage,
    setSessionId,
    loadSessionHistory
  };
});
