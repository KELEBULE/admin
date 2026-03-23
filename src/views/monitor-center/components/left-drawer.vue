<template>
  <div class="absolute top-0 left-0 h-full w-0 overflow-visible z-100">
    <Transition name="drawer-left">
      <div
        v-show="visible"
        class="absolute top-16px left-16px w-320px h-[calc(100%-32px)] bg-white/95 dark:bg-black/60 backdrop-blur-8px rounded-r-8px shadow-[2px_0_8px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
      >
        <div class="px-16px py-16px border-b border-b-#a8c8e8 dark:border-b-white/10">
          <span class="text-16px font-500 text-#1b3a5a dark:text-white/90">{{ $t('page.monitor.deviceInfo') }}</span>
        </div>

        <NScrollbar class="flex-1">
          <NFlex class="px-12px py-8px" vertical :size="8">
            <NImage :src="currentDevice?.imageUrl || ''" class="w-full h-200px rounded-8px object-cover" />
            <NGrid cols="3" x-gap="8px" y-gap="8px">
              <NGridItem span="1">
                <NFlex class="w-full h-full justify-center items-center bg-#eaf5ff p-4px rounded-8px border-#b2d9ff border-1px" vertical>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">{{ $t('page.monitor.deviceName') }}</NEllipsis>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">{{ deviceStats?.deviceName || '-' }}</NEllipsis>
                </NFlex>
              </NGridItem>
              <NGridItem span="1">
                <NFlex class="w-full h-full justify-center items-center bg-#eaf5ff p-4px rounded-8px border-#b2d9ff border-1px" vertical>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">{{ $t('page.monitor.deviceCode') }}</NEllipsis>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">{{ deviceStats?.deviceCode || '-' }}</NEllipsis>
                </NFlex>
              </NGridItem>
              <NGridItem span="1">
                <NFlex class="w-full h-full justify-center items-center bg-#eaf5ff p-4px rounded-8px border-#b2d9ff border-1px" vertical>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">{{ $t('page.equipment.deviceStatus') }}</NEllipsis>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">
                    <NTag :type="getStatusTagType(deviceStats?.deviceStatus)" size="small">{{ getStatusText(deviceStats?.deviceStatus) }}</NTag>
                  </NEllipsis>
                </NFlex>
              </NGridItem>
              <NGridItem span="1">
                <NFlex class="w-full h-full justify-center items-center bg-#eaf5ff p-4px rounded-8px border-#b2d9ff border-1px" vertical>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">{{ $t('page.monitor.deviceAlarm') }}</NEllipsis>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">
                    <NTag :type="deviceStats?.alarmCount && deviceStats.alarmCount > 0 ? 'error' : 'success'" size="small">
                      {{ deviceStats?.alarmCount || 0 }}
                    </NTag>
                  </NEllipsis>
                </NFlex>
              </NGridItem>
              <NGridItem span="1">
                <NFlex class="w-full h-full justify-center items-center bg-#eaf5ff p-4px rounded-8px border-#b2d9ff border-1px" vertical>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">{{ $t('page.monitor.deviceWorkOrder') }}</NEllipsis>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">
                    <NTag :type="deviceStats?.workOrderCount && deviceStats.workOrderCount > 0 ? 'warning' : 'success'" size="small">
                      {{ deviceStats?.workOrderCount || 0 }}
                    </NTag>
                  </NEllipsis>
                </NFlex>
              </NGridItem>
              <NGridItem span="1">
                <NFlex class="w-full h-full justify-center items-center bg-#eaf5ff p-4px rounded-8px border-#b2d9ff border-1px" vertical>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">{{ $t('page.monitor.runningDuration') }}</NEllipsis>
                  <NEllipsis class="text-14px font-500 dark:text-white/90 text-center">
                    {{ formatWorkHours(deviceStats?.totalWorkHours) }}
                  </NEllipsis>
                </NFlex>
              </NGridItem>
            </NGrid>
            <NCollapse>
              <NCollapseItem name="parts" :title="$t('page.monitor.partList')">
                <NSpin :show="partsLoading">
                  <NEmpty v-if="partList.length === 0" :description="$t('page.monitor.noParts')" class="py-16px" />
                  <NList v-else hoverable clickable>
                    <NListItem v-for="part in partList" :key="part.partId" @click="handlePartClick(part)">
                      <template #prefix>
                        <div class="w-8px h-8px rounded-full" :class="selectedPartId === part.partId ? 'bg-#1890ff' : 'bg-#d9d9d9'"></div>
                      </template>
                      <NThing :title="part.partName" :description="part.partCode">
                        <template #description>
                          <NFlex :size="4">
                            <NTag v-if="part.partType" size="small" type="info">{{ part.partType }}</NTag>
                          </NFlex>
                        </template>
                      </NThing>
                    </NListItem>
                  </NList>
                </NSpin>
              </NCollapseItem>
              <NCollapseItem name="alarms" :title="$t('page.monitor.alarmRecord')">
                <AlarmRecordList :device-id="currentDevice?.deviceId || null" @alarm-click="handleAlarmClick" @more-click="handleMoreAlarm" />
              </NCollapseItem>
            </NCollapse>
          </NFlex>
        </NScrollbar>
      </div>
    </Transition>

    <div
      class="absolute top-50% transform-translate-y--50% w-28px h-60px bg-white/95 dark:bg-black/60 rounded-r-8px flex items-center justify-center cursor-pointer shadow-[2px_0_8px_rgba(0,0,0,0.1)] transition-all duration-300 z-99 hover:bg-#1890ff hover:text-white"
      :class="visible ? 'left-336px' : 'left-16px'"
      @click.stop="toggleDrawer"
    >
      <SvgIcon :icon="visible ? 'mdi:chevron-left' : 'mdi:chevron-right'" class="text-18px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchGetDeviceDetailStats, fetchGetDevicePartList } from '@/service/api/equipment';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';
