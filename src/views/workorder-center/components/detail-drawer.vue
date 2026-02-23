<template>
  <NDrawer v-model:show="visible" :width="700" placement="right" :title="$t('page.workorder.viewDetail')" class="m-8px rounded-10px">
    <NDrawerContent>
      <NTabs v-model:value="activeTab" type="line">
        <NTabPane name="info" :tab="$t('page.workorder.viewDetail')">
          <NDescriptions label-placement="left" :column="1" bordered class="mb-4">
            <NDescriptionsItem :label="$t('page.workorder.orderCode')">
              {{ detailData.orderCode || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.orderType')">
              <NTag :type="getOrderTypeTag(detailData.orderType).type">
                {{ getOrderTypeTag(detailData.orderType).text }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.orderStatus')">
              <NTag :type="getOrderStatusTag(detailData.orderStatus).type">
                {{ getOrderStatusTag(detailData.orderStatus).text }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.priority')">
              <NTag :type="getPriorityTag(detailData.priority).type">
                {{ getPriorityTag(detailData.priority).text }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.deviceName')">
              {{ detailData.deviceName || detailData.deviceCode || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.faultTime')">
              {{ formatTime(detailData.faultTime) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.faultDescription')">
              {{ detailData.faultDescription || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.repairRequirement')">
              {{ detailData.repairRequirement || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.creatorName')">
              {{ detailData.creatorName || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.assigneeName')">
              {{ detailData.assigneeName || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.processorName')">
              {{ detailData.processorName || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.planStartTime')">
              {{ formatTime(detailData.planStartTime) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.planEndTime')">
              {{ formatTime(detailData.planEndTime) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.actualStartTime')">
              {{ formatTime(detailData.actualStartTime) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.actualEndTime')">
              {{ formatTime(detailData.actualEndTime) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.handleDuration')">
              {{ detailData.handleDuration ? `${detailData.handleDuration} 分钟` : '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.repairResult')">
              {{ detailData.repairResult || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.repairCost')">
              {{ detailData.repairCost ? `¥${detailData.repairCost}` : '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.spareParts')">
              {{ detailData.spareParts || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.reviewResult')">
              {{ detailData.reviewResult || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.evaluationScore')">
              <NRate v-if="detailData.evaluationScore" :value="detailData.evaluationScore" readonly />
              <span v-else>-</span>
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.workorder.evaluationRemark')">
              {{ detailData.evaluationRemark || '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('common.createTime')">
              {{ formatTime(detailData.createTime) }}
            </NDescriptionsItem>
          </NDescriptions>
        </NTabPane>
        <NTabPane name="logs" :tab="$t('page.workorder.flowLog')">
          <NTimeline>
            <NTimelineItem v-for="log in flowLogs" :key="log.logId" :type="getLogType(log.actionType)" :title="getActionText(log.actionType)">
              <div class="text-sm text-gray-500">
                <p v-if="log.fromStatus !== undefined && log.toStatus !== undefined">
                  状态: {{ getOrderStatusText(log.fromStatus) }} → {{ getOrderStatusText(log.toStatus) }}
                </p>
                <p v-if="log.actionRemark">{{ log.actionRemark }}</p>
                <p>操作人: {{ log.operatorName || '-' }}</p>
                <p>{{ formatTime(log.createTime) }}</p>
              </div>
            </NTimelineItem>
          </NTimeline>
          <NEmpty v-if="!flowLogs.length" description="暂无流转记录" />
        </NTabPane>
      </NTabs>
      <template #footer>
        <NSpace>
          <NButton v-if="detailData.orderStatus === 0" type="primary" @click="handleFlow('assign')">
            {{ $t('page.workorder.assignHandler') }}
          </NButton>
          <NButton v-if="detailData.orderStatus === 0" type="primary" @click="handleFlow('start')">
            {{ $t('page.workorder.startProcess') }}
          </NButton>
          <NButton v-if="detailData.orderStatus === 1" type="success" @click="handleFlow('complete')">
            {{ $t('page.workorder.completeProcess') }}
          </NButton>
          <NButton v-if="detailData.orderStatus === 2" type="success" @click="handleFlow('review')">
            {{ $t('page.workorder.passReview') }}
          </NButton>
          <NButton v-if="detailData.orderStatus === 3 && !detailData.evaluationScore" type="warning" @click="handleFlow('evaluate')">
            {{ $t('page.workorder.evaluate') }}
          </NButton>
          <NButton v-if="detailData.orderStatus === 0 || detailData.orderStatus === 1" type="error" @click="handleFlow('cancel')">
            {{ $t('page.workorder.cancelOrder') }}
          </NButton>
          <NButton @click="handleClose">{{ $t('common.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { fetchGetWorkOrder } from '@/service/api/workorder';
import { $t } from '@/locales';

defineOptions({
  name: 'DetailDrawer'
});

const props = defineProps<{
  visible: boolean;
  row: any;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  flow: [row: any, type: 'start' | 'complete' | 'review' | 'cancel' | 'assign' | 'evaluate'];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
});

const activeTab = ref('info');
const detailData = ref<any>({});
const flowLogs = ref<any[]>([]);

watch(
  () => props.visible,
  async val => {
    if (val && props.row?.orderId) {
      await loadDetail();
    }
  }
);

async function loadDetail() {
  const { error, data } = await fetchGetWorkOrder(props.row.orderId);
  if (!error && data) {
    detailData.value = data;
    flowLogs.value = data.flowLogs || [];
  }
}

function formatTime(time: string | number | null): string {
  if (!time) return '-';
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-';
}

function getOrderTypeTag(type: number): { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string } {
  const typeMap: Record<number, { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string }> = {
    1: { type: 'error', text: $t('page.workorder.orderTypes.repair') },
    2: { type: 'warning', text: $t('page.workorder.orderTypes.maintenance') },
    3: { type: 'info', text: $t('page.workorder.orderTypes.inspection') },
    4: { type: 'success', text: $t('page.workorder.orderTypes.calibration') }
  };
  return typeMap[type] || { type: 'default', text: '-' };
}

function getOrderStatusTag(status: number): { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string } {
  const statusMap: Record<number, { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string }> = {
    0: { type: 'default', text: $t('page.workorder.orderStatuses.pending') },
    1: { type: 'info', text: $t('page.workorder.orderStatuses.processing') },
    2: { type: 'warning', text: $t('page.workorder.orderStatuses.reviewing') },
    3: { type: 'success', text: $t('page.workorder.orderStatuses.completed') },
    4: { type: 'error', text: $t('page.workorder.orderStatuses.cancelled') }
  };
  return statusMap[status] || { type: 'default', text: '-' };
}

function getOrderStatusText(status: number | undefined): string {
  if (status === undefined) return '-';
  return getOrderStatusTag(status).text;
}

function getPriorityTag(priority: number): { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string } {
  const priorityMap: Record<number, { type: 'default' | 'info' | 'success' | 'warning' | 'error'; text: string }> = {
    1: { type: 'error', text: $t('page.workorder.priorities.urgent') },
    2: { type: 'warning', text: $t('page.workorder.priorities.high') },
    3: { type: 'info', text: $t('page.workorder.priorities.medium') },
    4: { type: 'default', text: $t('page.workorder.priorities.low') }
  };
  return priorityMap[priority] || { type: 'default', text: '-' };
}

function getLogType(actionType: number): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const typeMap: Record<number, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    1: 'info',
    2: 'warning',
    3: 'info',
    4: 'info',
    5: 'success',
    6: 'success',
    7: 'error',
    8: 'warning'
  };
  return typeMap[actionType] || 'default';
}

function getActionText(actionType: number): string {
  const textMap: Record<number, string> = {
    1: $t('page.workorder.actionTypes.create'),
    2: $t('page.workorder.actionTypes.statusChange'),
    3: $t('page.workorder.actionTypes.assign'),
    4: $t('page.workorder.actionTypes.startProcess'),
    5: $t('page.workorder.actionTypes.completeProcess'),
    6: $t('page.workorder.actionTypes.review'),
    7: $t('page.workorder.actionTypes.cancel'),
    8: $t('page.workorder.actionTypes.evaluate')
  };
  return textMap[actionType] || '未知操作';
}

function handleFlow(type: 'start' | 'complete' | 'review' | 'cancel' | 'assign' | 'evaluate') {
  emit('flow', detailData.value, type);
}

function handleClose() {
  visible.value = false;
}
</script>
