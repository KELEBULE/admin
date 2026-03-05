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
          :class="msg.role === 'ai' ? 'bg-gray-100 rounded-tl-4px' : 'bg-gray-50 text-white rounded-tr-4px'"
        >
          <MarkdownRenderer v-if="msg.role === 'ai'" :content="msg.content" />
          <NText v-else>{{ msg.content }}</NText>

          <div v-if="msg.toolResults && msg.toolResults.length > 0" class="mt-12px">
            <div v-for="(result, rIndex) in msg.toolResults" :key="rIndex" class="mt-8px p-8px bg-[rgba(0,0,0,0.05)] rounded-8px">
              <NFlex align="center" :size="4">
                <SvgIcon
                  :icon="result.success ? 'mdi:check-circle' : 'mdi:alert-circle'"
                  :class="result.success ? 'text-green-500' : 'text-red-500'"
                  class="text-16px"
                />
                <NText depth="3" class="text-12px">{{ getToolDisplayName(result.toolName) }}</NText>
              </NFlex>

              <div v-if="result.success && result.data" class="mt-8px">
                <AlarmDataDisplay :data="result.data" :tool-name="result.toolName" />
              </div>
              <div v-else-if="!result.success" class="mt-4px">
                <NText depth="3" class="text-12px text-red-400">{{ result.data }}</NText>
              </div>
            </div>
          </div>

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
import { defineComponent, h, ref } from 'vue';
import {
  NButton,
  NDataTable,
  NEllipsis,
  NFlex,
  NGi,
  NGrid,
  NInput,
  NSpace,
  NStatistic,
  NText,
  NUpload,
  type UploadFileInfo,
  useMessage
} from 'naive-ui';
import { getAuthorization } from '@/service/request/shared';
import { type ChatMessage, type ToolResult, useAiChatStore } from '@/store/modules/ai-chat';
import { getServiceBaseURL } from '@/utils/service';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MarkdownRenderer from '@/components/common/markdown-renderer.vue';

const message = useMessage();
const aiChatStore = useAiChatStore();

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

const inputValue = ref('');
const isRecording = ref(false);
let recognitionInstance: any = null;
const uploadedFiles = ref<Array<{ name: string; file: File }>>([]);
const uploadFileList = ref<UploadFileInfo[]>([]);
const isStreamMode = ref(true);

const toolDisplayNames: Record<string, string> = {
  query_today_alarms: '查询今日报警',
  query_alarms_by_time_range: '查询时间范围报警',
  query_unconfirmed_alarms: '查询未确认报警',
  query_device_alarms: '查询设备报警',
  get_alarm_level_distribution: '报警等级分布',
  get_device_alarm_top: '设备报警排行',
  get_alarm_statistics: '报警统计概览',
  get_daily_alarm_trend: '每日报警趋势',
  query_devices: '查询设备列表',
  get_device_status_distribution: '设备状态分布',
  get_device_detail: '设备详情',
  query_fault_devices: '故障设备列表',
  query_work_orders: '查询工单列表',
  query_pending_work_orders: '待处理工单',
  get_work_order_statistics: '工单统计',
  get_work_order_detail: '工单详情',
  query_login_logs: '登录日志',
  query_operation_logs: '操作日志'
};

function getToolDisplayName(toolName: string): string {
  return toolDisplayNames[toolName] || toolName;
}

function renderStatisticGrid(cols: number, items: Array<{ label: string; value: number }>) {
  return h(NGrid, { cols, xGap: 8 }, () => items.map(item => h(NGi, null, () => h(NStatistic, { label: item.label, value: item.value }))));
}

function renderDataTable(columns: any[], data: any[], maxHeight = 200) {
  return h(NDataTable, { columns, data, size: 'small', maxHeight });
}

function renderListWithTable(total: number, list: any[], columns: any[]) {
  return h('div', [
    h(NText, { depth: 3, class: 'text-12px mb-4px' }, { default: () => `共 ${total} 条记录` }),
    renderDataTable(columns, list.slice(0, 10), 250)
  ]);
}

function renderEmptyData() {
  return h(NText, { depth: 3 }, { default: () => '暂无数据' });
}

