<template>
  <NDrawer v-model:show="visible" :width="640" :mask-closable="false">
    <NDrawerContent :title="$t('page.alarm.record.detail')" closable>
      <NSpin :show="loading">
        <NTabs v-model:value="activeTab" type="line" animated>
          <NTabPane name="detail" :tab="$t('page.alarm.record.detailTab')">
            <NDescriptions v-if="alarmData" label-placement="left" :column="2" bordered class="mt-16px">
              <NDescriptionsItem :label="$t('page.alarm.record.alarmCode')">
                {{ alarmData.alarmCode }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.alarmLevel')">
                <NTag :type="getAlarmLevelType(alarmData.alarmLevel)" size="small">
                  {{ getAlarmLevelLabel(alarmData.alarmLevel) }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.deviceName')">
                {{ alarmData.deviceName || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.deviceCode')">
                {{ alarmData.deviceCode || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.partName')">
                {{ alarmData.partName || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.alarmTime')">
                {{ alarmData.alarmTime }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.currentValue')">
                {{ alarmData.currentValue }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.thresholdValue')">
                {{ alarmData.thresholdValue ?? '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.confirmStatus')">
                <NTag :type="alarmData.confirmStatus === 1 ? 'success' : 'default'" size="small">
                  {{ alarmData.confirmStatus === 1 ? $t('page.alarm.record.confirmed') : $t('page.alarm.record.unconfirmed') }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.clearStatus')">
                <NTag :type="alarmData.clearStatus === 1 ? 'success' : 'default'" size="small">
                  {{ alarmData.clearStatus === 1 ? $t('page.alarm.record.cleared') : $t('page.alarm.record.uncleared') }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.confirmUser')">
                {{ alarmData.confirmUserName || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.confirmTime')">
                {{ alarmData.confirmTime || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.handleUser')">
                {{ alarmData.handleUserName || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.handleTime')">
                {{ alarmData.handleTime || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.clearUser')">
                {{ alarmData.clearUserName || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.clearTime')">
                {{ alarmData.clearTime || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.isFalseAlarm')">
                <NTag :type="alarmData.isFalseAlarm === 1 ? 'warning' : 'success'" size="small">
                  {{ alarmData.isFalseAlarm === 1 ? $t('page.alarm.record.falseAlarmYes') : $t('page.alarm.record.falseAlarmNo') }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.alarmDuration')">
                {{ formatDuration(alarmData.alarmDuration) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.alarm.record.workOrderCode')">
                {{ alarmData.workOrderCode || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('common.createTime')">
                {{ alarmData.createTime }}
              </NDescriptionsItem>
            </NDescriptions>
          </NTabPane>
          <NTabPane name="log" :tab="$t('page.alarm.record.statusLogTab')">
            <div class="mt-16px">
              <NEmpty v-if="statusLogList.length === 0" :description="$t('page.alarm.record.noStatusLog')" />
              <NTimeline v-else>
                <NTimelineItem
                  v-for="log in statusLogList"
                  :key="log.logId"
                  :type="getLogType(log.operateType)"
                  :title="getOperateTypeLabel(log.operateType)"
                  :time="log.operateTime"
                >
                  <div class="text-sm">
                    <p v-if="log.operateUserName">
                      <span class="text-gray-500">{{ $t('page.alarm.record.operator') }}：</span>
                      {{ log.operateUserName }}
                    </p>
                    <p>
                      <span class="text-gray-500">{{ $t('page.alarm.record.statusChange') }}：</span>
                      {{ getStatusLabel(log.beforeStatus) }} → {{ getStatusLabel(log.afterStatus) }}
                    </p>
                    <p v-if="log.operateRemark">
                      <span class="text-gray-500">{{ $t('page.alarm.record.remark') }}：</span>
                      {{ log.operateRemark }}
                    </p>
                    <p>
                      <span class="text-gray-500">{{ $t('page.alarm.record.operateSource') }}：</span>
                      {{ log.operateSource === 1 ? $t('page.alarm.record.manualOperate') : $t('page.alarm.record.autoOperate') }}
                    </p>
                  </div>
                </NTimelineItem>
              </NTimeline>
            </div>
          </NTabPane>
        </NTabs>
      </NSpin>
      <template #footer>
        <NSpace justify="end">
          <NPopconfirm v-if="showConfirmButtons" @positive-click="handleConfirm(0)">
            <template #trigger>
              <NButton type="warning">
                {{ $t('page.alarm.record.confirm') }}
              </NButton>
            </template>
            {{ $t('page.alarm.record.confirmAlarm') }}
          </NPopconfirm>
          <NPopconfirm v-if="showConfirmButtons" @positive-click="handleConfirm(1)">
            <template #trigger>
              <NButton type="error">
                {{ $t('page.alarm.record.falseAlarmYes') }}
              </NButton>
            </template>
            {{ $t('page.alarm.record.confirmFalseAlarm') }}
          </NPopconfirm>
          <NButton v-if="showCreateWorkOrderButton" type="info" @click="handleCreateWorkOrder">
            {{ $t('page.alarm.record.createWorkOrder') }}
          </NButton>
          <NButton @click="visible = false">{{ $t('common.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchGetDeviceAlarmStatusLogList } from '@/service/api/alarm';
import { $t } from '@/locales';

defineOptions({ name: 'AlarmDetailDrawer' });

interface Props {
  visible: boolean;
  alarmData: Api.Alarm.DeviceAlarm | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  confirm: [isFalseAlarm: number];
  createWorkOrder: [];
}>();

const activeTab = ref('detail');
const statusLogList = ref<Api.Alarm.DeviceAlarmStatusLog[]>([]);
const logLoading = ref(false);

const visible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val)
});

const loading = computed(() => !props.alarmData);

const showConfirmButtons = computed(() => {
  return props.alarmData?.confirmStatus === 0;
});

const showCreateWorkOrderButton = computed(() => {
  const data = props.alarmData;
  return data?.confirmStatus === 1 && data?.clearStatus === 0 && !data?.workOrderId && data?.isFalseAlarm !== 1;
});

watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      activeTab.value = 'detail';
      if (props.alarmData?.alarmId) {
        loadStatusLogList(props.alarmData.alarmId);
      }
    } else {
      statusLogList.value = [];
    }
  }
);

async function loadStatusLogList(alarmId: number) {
  logLoading.value = true;
  const { data, error } = await fetchGetDeviceAlarmStatusLogList(alarmId);
  if (!error && data) {
    statusLogList.value = data;
  }
  logLoading.value = false;
}

function handleConfirm(isFalseAlarm: number) {
  emit('confirm', isFalseAlarm);
}

function handleCreateWorkOrder() {
  emit('createWorkOrder');
}

const getAlarmLevelType = (level: number): 'error' | 'warning' | 'info' => {
  const map: Record<number, 'error' | 'warning' | 'info'> = {
    1: 'error',
    2: 'warning',
    3: 'info'
  };
  return map[level] || 'info';
};

const getAlarmLevelLabel = (level: number): string => {
  const map: Record<number, string> = {
    1: $t('page.alarm.alarmLevels.level1'),
    2: $t('page.alarm.alarmLevels.level2'),
    3: $t('page.alarm.alarmLevels.level3')
  };
  return map[level] || '-';
};

const formatDuration = (duration?: number): string => {
  if (duration === null || duration === undefined) return '-';
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
};

const getLogType = (operateType: number): 'success' | 'warning' | 'error' | 'info' => {
  const map: Record<number, 'success' | 'warning' | 'error' | 'info'> = {
    1: 'success',
    2: 'info',
    3: 'success',
    4: 'warning',
    5: 'error'
  };
  return map[operateType] || 'info';
};

const getOperateTypeLabel = (operateType: number): string => {
  const map: Record<number, string> = {
    1: $t('page.alarm.record.operateTypes.confirm'),
    2: $t('page.alarm.record.operateTypes.handle'),
    3: $t('page.alarm.record.operateTypes.clear'),
    4: $t('page.alarm.record.operateTypes.falseAlarm'),
    5: $t('page.alarm.record.operateTypes.reactivate')
  };
  return map[operateType] || '-';
};

const getStatusLabel = (status: number): string => {
  const map: Record<number, string> = {
    0: $t('page.alarm.record.statusTypes.unconfirmed'),
    1: $t('page.alarm.record.statusTypes.confirmed'),
    2: $t('page.alarm.record.statusTypes.handled'),
    3: $t('page.alarm.record.statusTypes.cleared')
  };
  return map[status] || '-';
};
</script>
