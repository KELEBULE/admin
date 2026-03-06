<template>
  <Teleport to="body">
    <div v-if="visible && alarmList.length > 0" class="alarm-notification-container">
      <div class="alarm-notification-header">
        <span class="title">{{ $t('page.alarm.push.title') }}</span>
        <span class="count">{{ alarmList.length }}</span>
        <button class="clear-btn" @click="clearAll">{{ $t('common.clearAll') }}</button>
        <button class="close-panel-btn" @click="closePanel">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
      <div class="alarm-notification-list">
        <div v-for="alarm in alarmList" :key="alarm.alarmId" class="alarm-notification-item" :class="getAlarmTypeClass(alarm.alarmLevel)">
          <div class="alarm-header">
            <span class="alarm-level">{{ getAlarmLevelName(alarm.alarmLevel) }}</span>
            <button class="close-btn" @click="removeAlarm(alarm.alarmId)">×</button>
          </div>
          <div class="alarm-content">
            <div class="alarm-item">
              <span class="label">{{ $t('page.alarm.push.device') }}:</span>
              <span class="value">{{ alarm.deviceName || '-' }}</span>
            </div>
            <div class="alarm-item">
              <span class="label">{{ $t('page.alarm.push.alarmTime') }}:</span>
              <span class="value">{{ formatTime(alarm.alarmTime) }}</span>
            </div>
            <div class="alarm-item">
              <span class="label">{{ $t('page.alarm.push.temperature') }}:</span>
              <span class="value temperature">{{ alarm.currentValue }}℃</span>
            </div>
            <div v-if="alarm.thresholdValue" class="alarm-item">
              <span class="label">{{ $t('page.alarm.push.threshold') }}:</span>
              <span class="value">{{ alarm.thresholdValue }}℃</span>
            </div>
          </div>
          <div class="alarm-footer">
            <NButton size="small" type="primary" @click="handleViewDetail(alarm)">
              {{ $t('page.alarm.push.viewDetail') }}
            </NButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { NButton } from 'naive-ui';
import { useAlarmPushStore } from '@/store/modules/alarm-push';
import { formatDateTime } from '@/utils/date';
import { $t } from '@/locales';

defineOptions({
  name: 'AlarmPushNotification'
});

const router = useRouter();
const alarmPushStore = useAlarmPushStore();

const visible = ref(true);
const alarmList = computed(() => alarmPushStore.notifications);

function getAlarmTypeClass(level: number): string {
  switch (level) {
    case 1:
      return 'alarm-error';
    case 2:
      return 'alarm-warning';
    case 3:
      return 'alarm-info';
    default:
      return 'alarm-info';
  }
}

function getAlarmLevelName(level: number): string {
  switch (level) {
    case 1:
      return '一级(严重)';
    case 2:
      return '二级(警告)';
    case 3:
      return '三级(提示)';
    default:
      return '未知';
  }
}

function formatTime(time: string): string {
  return formatDateTime(time);
}

function removeAlarm(alarmId: number) {
  alarmPushStore.removeNotification(alarmId);
}

function clearAll() {
  alarmPushStore.clearNotifications();
}

function closePanel() {
  visible.value = false;
}

function handleViewDetail(data: Api.Alarm.AlarmPush) {
  alarmPushStore.removeNotification(data.alarmId);
  router.push({
    path: '/data-center/alarm-record',
    query: { alarmId: data.alarmId }
  });
}

watch(
  () => alarmPushStore.notifications,
  notifications => {
    if (notifications.length > 0 && !visible.value) {
      visible.value = true;
    }
  },
  { deep: true }
);

onMounted(() => {
  alarmPushStore.connectWebSocket();
});

onUnmounted(() => {
  alarmPushStore.disconnectWebSocket();
});
</script>

<style scoped>
.alarm-notification-container {
  position: fixed;
  right: 20px;
  top: 60px;
  width: 360px;
  max-height: 480px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.alarm-notification-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.alarm-notification-header .title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.alarm-notification-header .count {
  margin-left: 8px;
  padding: 2px 8px;
  background: #409eff;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
}

.alarm-notification-header .clear-btn {
  margin-left: auto;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.alarm-notification-header .clear-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.alarm-notification-header .close-panel-btn {
  margin-left: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #909399;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.alarm-notification-header .close-panel-btn:hover {
  background: #e4e7ed;
  color: #606266;
}

.alarm-notification-list {
  max-height: 420px;
  overflow-y: auto;
  padding: 8px;
}

.alarm-notification-list::-webkit-scrollbar {
  width: 6px;
}

.alarm-notification-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.alarm-notification-list::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.alarm-notification-item {
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
  transition: all 0.3s;
}

.alarm-notification-item:last-child {
  margin-bottom: 0;
}

.alarm-notification-item.alarm-error {
  border-left: 4px solid #d03050;
}

.alarm-notification-item.alarm-error .alarm-header {
  background: #fef0f0;
}

.alarm-notification-item.alarm-error .alarm-level {
  color: #d03050;
}

.alarm-notification-item.alarm-warning {
  border-left: 4px solid #f0a020;
}

.alarm-notification-item.alarm-warning .alarm-header {
  background: #fdf6ec;
}

.alarm-notification-item.alarm-warning .alarm-level {
  color: #f0a020;
}

.alarm-notification-item.alarm-info {
  border-left: 4px solid #2080f0;
}

.alarm-notification-item.alarm-info .alarm-header {
  background: #ecf5ff;
}

.alarm-notification-item.alarm-info .alarm-level {
  color: #2080f0;
}

.alarm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}

.alarm-header .alarm-level {
  font-weight: 600;
  font-size: 13px;
}

.alarm-header .close-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.alarm-header .close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #606266;
}

.alarm-content {
  padding: 12px;
  background: #fff;
}

.alarm-content .alarm-item {
  display: flex;
  margin-bottom: 6px;
  align-items: center;
  font-size: 13px;
}

.alarm-content .alarm-item:last-child {
  margin-bottom: 0;
}

.alarm-content .label {
  color: #909399;
  min-width: 70px;
}

.alarm-content .value {
  color: #303133;
}

.alarm-content .temperature {
  color: #d03050;
  font-weight: 600;
}

.alarm-footer {
  padding: 8px 12px;
  background: #fafafa;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}
</style>