function renderDetailText(lines: string[]) {
  return h(
    'div',
    { class: 'text-12px' },
    lines.map((line, i) => [h(NText, null, { default: () => line }), i < lines.length - 1 ? h('br') : null]).flat()
  );
}

function renderAlarmDistribution(data: any) {
  const distribution = data?.distribution || data?.levelDistribution;
  if (!distribution) return null;
  return renderStatisticGrid(3, [
    { label: '一级(严重)', value: distribution.level1?.count || 0 },
    { label: '二级(警告)', value: distribution.level2?.count || 0 },
    { label: '三级(提示)', value: distribution.level3?.count || 0 }
  ]);
}

function renderDeviceAlarmTop(data: any) {
  const topDevices = data?.topDevices || [];
  if (topDevices.length === 0) return null;
  const columns = [
    { title: '排名', key: 'rank', width: 60 },
    { title: '设备名称', key: 'deviceName' },
    { title: '报警次数', key: 'alarmCount', width: 100 }
  ];
  return renderDataTable(
    columns,
    topDevices.map((d: any, i: number) => ({ ...d, rank: i + 1 }))
  );
}

function renderAlarmList(data: any) {
  const list = data?.list || [];
  const total = data?.total || 0;
  if (list.length === 0) return renderEmptyData();
  const columns = [
    { title: '报警时间', key: 'alarmTime', width: 150 },
    { title: '等级', key: 'alarmLevelName', width: 100 },
    { title: '当前值', key: 'currentValue', width: 80 },
    { title: '阈值', key: 'thresholdValue', width: 80 },
    { title: '状态', key: 'confirmStatusName', width: 80 }
  ];
  return renderListWithTable(total, list, columns);
}

function renderAlarmTrend(data: any) {
  const trend = data?.trend || [];
  if (trend.length === 0) return null;
  return renderDataTable(
    [
      { title: '日期', key: 'date' },
      { title: '报警数量', key: 'count' }
    ],
    trend
  );
}

function renderDeviceStatusDistribution(data: any) {
  const distribution = data?.distribution;
  if (!distribution) return null;
  return renderStatisticGrid(4, [
    { label: '运行中', value: distribution.running?.count || 0 },
    { label: '待机', value: distribution.standby?.count || 0 },
    { label: '故障', value: distribution.fault?.count || 0 },
    { label: '维护中', value: distribution.maintenance?.count || 0 }
  ]);
}

function renderDeviceList(data: any) {
  const list = data?.list || [];
  const total = data?.total || 0;
  if (list.length === 0) return renderEmptyData();
  const columns = [
    { title: '设备编码', key: 'deviceCode', width: 100 },
    { title: '设备名称', key: 'deviceName' },
    { title: '状态', key: 'deviceStatusName', width: 80 },
    { title: '厂商', key: 'manufacturer', width: 100 }
  ];
  return renderListWithTable(total, list, columns);
}

function renderDeviceDetail(data: any) {
  return renderDetailText([
    `设备名称: ${data.deviceName}`,
    `设备编码: ${data.deviceCode}`,
    `状态: ${data.deviceStatusName}`,
    `厂商: ${data.manufacturer || '未知'}`
  ]);
}

function renderWorkOrderList(data: any) {
  const list = data?.list || [];
  const total = data?.total || 0;
  if (list.length === 0) return renderEmptyData();
  const columns = [
    { title: '工单编号', key: 'orderCode', width: 120 },
    { title: '类型', key: 'orderTypeName', width: 80 },
    { title: '优先级', key: 'priorityName', width: 60 },
    { title: '状态', key: 'orderStatusName', width: 80 }
  ];
  return renderListWithTable(total, list, columns);
}

function renderWorkOrderStatistics(data: any) {
  return renderStatisticGrid(4, [
    { label: '总工单', value: data.totalOrders || 0 },
    { label: '待处理', value: data.pendingOrders || 0 },
    { label: '处理中', value: data.processingOrders || 0 },
    { label: '已完成', value: data.completedOrders || 0 }
  ]);
}

