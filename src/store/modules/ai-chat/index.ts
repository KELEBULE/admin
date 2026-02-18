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

  async function resetChat() {
    if (sessionId.value) {
      try {
        await fetch(`${baseURL}/ai_chat/session/${sessionId.value}`, {
          method: 'DELETE',
          headers: {
            Authorization: getAuthorization() || ''
          }
        });
      } catch (error) {
        console.error('清除会话失败', error);
      }
    }

    sessionId.value = '';
    messages.value = [
      {
        role: 'ai',
        content: '你好！我是你的 AI 助手，有什么可以帮助你的吗？'
      }
    ];
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

  return {
    sessionId,
    messages,
    resetChat,
    addMessage,
    updateMessage,
    setSessionId
  };
});
