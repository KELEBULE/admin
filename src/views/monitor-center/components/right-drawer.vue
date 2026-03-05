<template>
  <div class="absolute top-0 right-0 h-full w-0 overflow-visible z-100">
    <Transition name="drawer-right">
      <div
        v-show="visible"
        class="absolute top-16px right-16px w-360px h-[calc(100%-32px)] bg-white/95 dark:bg-black/60 backdrop-blur-8px rounded-l-8px shadow-[-2px_0_8px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
      >
        <div class="px-16px py-16px border-b border-b-#a8c8e8 dark:border-b-white/10">
          <NFlex justify="space-between" align="center">
            <span class="text-16px font-500 text-#1b3a5a dark:text-white/90">{{ $t('page.monitor.monitorData') }}</span>
            <NTag v-if="currentPart" type="info" size="small" closable @close="handleClearPart">
              {{ $t('page.equipment.partTypeLabel') }}: {{ currentPart.partName }}
            </NTag>
          </NFlex>
        </div>
        <NScrollbar class="flex-1">
          <div class="px-12px py-8px">
            <NCollapse v-if="!currentPart">
              <NCollapseItem :title="$t('page.monitor.frequentAlarmParts')">
                <div class="h-250px">
                  <FrequentAlarmParts :device-id="currentDeviceId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
              <NCollapseItem :title="$t('page.monitor.frequentAlarmTime')">
                <div class="h-250px">
                  <FrequentAlarmTime :device-id="currentDeviceId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
              <NCollapseItem :title="$t('page.monitor.frequentAlarmLevel')">
                <div class="h-250px">
                  <AlarmLevelDistribution :device-id="currentDeviceId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
              <NCollapseItem :title="$t('page.monitor.temperatureTrend')">
                <div class="h-250px">
                  <TemperatureTrend :device-id="currentDeviceId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
              <NCollapseItem :title="$t('page.monitor.dailyAlarmTrend')">
                <div class="h-250px">
                  <DailyAlarmTrend :device-id="currentDeviceId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
            </NCollapse>
            <NCollapse v-else>
              <NCollapseItem :title="$t('page.monitor.temperatureTrend')">
                <div class="h-250px">
                  <PartTemperatureTrend :part-id="currentPart.partId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
              <NCollapseItem :title="$t('page.monitor.alarmTemperatureTrend')">
                <div class="h-250px">
                  <PartAlarmTemperatureTrend :part-id="currentPart.partId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
              <NCollapseItem :title="$t('page.monitor.hourlyAlarmDistribution')">
                <div class="h-250px">
                  <PartHourlyAlarmDistribution :part-id="currentPart.partId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
              <NCollapseItem :title="$t('page.monitor.frequentAlarmLevel')">
                <div class="h-250px">
                  <PartAlarmLevelDistribution :part-id="currentPart.partId" :start-time="startTime" :end-time="endTime" />
                </div>
              </NCollapseItem>
            </NCollapse>
          </div>
        </NScrollbar>
      </div>
    </Transition>

    <div
      class="absolute top-50% transform-translate-y--50% w-28px h-60px bg-white/95 dark:bg-black/60 rounded-l-8px flex items-center justify-center cursor-pointer shadow-[-2px_0_8px_rgba(0,0,0,0.1)] transition-all duration-300 z-99 hover:bg-#1890ff hover:text-white"
      :class="visible ? 'right-376px' : 'right-16px'"
      @click.stop="toggleDrawer"
    >
      <SvgIcon :icon="visible ? 'mdi:chevron-right' : 'mdi:chevron-left'" class="text-18px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import FrequentAlarmParts from './charts/frequent-alarm-parts.vue';
import FrequentAlarmTime from './charts/frequent-alarm-time.vue';
import AlarmLevelDistribution from './charts/alarm-level-distribution.vue';
import TemperatureTrend from './charts/temperature-trend.vue';
import DailyAlarmTrend from './charts/daily-alarm-trend.vue';
import PartTemperatureTrend from './charts/part-temperature-trend.vue';
import PartAlarmTemperatureTrend from './charts/part-alarm-temperature-trend.vue';
import PartHourlyAlarmDistribution from './charts/part-hourly-alarm-distribution.vue';
import PartAlarmLevelDistribution from './charts/part-alarm-level-distribution.vue';

const props = defineProps<{
  currentDeviceId: number | null;
  currentPart: Api.Equipment.DevicePart | null;
  dateRange: [number, number] | null;
}>();

const emit = defineEmits<{
  'clear-part': [];
}>();

const visible = ref(true);

function toggleDrawer() {
  visible.value = !visible.value;
}

function handleClearPart() {
  emit('clear-part');
}

const startTime = computed(() => {
  if (!props.dateRange) return '';
  const date = new Date(props.dateRange[0]);
  return formatLocalDateTime(date);
});

const endTime = computed(() => {
  if (!props.dateRange) return '';
  const date = new Date(props.dateRange[1]);
  return formatLocalDateTime(date);
});

function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
</script>

<style scoped>
.drawer-right-enter-active,
.drawer-right-leave-active {
  transition: transform 0.3s ease;
}

.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(100%);
}
</style>
