<template>
  <NDrawer v-model:show="visible" :width="600" placement="right">
    <NDrawerContent :title="$t('page.detection.record.detail')" closable>
      <NSpin :show="loading">
        <NDescriptions label-placement="left" :column="1" bordered>
          <NDescriptionsItem :label="$t('page.detection.record.recordId')">
            {{ recordData?.recordId || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.deviceName')">
            {{ recordData?.deviceName || recordData?.deviceCode || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.partName')">
            {{ recordData?.partName || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.detectValue')">
            {{ recordData?.detectValue ?? '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.detectStatus')">
            <NTag :type="recordData?.detectStatus === 0 ? 'success' : 'error'">
              {{ recordData?.detectStatus === 0 ? $t('page.detection.record.statusNormal') : $t('page.detection.record.statusAbnormal') }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.isFalseAlarm')">
            <NTag :type="recordData?.isFalseAlarm === 1 ? 'warning' : 'success'">
              {{ recordData?.isFalseAlarm === 1 ? $t('page.detection.record.falseAlarmYes') : $t('page.detection.record.falseAlarmNo') }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.level1Value')">
            {{ recordData?.level1Value ?? '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.level2Value')">
            {{ recordData?.level2Value ?? '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.level3Value')">
            {{ recordData?.level3Value ?? '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.sensorCode')">
            {{ recordData?.sensorCode || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.dataSource')">
            {{ recordData?.dataSource || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.detection.record.detectTime')">
            {{ recordData?.detectTime || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('common.createTime')">
            {{ recordData?.createTime || '-' }}
          </NDescriptionsItem>
        </NDescriptions>
      </NSpin>
      <template #footer>
        <NButton @click="handleClose">{{ $t('common.close') }}</NButton>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent, NSpin, NTag } from 'naive-ui';
import { fetchGetDeviceDetectionRecord } from '@/service/api/detection';
import { $t } from '@/locales';

defineOptions({
  name: 'DetailDrawer'
});

interface Props {
  visible: boolean;
  recordData: Api.Detection.DeviceDetectionRecord | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
}>();

const visible = ref(props.visible);
const loading = ref(false);
const recordData = ref<Api.Detection.DeviceDetectionRecord | null>(props.recordData);

watch(
  () => props.visible,
  val => {
    visible.value = val;
    if (val && props.recordData?.recordId) {
      loadDetail(props.recordData.recordId);
    }
  }
);

watch(visible, val => {
  emit('update:visible', val);
});

async function loadDetail(id: number) {
  loading.value = true;
  const { data, error } = await fetchGetDeviceDetectionRecord(id);
  loading.value = false;
  if (!error && data) {
    recordData.value = data;
  }
}

function handleClose() {
  visible.value = false;
}
</script>

<style scoped></style>
