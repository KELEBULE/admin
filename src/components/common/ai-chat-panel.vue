<template>
  <NFlex vertical :size="8" class="h-full flex flex-col">
    <div class="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
      <div
        v-for="(msg, index) in aiChatStore.messages"
        :key="index"
        class="flex mb-16px items-start"
        :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <div v-if="msg.role === 'ai'" class="flex-shrink-0 mx-8px">
          <SvgIcon icon="material-symbols:robot-2-outline-rounded" class="text-24px" />
        </div>
        <div
          class="max-w-70% px-14px py-10px rounded-12px shadow-sm"
          :class="msg.role === 'ai' ? 'bg-blue rounded-tl-4px' : 'bg-blue text-white rounded-tr-4px'"
        >
          <MarkdownRenderer v-if="msg.role === 'ai'" :content="msg.content" />
          <NText v-else>{{ msg.content }}</NText>
          <div v-if="msg.files && msg.files.length > 0" class="mt-8px">
            <div
              v-for="(file, fIndex) in msg.files"
              :key="fIndex"
              class="flex items-center gap-4px px-8px py-4px bg-[rgba(0,0,0,0.1)] rounded-4px mt-4px"
            >
              <SvgIcon icon="ic:outline-attach-file" class="text-14px" />
              <NText depth="3">{{ file.name }}</NText>
            </div>
          </div>
        </div>
        <div v-if="msg.role === 'user'" class="flex-shrink-0 mx-8px order-first">
          <SvgIcon icon="material-symbols:account-circle" class="text-25px" />
        </div>
      </div>
    </div>
    <NSpace justify="start" class="flex-shrink-0">
      <NTag
        v-for="(option, index) in quickOptions"
        :key="index"
        type="info"
        size="small"
        round
        class="cursor-pointer transition-all-0.2s hover:-translate-y-1px"
        @click="selectQuickOption(option)"
      >
        {{ option }}
      </NTag>
    </NSpace>

    <NFlex vertical :size="8" class="flex-shrink-0">
      <NFlex class="items-center">
        <NFlex class="items-center">
          <NUpload
            v-model:file-list="uploadFileList"
            class="w-20px h-20px"
            :show-file-list="false"
            accept="image/*,.pdf,.doc,.docx,.txt"
            text
            @change="handleFileChange"
          >
            <SvgIcon icon="ic:outline-attach-file" class="w-full h-full text-20px" />
          </NUpload>
          <NButton class="w-20px h-20px" text @click="toggleRecording">
            <SvgIcon :icon="isRecording ? 'ic:baseline-mic' : 'ic:outline-mic'" class="w-full h-full text-20px" />
          </NButton>
        </NFlex>
        <NFlex class="flex-1">
          <NInput v-model:value="inputValue" placeholder="输入消息..." @keydown="handleKeyDown" />
        </NFlex>
        <NButton circle type="primary" size="small" :disabled="!inputValue.trim() && uploadedFiles.length === 0" @click="sendMessage">
          <template #icon>
            <SvgIcon icon="ic:round-send" />
          </template>
        </NButton>
      </NFlex>
      <NSpace v-if="uploadedFiles.length > 0" justify="start">
        <div v-for="(file, index) in uploadedFiles" :key="index" class="flex items-center gap-4px rounded-4px overflow-x-auto">
          <NEllipsis class="text-12px w-50px">{{ file.name }}</NEllipsis>
          <NButton text size="tiny" @click="removeFile(index)">
            <template #icon>
              <SvgIcon icon="ic:outline-close" />
            </template>
          </NButton>
        </div>
      </NSpace>
    </NFlex>
  </NFlex>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NEllipsis, NInput, NTag, NText, NUpload, type UploadFileInfo, useMessage } from 'naive-ui';
import { getAuthorization } from '@/service/request/shared';
import { type ChatMessage, useAiChatStore } from '@/store/modules/ai-chat';
import { getServiceBaseURL } from '@/utils/service';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MarkdownRenderer from '@/components/common/markdown-renderer.vue';

const message = useMessage();
const aiChatStore = useAiChatStore();

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

const inputValue = ref('');
const quickOptions = ref(['帮我写个周报', '分析这个数据', '生成代码', '翻译这段文字']);
const isRecording = ref(false);
let recognitionInstance: any = null;
const uploadedFiles = ref<Array<{ name: string; file: File }>>([]);
const uploadFileList = ref<UploadFileInfo[]>([]);
const isStreamMode = ref(true);

