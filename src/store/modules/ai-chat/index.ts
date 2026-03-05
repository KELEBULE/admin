import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getAuthorization } from '@/service/request/shared';
import { getServiceBaseURL } from '@/utils/service';
import { SetupStoreId } from '@/enum';

export interface ToolResult {
  toolName: string;
  success: boolean;
  data: any;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  files?: Array<{ name: string }>;
  toolResults?: ToolResult[];
  isToolCall?: boolean;
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
      content:
        '你好！我是设备管理AI助手，可以帮你查询和分析设备报警数据。例如：\n\n• 查询今天有哪些报警\n• 查看未确认的报警\n• 报警等级分布统计\n• 报警最多的设备排行\n\n有什么可以帮助你的吗？'
    }
  ]);

  function resetChat() {
    sessionId.value = '';
    messages.value = [
      {
        role: 'ai',
        content:
          '你好！我是设备管理AI助手，可以帮你查询和分析设备报警数据。例如：\n\n• 查询今天有哪些报警\n• 查看未确认的报警\n• 报警等级分布统计\n• 报警最多的设备排行\n\n有什么可以帮助你的吗？'
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
        content:
          '你好！我是设备管理AI助手，可以帮你查询和分析设备报警数据。例如：\n\n• 查询今天有哪些报警\n• 查看未确认的报警\n• 报警等级分布统计\n• 报警最多的设备排行\n\n有什么可以帮助你的吗？'
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
