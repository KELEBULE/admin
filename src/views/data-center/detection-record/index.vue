<template>
  <div>
    <NFlex class="rounded-10px p-8px h-full w-full bg-container">
      <CommonTable
        ref="tableRef"
        class="h-full w-full"
        :columns="columns"
        :url="URL"
        :search-field-list="fieldList"
        method="get"
        row-key="recordId"
      />
      <DetailDrawer v-model:visible="detailVisible" :record-data="currentRecord" />
    </NFlex>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import type { DataTableColumn } from 'naive-ui';
import { NButton, NTag } from 'naive-ui';
import { $t } from '@/locales';
import CommonTable from '@/components/common/common-table/index.vue';
import DetailDrawer from './components/detail-drawer.vue';

defineOptions({
  name: 'DetectionRecordPage'
});

const tableRef = ref<any>(null);
const URL = ref('/device_detection_record/page');

const detailVisible = ref(false);
const currentRecord = ref<Api.Detection.DeviceDetectionRecord | null>(null);

const fieldList = ref([
  {
    label: $t('page.detection.record.deviceName'),
    value: 'deviceName',
    span: 6,
    component: 'n-input',
    placeholder: $t('page.detection.record.form.deviceName')
  },
  {
    label: $t('page.detection.record.detectStatus'),
    value: 'detectStatus',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.detection.record.statusNormal'), value: 0 },
        { label: $t('page.detection.record.statusAbnormal'), value: 2 }
      ]
    }
  },
  {
    label: $t('page.detection.record.isFalseAlarm'),
    value: 'isFalseAlarm',
    span: 6,
    component: 'n-select',
    extraProps: {
      clearable: true,
      options: [
        { label: $t('page.detection.record.falseAlarmYes'), value: 1 },
        { label: $t('page.detection.record.falseAlarmNo'), value: 0 }
      ]
    }
  },
  {
    label: $t('page.detection.record.sensorCode'),
    value: 'sensorCode',
    span: 6,
    component: 'n-input',
    placeholder: $t('page.detection.record.form.sensorCode')
  }
]);

const columns = ref<DataTableColumn[]>([
  {
    key: 'recordId',
    title: $t('page.detection.record.recordId'),
    width: 100,
    align: 'center'
  },
  {
    key: 'deviceName',
    title: $t('page.detection.record.deviceName'),
    width: 150,
    align: 'center',
    render: (row: any) => <span>{row.deviceName || row.deviceCode || '-'}</span>
  },
  {
    key: 'partName',
    title: $t('page.detection.record.partName'),
    width: 120,
    align: 'center',
    render: (row: any) => <span>{row.partName || '-'}</span>
  },
  {
    key: 'detectValue',
    title: $t('page.detection.record.detectValue'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{row.detectValue ?? '-'}</span>
  },
  {
    key: 'detectStatus',
    title: $t('page.detection.record.detectStatus'),
    width: 100,
    align: 'center',
    render: (row: any) => (
      <NTag type={row.detectStatus === 0 ? 'success' : 'error'}>
        {row.detectStatus === 0 ? $t('page.detection.record.statusNormal') : $t('page.detection.record.statusAbnormal')}
      </NTag>
    )
  },
  {
    key: 'isFalseAlarm',
    title: $t('page.detection.record.isFalseAlarm'),
    width: 100,
    align: 'center',
    render: (row: any) => (
      <NTag type={row.isFalseAlarm === 1 ? 'warning' : 'success'}>
        {row.isFalseAlarm === 1 ? $t('page.detection.record.falseAlarmYes') : $t('page.detection.record.falseAlarmNo')}
      </NTag>
    )
  },
  {
    key: 'level1Value',
    title: $t('page.detection.record.level1Value'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{row.level1Value ?? '-'}</span>
  },
  {
    key: 'level2Value',
    title: $t('page.detection.record.level2Value'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{row.level2Value ?? '-'}</span>
  },
  {
    key: 'level3Value',
    title: $t('page.detection.record.level3Value'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{row.level3Value ?? '-'}</span>
  },
  {
    key: 'sensorCode',
    title: $t('page.detection.record.sensorCode'),
    width: 120,
    align: 'center',
    render: (row: any) => <span>{row.sensorCode || '-'}</span>
  },
  {
    key: 'dataSource',
    title: $t('page.detection.record.dataSource'),
    width: 100,
    align: 'center',
    render: (row: any) => <span>{row.dataSource || '-'}</span>
  },
  {
    key: 'detectTime',
    title: $t('page.detection.record.detectTime'),
    width: 170,
    align: 'center'
  },
  {
    key: 'action',
    title: $t('common.operate'),
    width: 100,
    align: 'center',
    fixed: 'right',
    render: (row: any) => {
      return (
        <NButton type="primary" text size="small" onClick={() => handleViewDetail(row)}>
          {$t('page.detection.record.viewDetail')}
        </NButton>
      );
    }
  }
]);

function handleViewDetail(row: Api.Detection.DeviceDetectionRecord) {
  currentRecord.value = row;
  detailVisible.value = true;
}
</script>

<style scoped></style>
