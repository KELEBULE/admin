<template>
  <NDrawer v-model:show="visible" placement="right" :width="600" class="m-8px rounded-10px">
    <NDrawerContent closable>
      <template #header>{{ $t('page.equipment.detail') }}</template>
      <NTabs v-model:value="activeTab" type="line">
        <NTabPane name="info" :tab="$t('page.equipment.viewDetail')">
          <template v-if="detailType === 'device'">
            <NDescriptions label-placement="left" :column="1" bordered size="small">
              <NDescriptionsItem :label="$t('page.equipment.deviceCode')">
                {{ detailData.deviceCode || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.deviceName')">
                {{ detailData.deviceName || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.deviceModel')">
                {{ detailData.deviceModel || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.deviceSn')">
                {{ detailData.deviceSn || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.deviceStatus')">
                <NTag :type="getStatusType(detailData.deviceStatus)">
                  {{ getStatusText(detailData.deviceStatus) }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.manufacturer')">
                {{ detailData.manufacturer || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.installTime')">
                {{ formatTime(detailData.installTime) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.startUseTime')">
                {{ formatTime(detailData.startUseTime) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.totalWorkHours')">
                <template v-if="detailData.totalWorkHours !== null && detailData.totalWorkHours !== undefined">
                  <NTag type="info">{{ detailData.totalWorkHours }} {{ $t('page.equipment.hours') }}</NTag>
                </template>
                <template v-else>-</template>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.maintainCycle')">
                {{ detailData.maintainCycle ? `${detailData.maintainCycle} ${$t('page.equipment.days')}` : '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.lastMaintainTime')">
                {{ formatTime(detailData.lastMaintainTime) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.warrantyPeriod')">
                {{ detailData.warrantyPeriod ? `${detailData.warrantyPeriod} ${$t('page.equipment.months')}` : '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.deviceNote')">
                {{ detailData.deviceNote || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('common.createTime')">
                {{ formatTime(detailData.createTime) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('common.updateTime')">
                {{ formatTime(detailData.updateTime) }}
              </NDescriptionsItem>
            </NDescriptions>
          </template>
          <template v-else>
            <NDescriptions label-placement="left" :column="1" bordered size="small">
              <NDescriptionsItem :label="$t('page.equipment.partCode')">
                {{ detailData.partCode || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.partName')">
                {{ detailData.partName || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.partType')">
                {{ detailData.partType || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.monitorEnabled')">
                <NTag :type="detailData.monitorEnabled === 1 ? 'success' : 'info'">
                  {{ detailData.monitorEnabled === 1 ? $t('page.equipment.monitorEnabledYes') : $t('page.equipment.monitorEnabledNo') }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.installPosition')">
                {{ detailData.installPosition || '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.equipment.partStatus')">
                <NTag :type="detailData.partStatus === 1 ? 'success' : 'error'">
                  {{ detailData.partStatus === 1 ? $t('page.manage.common.status.enable') : $t('page.manage.common.status.disable') }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('common.createTime')">
                {{ formatTime(detailData.createTime) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('common.updateTime')">
                {{ formatTime(detailData.updateTime) }}
              </NDescriptionsItem>
            </NDescriptions>
          </template>
        </NTabPane>
        <NTabPane v-if="detailType === 'device'" name="statusLog" :tab="$t('page.equipment.statusLog.title')">
          <NSpin :show="loadingLogs">
            <NTimeline>
              <NTimelineItem v-for="log in statusLogs" :key="log.logId" :type="getLogType(log.toStatus)" :title="getLogTitle(log)">
                <div class="text-sm text-gray-500">
                  <p class="mb-1">
                    <span class="font-medium">{{ $t('page.equipment.statusLog.fromStatus') }}:</span>
                    <NTag size="small" :type="getStatusType(log.fromStatus)" class="ml-1">
                      {{ log.fromStatusName }}
                    </NTag>
                    <span class="mx-2">→</span>
                    <span class="font-medium">{{ $t('page.equipment.statusLog.toStatus') }}:</span>
                    <NTag size="small" :type="getStatusType(log.toStatus)" class="ml-1">
                      {{ log.toStatusName }}
                    </NTag>
                  </p>
                  <p v-if="log.changeReason" class="mb-1">
                    <span class="font-medium">{{ $t('page.equipment.statusLog.changeReason') }}:</span>
                    {{ log.changeReason }}
                  </p>
                  <div v-if="getImageUrls(log.imageUrls).length > 0" class="mb-2">
                    <span class="font-medium">{{ $t('page.equipment.statusLog.imageUrls') }}:</span>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <NImage
                        v-for="(url, index) in getImageUrls(log.imageUrls)"
                        :key="index"
                        :src="url"
                        :preview-src="url"
                        width="60"
                        height="60"
                        object-fit="cover"
                        class="rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <p v-if="log.relatedOrderCode" class="mb-1">
                    <span class="font-medium">{{ $t('page.equipment.statusLog.relatedOrder') }}:</span>
                    {{ log.relatedOrderCode }}
                  </p>
                  <p class="mb-1">
                    <span class="font-medium">{{ $t('page.equipment.statusLog.operator') }}:</span>
                    {{ log.operatorName || '-' }}
                  </p>
                  <p>
                    <span class="font-medium">{{ $t('page.equipment.statusLog.changeTime') }}:</span>
                    {{ formatTime(log.createTime) }}
                  </p>
                </div>
              </NTimelineItem>
            </NTimeline>
            <NEmpty v-if="!statusLogs.length && !loadingLogs" :description="$t('page.equipment.statusLog.noRecords')" />
          </NSpin>
        </NTabPane>
      </NTabs>
      <template #footer>
        <NButton @click="visible = false">{{ $t('common.close') }}</NButton>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import { fetchDeviceStatusLogs } from '@/service/api/equipment';
import { $t } from '@/locales';

type DetailType = 'device' | 'part';

interface Props {
  row?: any;
  detailType?: DetailType;
}

const props = withDefaults(defineProps<Props>(), {
  row: null,
  detailType: 'device'
});

const visible = defineModel<boolean>('visible', { default: false });
const detailData = ref<any>({});
const activeTab = ref('info');
const statusLogs = ref<any[]>([]);
const loadingLogs = ref(false);

function getStatusType(status: number): 'success' | 'warning' | 'error' | 'info' {
  const statusMap: Record<number, 'success' | 'warning' | 'error' | 'info'> = {
    1: 'success',
    2: 'warning',
    0: 'info'
  };
  return statusMap[status] || 'info';
}

function getStatusText(status: number) {
  const statusMap: Record<number, string> = {
    1: $t('page.equipment.statusNormal'),
    2: $t('page.equipment.statusMaintenance'),
    0: $t('page.equipment.statusDisabled')
  };
  return statusMap[status] || '-';
}

function formatTime(time: string | number | null): string {
  if (!time) return '-';
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-';
}

function getLogType(toStatus: number): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const typeMap: Record<number, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    1: 'success',
    2: 'warning',
    0: 'error'
  };
  return typeMap[toStatus] || 'default';
}

function getLogTitle(log: any): string {
  return `${log.fromStatusName} → ${log.toStatusName}`;
}

function getImageUrls(imageUrls: string | string[] | undefined): string[] {
  if (!imageUrls) return [];
  if (Array.isArray(imageUrls)) return imageUrls;
  return imageUrls.split(',').filter(url => url.trim());
}

async function loadStatusLogs(deviceId: number) {
  loadingLogs.value = true;
  try {
    const { error, data } = await fetchDeviceStatusLogs(deviceId);
    if (!error && data) {
      statusLogs.value = data;
    }
  } finally {
    loadingLogs.value = false;
  }
}

watch(
  () => props.row,
  () => {
    if (props.row) {
      detailData.value = { ...props.row };
      if (props.detailType === 'device' && props.row.deviceId) {
        loadStatusLogs(props.row.deviceId);
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped></style>