function selectQuickOption(option: string) {
  inputValue.value = option;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function sendMessage() {
  if (!inputValue.value.trim() && uploadedFiles.value.length === 0) return;

  const userMessage: ChatMessage = {
    role: 'user',
    content: inputValue.value,
    files: uploadedFiles.value.map(f => ({ name: f.name }))
  };

  aiChatStore.addMessage(userMessage);
  inputValue.value = '';
  uploadedFiles.value = [];
  uploadFileList.value = [];

  if (isStreamMode.value) {
    sendStreamMessage(userMessage);
  } else {
    sendNormalMessage(userMessage);
  }
}

async function sendNormalMessage(userMessage: ChatMessage) {
  try {
    const response = await fetch(`${baseURL}/ai_chat/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthorization() || ''
      },
      body: JSON.stringify({
        message: userMessage.content,
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 1000,
        stream: false,
        sessionId: aiChatStore.sessionId
      })
    });

    const result = await response.json();

    if (result.code === 200) {
      aiChatStore.addMessage({
        role: 'ai',
        content: result.data?.reply || result.result?.reply
      });
      if (result.data?.sessionId || result.result?.sessionId) {
        aiChatStore.setSessionId(result.data?.sessionId || result.result?.sessionId);
      }
    } else {
      message.error(result.message || '发送消息失败');
    }
  } catch (error) {
    console.error('发送消息失败', error);
    message.error('发送消息失败，请稍后重试');
  }
}

async function sendStreamMessage(userMessage: ChatMessage) {
  try {
    let urlStr = `${baseURL}/ai_chat/stream`;
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = `${window.location.origin}${urlStr}`;
    }
    const url = new URL(urlStr);
    url.searchParams.append('message', userMessage.content);
    url.searchParams.append('model', 'gemma3:12b');
    url.searchParams.append('temperature', '0.7');
    url.searchParams.append('maxTokens', '1000');
    if (aiChatStore.sessionId) {
      url.searchParams.append('sessionId', aiChatStore.sessionId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthorization() || ''
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    let fullResponse = '';
    const aiMessageIndex = aiChatStore.messages.length;

    aiChatStore.addMessage({
      role: 'ai',
      content: ''
    });

    if (!reader) return;

    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();
      if (done) {
        reading = false;
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const result = processStreamLine(line, fullResponse, aiMessageIndex);
        if (result) {
          fullResponse = result;
        }
      }
    }

    if (buffer.trim()) {
      const result = processStreamLine(buffer, fullResponse, aiMessageIndex);
      if (result) {
        fullResponse = result;
      }
    }
  } catch (error) {
    console.error('流式发送失败', error);
    message.error('发送消息失败，请稍后重试');
  }
}

function processStreamLine(line: string, currentFullResponse: string, aiMessageIndex: number): string | null {
  if (!line.trim().startsWith('data:')) return null;

  try {
    const jsonStr = line.replace(/^data:\s*/, '').trim();
    if (!jsonStr) return null;

    const data = JSON.parse(jsonStr);
    const content = data.content;
    const isDone = data.done;

    if (content !== undefined) {
      const newContent = currentFullResponse + content;
      aiChatStore.updateMessage(aiMessageIndex, {
        ...aiChatStore.messages[aiMessageIndex],
        content: newContent
      });
      return newContent;
    }

    if (isDone && data.sessionId) {
      aiChatStore.setSessionId(data.sessionId);
    }

    return null;
  } catch (e) {
    console.error('解析流式数据失败', e);
    return null;
  }
}

async function handleFileChange(options: { fileList: UploadFileInfo[] }) {
  const files = options.fileList;
  const newFiles = files.filter(f => f.file && !uploadedFiles.value.some(uf => uf.name === f.name));

  if (newFiles.length > 0) {
    try {
      const fileNames = newFiles.map(f => f.name);

      const response = await fetch(`${baseURL}/ai_chat/file/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthorization() || ''
        },
        body: JSON.stringify({
          fileNames,
          sessionId: aiChatStore.sessionId
        })
      });

      const result = await response.json();

      if (result.code === 200) {
        uploadedFiles.value.push(
          ...newFiles.map(f => ({
            name: f.name,
            file: f.file as File
          }))
        );

        message.success('文件上传成功');
      } else {
        message.error(result.message || '文件上传失败');
      }
    } catch (error) {
      console.error('文件上传失败', error);
      message.error('文件上传失败，请稍后重试');
    }
  }
}

function removeFile(index: number) {
  uploadedFiles.value.splice(index, 1);
  uploadFileList.value.splice(index, 1);
}

function toggleRecording() {
  if (isRecording.value && recognitionInstance) {
    recognitionInstance.stop();
    recognitionInstance = null;
    isRecording.value = false;
    return;
  }

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    message.error('您的浏览器不支持语音识别功能');
    return;
  }

  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    message.error('语音识别需要 HTTPS 环境');
    return;
  }

  isRecording.value = true;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognitionInstance = new SpeechRecognition();
  recognitionInstance.lang = 'zh-CN';
  recognitionInstance.continuous = false;
  recognitionInstance.interimResults = false;

  recognitionInstance.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    inputValue.value += transcript;
    isRecording.value = false;
    recognitionInstance = null;
  };

  recognitionInstance.onerror = (event: any) => {
    console.error('语音识别错误:', event.error);
    if (event.error === 'not-allowed') {
      message.error('请允许麦克风权限');
    } else if (event.error === 'no-speech') {
      message.warning('未检测到语音');
    } else {
      message.error(`语音识别错误: ${event.error}`);
    }
    isRecording.value = false;
    recognitionInstance = null;
  };

  recognitionInstance.onend = () => {
    isRecording.value = false;
    recognitionInstance = null;
  };

  try {
    recognitionInstance.start();
  } catch (error) {
    console.error('启动语音识别失败:', error);
    message.error('启动语音识别失败');
    isRecording.value = false;
    recognitionInstance = null;
  }
}

defineExpose({
  inputValue,
  sendMessage
});
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
