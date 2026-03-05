<template>
  <NSpin :show="loading">
    <NEmpty v-if="alarmList.length === 0" :description="$t('common.noData')" class="py-16px" />
    <NList v-else hoverable clickable>
      <NListItem v-for="alarm in alarmList" :key="alarm.alarmId" @click="handleAlarmClick(alarm)">
        <NThing :title="alarm.alarmCode">
          <template #description>
            <NFlex :size="4" vertical>
              <NFlex :size="4">
                <NTag :type="getAlarmLevelType(alarm.alarmLevel)" size="small">
                  {{ getAlarmLevelText(alarm.alarmLevel) }}
                </NTag>
                <NTag :type="alarm.confirmStatus === 1 ? 'success' : 'default'" size="small">
                  {{ alarm.confirmStatus === 1 ? $t('page.alarm.record.confirmed') : $t('page.alarm.record.unconfirmed') }}
                </NTag>
              </NFlex>
              <span class="text-12px text-gray-500">{{ dayjs(alarm.alarmTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </NFlex>
          </template>
        </NThing>
      </NListItem>
    </NList>
    <div v-if="hasMore" class="text-center py-8px">
      <NButton text type="primary" @click="handleLoadMore">
        {{ $t('common.moreOperation') }}
      </NButton>
    </div>
  </NSpin>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import { fetchGetDeviceAlarmPageList } from '@/service/api/alarm';
import { $t } from '@/locales';

const props = defineProps<{
  deviceId: number | null;
}>();

const emit = defineEmits<{
  'alarm-click': [alarm: Api.Alarm.DeviceAlarm];
  'more-click': [];
}>();

const loading = ref(false);
const alarmList = ref<Api.Alarm.DeviceAlarm[]>([]);
const hasMore = ref(false);
const currentPage = ref(1);
const pageSize = 5;

function getAlarmLevelType(level: number): 'error' | 'warning' | 'info' {
  const levelMap: Record<number, 'error' | 'warning' | 'info'> = {
    1: 'error',
    2: 'warning',
    3: 'info'
  };
  return levelMap[level] || 'info';
}

function getAlarmLevelText(level: number): string {
  const levelMap: Record<number, string> = {
    1: $t('page.alarm.alarmLevels.level1'),
    2: $t('page.alarm.alarmLevels.level2'),
    3: $t('page.alarm.alarmLevels.level3')
  };
  return levelMap[level] || '-';
}

async function loadAlarmList() {
  if (!props.deviceId) {
    alarmList.value = [];
    return;
  }

  loading.value = true;
  try {
    const result = await fetchGetDeviceAlarmPageList({
      deviceId: props.deviceId,
      page: currentPage.value,
      pageSize
    });
    if (result.data) {
      const records = result.data.records || result.data.list || [];
      if (currentPage.value === 1) {
        alarmList.value = records;
      } else {
        alarmList.value = [...alarmList.value, ...records];
      }
      hasMore.value = alarmList.value.length < (result.data.total || 0);
    }
  } catch (error) {
    console.error('Failed to load alarm list:', error);
    alarmList.value = [];
  } finally {
    loading.value = false;
  }
}

function handleAlarmClick(alarm: Api.Alarm.DeviceAlarm) {
  emit('alarm-click', alarm);
}

function handleLoadMore() {
  emit('more-click');
}

watch(
  () => props.deviceId,
  newDeviceId => {
    currentPage.value = 1;
    if (newDeviceId) {
      loadAlarmList();
    } else {
      alarmList.value = [];
    }
  },
  { immediate: true }
);
</script>