function renderWorkOrderDetail(data: any) {
  return renderDetailText([
    `工单编号: ${data.orderCode}`,
    `类型: ${data.orderTypeName}`,
    `状态: ${data.orderStatusName}`,
    `故障描述: ${data.faultDescription}`
  ]);
}

function renderLogList(toolName: string, data: any) {
  const list = data?.list || [];
  const total = data?.total || 0;
  if (list.length === 0) return renderEmptyData();
  const isLogin = toolName === 'query_login_logs';
  const columns = isLogin
    ? [
        { title: '用户', key: 'userName', width: 80 },
        { title: 'IP', key: 'ip', width: 120 },
        { title: '状态', key: 'statusName', width: 60 },
        { title: '时间', key: 'createTime', width: 150 }
      ]
    : [
        { title: '用户', key: 'userName', width: 80 },
        { title: '操作', key: 'operation', width: 120 },
        { title: '状态', key: 'statusName', width: 60 },
        { title: '时间', key: 'createTime', width: 150 }
      ];
  return renderListWithTable(total, list, columns);
}

const AlarmDataDisplay = defineComponent({
  name: 'AlarmDataDisplay',
  props: {
    data: { type: Object, required: true },
    toolName: { type: String, required: true }
  },
  setup(props) {
    const renderers: Record<string, () => any> = {
      get_alarm_level_distribution: () => renderAlarmDistribution(props.data),
      get_alarm_statistics: () => renderAlarmDistribution(props.data),
      get_device_alarm_top: () => renderDeviceAlarmTop(props.data),
      query_today_alarms: () => renderAlarmList(props.data),
      query_unconfirmed_alarms: () => renderAlarmList(props.data),
      query_alarms_by_time_range: () => renderAlarmList(props.data),
      query_device_alarms: () => renderAlarmList(props.data),
      get_daily_alarm_trend: () => renderAlarmTrend(props.data),
      get_device_status_distribution: () => renderDeviceStatusDistribution(props.data),
      query_devices: () => renderDeviceList(props.data),
      query_fault_devices: () => renderDeviceList(props.data),
      get_device_detail: () => renderDeviceDetail(props.data),
      query_work_orders: () => renderWorkOrderList(props.data),
      query_pending_work_orders: () => renderWorkOrderList(props.data),
      get_work_order_statistics: () => renderWorkOrderStatistics(props.data),
      get_work_order_detail: () => renderWorkOrderDetail(props.data),
      query_login_logs: () => renderLogList(props.toolName, props.data),
      query_operation_logs: () => renderLogList(props.toolName, props.data)
    };

    return () => {
      const renderer = renderers[props.toolName];
      if (renderer) {
        const result = renderer();
        if (result) return result;
      }
      return h(NText, { depth: 3, class: 'text-12px' }, { default: () => JSON.stringify(props.data, null, 2) });
    };
  }
});

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
        model: 'qwen3:14b',
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
        content: result.data?.reply || result.result?.reply,
        toolResults: result.data?.toolResults || result.result?.toolResults
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
    url.searchParams.append('model', 'qwen3:14b');
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
    const toolResults: ToolResult[] = [];
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
        const result = processStreamLine(line, fullResponse, aiMessageIndex, toolResults);
        if (result) {
          fullResponse = result;
        }
      }
    }

    if (buffer.trim()) {
      const result = processStreamLine(buffer, fullResponse, aiMessageIndex, toolResults);
      if (result) {
        fullResponse = result;
      }
    }

    if (toolResults.length > 0) {
      aiChatStore.updateMessage(aiMessageIndex, {
        ...aiChatStore.messages[aiMessageIndex],
        toolResults
      });
    }
  } catch (error) {
    console.error('流式发送失败', error);
    message.error('发送消息失败，请稍后重试');
  }
}

function processStreamLine(line: string, currentFullResponse: string, aiMessageIndex: number, toolResults: ToolResult[]): string | null {
  if (!line.trim().startsWith('data:')) return null;

  try {
    const jsonStr = line.replace(/^data:\s*/, '').trim();
    if (!jsonStr) return null;

    const data = JSON.parse(jsonStr);

    if (data.type === 'tool_call') {
      toolResults.push({
        toolName: data.toolName,
        success: data.success,
        data: data.data
      });
      return null;
    }

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