import AlarmRecordList from './alarm-record-list.vue';

const router = useRouter();

const props = defineProps<{
  currentDevice: Api.Equipment.LatestAlarmDevice | null;
  currentPart: Api.Equipment.DevicePart | null;
}>();

const emit = defineEmits<{
  'part-click': [part: Api.Equipment.DevicePart];
}>();

const visible = ref(true);
const selectedPartId = ref<number | null>(null);
const deviceStats = ref<Api.Equipment.DeviceDetailStats | null>(null);
const partList = ref<Api.Equipment.DevicePart[]>([]);
const partsLoading = ref(false);

function toggleDrawer() {
  visible.value = !visible.value;
}

function getStatusTagType(status?: number) {
  switch (status) {
    case 1:
      return 'success';
    case 2:
      return 'warning';
    case 3:
      return 'error';
    default:
      return 'default';
  }
}

function getStatusText(status?: number) {
  switch (status) {
    case 1:
      return $t('page.equipment.statusNormal');
    case 2:
      return $t('page.equipment.statusMaintenance');
    case 3:
      return $t('page.workbench.statusNormal');
    default:
      return '-';
  }
}

function formatWorkHours(hours?: number) {
  if (!hours) return '0h';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return remainHours > 0 ? `${days}d ${remainHours}h` : `${days}d`;
}

function handlePartClick(part: Api.Equipment.DevicePart) {
  selectedPartId.value = part.partId;
  emit('part-click', part);
}

function handleAlarmClick(alarm: Api.Alarm.DeviceAlarm) {
  router.push({
    path: '/data-center/alarm-record',
    query: { alarmId: alarm.alarmId }
  });
}

function handleMoreAlarm() {
  router.push('/data-center/alarm-record');
}

async function loadDeviceStats(deviceId: number) {
  const result = await fetchGetDeviceDetailStats(deviceId);
  if (result.data) {
    deviceStats.value = result.data;
  }
}

async function loadPartList(deviceId: number) {
  partsLoading.value = true;
  try {
    const result = await fetchGetDevicePartList(deviceId);
    if (result.data) {
      partList.value = result.data;
    }
  } catch (error) {
    console.error('Failed to load part list:', error);
    partList.value = [];
  } finally {
    partsLoading.value = false;
  }
}

watch(
  () => props.currentDevice,
  newDevice => {
    if (newDevice?.alarmPartId) {
      selectedPartId.value = newDevice.alarmPartId;
    }
    if (newDevice?.deviceId) {
      loadDeviceStats(newDevice.deviceId);
      loadPartList(newDevice.deviceId);
    }
  },
  { immediate: true }
);

watch(
  () => props.currentPart,
  newPart => {
    if (newPart?.partId) {
      selectedPartId.value = newPart.partId;
    } else {
      selectedPartId.value = null;
    }
  }
);
</script>

<style scoped>
.drawer-left-enter-active,
.drawer-left-leave-active {
  transition: transform 0.3s ease;
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  transform: translateX(-100%);
}
</style>
