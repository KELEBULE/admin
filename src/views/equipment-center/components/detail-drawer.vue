<template>
  <NDrawer v-model:show="visible" placement="right" :width="520" class="m-8px rounded-10px">
    <NDrawerContent closable>
      <template #header>{{ $t('page.equipment.detail') }}</template>
      <NFlex vertical>
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
      </NFlex>
      <template #footer>
        <NButton @click="visible = false">{{ $t('common.close') }}</NButton>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
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

function getStatusType(status: number): 'success' | 'warning' | 'error' | 'info' {
  const statusMap: Record<number, 'success' | 'warning' | 'error' | 'info'> = {
    1: 'success',
    2: 'warning',
    3: 'error',
    0: 'info'
  };
  return statusMap[status] || 'info';
}

function getStatusText(status: number) {
  const statusMap: Record<number, string> = {
    1: $t('page.equipment.statusNormal'),
    2: $t('page.equipment.statusMaintenance'),
    3: $t('page.equipment.statusFault'),
    0: $t('page.equipment.statusScrapped')
  };
  return statusMap[status] || '-';
}

function formatTime(time: string | number | null): string {
  if (!time) return '-';
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-';
}

watch(
  () => props.row,
  () => {
    if (props.row) {
      detailData.value = { ...props.row };
    }
  },
  { immediate: true }
);
</script>

<style scoped></style>
