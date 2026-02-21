<template>
  <NDrawer v-model:show="visible" placement="right" :width="480" class="m-8px rounded-10px">
    <NDrawerContent closable>
      <template #header>{{ title }}</template>
      <NFlex vertical>
        <NForm
          ref="formRef"
          label-placement="left"
          label-width="auto"
          label-align="left"
          require-mark-placement="right-hanging"
          size="small"
          :rules="rules"
          :model="formData"
        >
          <template v-if="editType === 'factory'">
            <NFormItem :label="$t('page.equipment.factoryCode')" path="factoryCode">
              <NInput v-model:value="factoryFormData.factoryCode" :placeholder="$t('page.equipment.form.factoryCode')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.factoryName')" path="factoryName">
              <NInput v-model:value="factoryFormData.factoryName" :placeholder="$t('page.equipment.form.factoryName')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.factoryAddress')" path="factoryAddress">
              <NInput v-model:value="factoryFormData.factoryAddress" :placeholder="$t('page.equipment.form.factoryAddress')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.contactPerson')" path="contactPerson">
              <NInput v-model:value="factoryFormData.contactPerson" :placeholder="$t('page.equipment.form.contactPerson')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.contactPhone')" path="contactPhone">
              <NInput v-model:value="factoryFormData.contactPhone" :placeholder="$t('page.equipment.form.contactPhone')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.status')" path="status">
              <NSelect v-model:value="factoryFormData.status" :placeholder="$t('page.equipment.form.status')" :options="statusOptions" clearable />
            </NFormItem>
          </template>
          <template v-else-if="editType === 'area'">
            <NFormItem :label="$t('page.equipment.locationCode')" path="locationCode">
              <NInput v-model:value="areaFormData.locationCode" :placeholder="$t('page.equipment.form.locationCode')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.areaName')" path="areaName">
              <NInput v-model:value="areaFormData.areaName" :placeholder="$t('page.equipment.form.areaName')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.factoryName')" path="factoryId">
              <NSelect
                v-model:value="areaFormData.factoryId"
                :placeholder="$t('page.equipment.form.factoryName')"
                :options="factoryOptions"
                clearable
                filterable
              />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.areaStatus')" path="areaStatus">
              <NSelect
                v-model:value="areaFormData.areaStatus"
                :placeholder="$t('page.equipment.form.areaStatus')"
                :options="statusOptions"
                clearable
              />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.areaOrder')" path="areaOrder">
              <NInputNumber
                v-model:value="areaFormData.areaOrder"
                :placeholder="$t('page.equipment.form.areaOrder')"
                :min="0"
                clearable
                class="w-full"
              />
            </NFormItem>
          </template>
          <template v-else-if="editType === 'device'">
            <NFormItem :label="$t('page.equipment.deviceCode')" path="deviceCode">
              <NInput v-model:value="deviceFormData.deviceCode" :placeholder="$t('page.equipment.form.deviceCode')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.deviceName')" path="deviceName">
              <NInput v-model:value="deviceFormData.deviceName" :placeholder="$t('page.equipment.form.deviceName')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.areaName')" path="locationId">
              <NSelect
                v-model:value="deviceFormData.locationId"
                :placeholder="$t('page.equipment.form.areaName')"
                :options="areaOptions"
                clearable
                filterable
              />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.deviceModel')" path="deviceModel">
              <NInput v-model:value="deviceFormData.deviceModel" :placeholder="$t('page.equipment.form.deviceModel')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.deviceSn')" path="deviceSn">
              <NInput v-model:value="deviceFormData.deviceSn" :placeholder="$t('page.equipment.form.deviceSn')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.deviceStatus')" path="deviceStatus">
              <NSelect
                v-model:value="deviceFormData.deviceStatus"
                :placeholder="$t('page.equipment.form.deviceStatus')"
                :options="deviceStatusOptions"
                clearable
              />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.manufacturer')" path="manufacturer">
              <NInput v-model:value="deviceFormData.manufacturer" :placeholder="$t('page.equipment.form.manufacturer')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.installTime')" path="installTime">
              <NDatePicker
                v-model:value="deviceFormData.installTime"
                type="datetime"
                clearable
                class="w-full"
                :placeholder="$t('page.equipment.form.installTime')"
              />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.startUseTime')" path="startUseTime">
              <NDatePicker
                v-model:value="deviceFormData.startUseTime"
                type="datetime"
                clearable
                class="w-full"
                :placeholder="$t('page.equipment.form.startUseTime')"
              />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.maintainCycle')" path="maintainCycle">
              <NInputNumber
                v-model:value="deviceFormData.maintainCycle"
                :placeholder="$t('page.equipment.form.maintainCycle')"
                :min="0"
                clearable
                class="w-full"
              >
                <template #suffix>{{ $t('page.equipment.days') }}</template>
              </NInputNumber>
            </NFormItem>
            <NFormItem :label="$t('page.equipment.lastMaintainTime')" path="lastMaintainTime">
              <NDatePicker
                v-model:value="deviceFormData.lastMaintainTime"
                type="datetime"
                clearable
                class="w-full"
                :placeholder="$t('page.equipment.form.lastMaintainTime')"
              />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.warrantyPeriod')" path="warrantyPeriod">
              <NInputNumber
                v-model:value="deviceFormData.warrantyPeriod"
                :placeholder="$t('page.equipment.form.warrantyPeriod')"
                :min="0"
                clearable
                class="w-full"
              >
                <template #suffix>{{ $t('page.equipment.months') }}</template>
              </NInputNumber>
            </NFormItem>
            <NFormItem :label="$t('page.equipment.deviceNote')" path="deviceNote">
              <NInput
                v-model:value="deviceFormData.deviceNote"
                :placeholder="$t('page.equipment.form.deviceNote')"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 8 }"
                clearable
              />
            </NFormItem>
          </template>
          <template v-else>
            <NFormItem :label="$t('page.equipment.partCode')" path="partCode">
              <NInput v-model:value="partFormData.partCode" :placeholder="$t('page.equipment.form.partCode')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.partName')" path="partName">
              <NInput v-model:value="partFormData.partName" :placeholder="$t('page.equipment.form.partName')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.partType')" path="partType">
              <NInput v-model:value="partFormData.partType" :placeholder="$t('page.equipment.form.partType')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.monitorEnabled')" path="monitorEnabled">
              <NSwitch v-model:value="partFormData.monitorEnabled" :checked-value="1" :unchecked-value="0" />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.installPosition')" path="installPosition">
              <NInput v-model:value="partFormData.installPosition" :placeholder="$t('page.equipment.form.installPosition')" clearable />
            </NFormItem>
            <NFormItem :label="$t('page.equipment.partStatus')" path="partStatus">
              <NRadioGroup v-model:value="partFormData.partStatus">
                <NRadio v-for="item in dictOptions('status')" :key="item.value" :value="item.value" :label="item.label" />
              </NRadioGroup>
            </NFormItem>
          </template>
        </NForm>
      </NFlex>
      <template #footer>
        <NSpace reverse>
          <NButton @click="visible = false">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import dayjs from 'dayjs';
import {
  fetchAddDevice,
  fetchAddDevicePart,
  fetchAddFactoryArea,
  fetchAddFactoryInfo,
  fetchGetFactoryAreaList,
  fetchGetFactoryInfoList,
  fetchUpdateDevice,
  fetchUpdateDevicePart,
  fetchUpdateFactoryArea,
  fetchUpdateFactoryInfo
} from '@/service/api/equipment';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';

type OperateType = 'add' | 'edit' | 'addChild';
type EditType = 'factory' | 'area' | 'device' | 'part';

interface Props {
  row?: any;
  operateType?: OperateType;
  editType?: EditType;
}

const props = withDefaults(defineProps<Props>(), {
  row: null,
  operateType: 'add',
  editType: 'device'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const { dictOptions } = useDict();
const formRef = ref<FormInst | null>(null);

const statusOptions = [
  { label: $t('page.manage.common.status.enable'), value: 1 },
  { label: $t('page.manage.common.status.disable'), value: 0 }
];

const deviceStatusOptions = [
  { label: $t('page.equipment.statusNormal'), value: 1 },
  { label: $t('page.equipment.statusMaintenance'), value: 2 },
  { label: $t('page.equipment.statusFault'), value: 3 },
  { label: $t('page.equipment.statusScrapped'), value: 0 }
];

const factoryOptions = ref<{ label: string; value: number }[]>([]);
const areaOptions = ref<{ label: string; value: number }[]>([]);

async function loadOptions() {
  const { data: factoryList } = await fetchGetFactoryInfoList();
  if (factoryList) {
    factoryOptions.value = factoryList.map((item: any) => ({
      label: item.factoryName,
      value: item.factoryId
    }));
  }

  const { data: areaList } = await fetchGetFactoryAreaList();
  if (areaList) {
    areaOptions.value = areaList.map((item: any) => ({
      label: item.areaName,
      value: item.areaId
    }));
  }
}

interface FactoryFormData {
  factoryId: number | null;
  factoryCode: string;
  factoryName: string;
  factoryAddress: string;
  contactPerson: string;
  contactPhone: string;
  status: number | null;
}

interface AreaFormData {
  areaId: number | null;
  locationCode: string;
  areaName: string;
  factoryId: number | null;
  areaStatus: number | null;
  areaOrder: number | null;
}

interface DeviceFormData {
  deviceId: number | null;
  deviceCode: string;
  deviceName: string;
  deviceModel: string;
  deviceSn: string;
  deviceStatus: number | null;
  locationId: number | null;
  manufacturer: string;
  installTime: number | null;
  startUseTime: number | null;
  maintainCycle: number | null;
  lastMaintainTime: number | null;
  warrantyPeriod: number | null;
  deviceNote: string;
}

interface PartFormData {
  partId: number | null;
  partCode: string;
  partName: string;
  deviceId: number | null;
  partType: string;
  monitorEnabled: number;
  installPosition: string;
  partStatus: number;
}

const factoryFormData = ref<FactoryFormData>({
  factoryId: null,
  factoryCode: '',
  factoryName: '',
  factoryAddress: '',
  contactPerson: '',
  contactPhone: '',
  status: 1
});

const areaFormData = ref<AreaFormData>({
  areaId: null,
  locationCode: '',
  areaName: '',
  factoryId: null,
  areaStatus: 1,
  areaOrder: 0
});

const deviceFormData = ref<DeviceFormData>({
  deviceId: null,
  deviceCode: '',
  deviceName: '',
  deviceModel: '',
  deviceSn: '',
  deviceStatus: null,
  locationId: null,
  manufacturer: '',
  installTime: null,
  startUseTime: null,
  maintainCycle: null,
  lastMaintainTime: null,
  warrantyPeriod: null,
  deviceNote: ''
});

const partFormData = ref<PartFormData>({
  partId: null,
  partCode: '',
  partName: '',
  deviceId: null,
  partType: '',
  monitorEnabled: 1,
  installPosition: '',
  partStatus: 1
});

const formData = computed(() => {
  if (props.editType === 'factory') return factoryFormData.value;
  if (props.editType === 'area') return areaFormData.value;
  if (props.editType === 'device') return deviceFormData.value;
  return partFormData.value;
});

const factoryRules: FormRules = {
  factoryCode: [{ required: true, message: $t('page.equipment.form.factoryCode'), trigger: 'blur' }],
  factoryName: [{ required: true, message: $t('page.equipment.form.factoryName'), trigger: 'blur' }]
};

const areaRules: FormRules = {
  locationCode: [{ required: true, message: $t('page.equipment.form.locationCode'), trigger: 'blur' }],
  areaName: [{ required: true, message: $t('page.equipment.form.areaName'), trigger: 'blur' }]
};

const deviceRules: FormRules = {
  deviceCode: [{ required: true, message: $t('page.equipment.form.deviceCode'), trigger: 'blur' }],
  deviceName: [{ required: true, message: $t('page.equipment.form.deviceName'), trigger: 'blur' }],
  deviceStatus: [
    {
      required: true,
      type: 'number',
      message: $t('page.equipment.form.deviceStatus'),
      trigger: ['change', 'blur']
    }
  ]
};

const partRules: FormRules = {
  partCode: [{ required: true, message: $t('page.equipment.form.partCode'), trigger: 'blur' }],
  partName: [{ required: true, message: $t('page.equipment.form.partName'), trigger: 'blur' }]
};

const rules = computed(() => {
  if (props.editType === 'factory') return factoryRules;
  if (props.editType === 'area') return areaRules;
  if (props.editType === 'device') return deviceRules;
  return partRules;
});

const title = computed(() => {
  if (props.editType === 'factory') {
    const titles: Record<string, string> = {
      add: $t('page.equipment.addFactory'),
      edit: $t('page.equipment.editFactory')
    };
    return titles[props.operateType] || $t('page.equipment.addFactory');
  }
  if (props.editType === 'area') {
    const titles: Record<string, string> = {
      add: $t('page.equipment.addArea'),
      edit: $t('page.equipment.editArea')
    };
    return titles[props.operateType] || $t('page.equipment.addArea');
  }
  if (props.editType === 'device') {
    const titles: Record<string, string> = {
      add: $t('page.equipment.addDevice'),
      edit: $t('page.equipment.editDevice')
    };
    return titles[props.operateType] || $t('page.equipment.addDevice');
  }
  const titles: Record<string, string> = {
    add: $t('page.equipment.addPart'),
    edit: $t('page.equipment.editPart'),
    addChild: $t('page.equipment.addChildPart')
  };
  return titles[props.operateType] || $t('page.equipment.addPart');
});

const isAdd = computed(() => props.operateType === 'add' || props.operateType === 'addChild');

function parseTimeToTimestamp(time: string | number | null): number | null {
  if (!time) return null;
  if (typeof time === 'number') return time;
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.valueOf() : null;
}

function resetFactoryForm() {
  factoryFormData.value = {
    factoryId: null,
    factoryCode: '',
    factoryName: '',
    factoryAddress: '',
    contactPerson: '',
    contactPhone: '',
    status: 1
  };
}

function resetAreaForm() {
  areaFormData.value = {
    areaId: null,
    locationCode: '',
    areaName: '',
    factoryId: null,
    areaStatus: 1,
    areaOrder: 0
  };
}

function resetDeviceForm() {
  deviceFormData.value = {
    deviceId: null,
    deviceCode: '',
    deviceName: '',
    deviceModel: '',
    deviceSn: '',
    deviceStatus: null,
    locationId: null,
    manufacturer: '',
    installTime: null,
    startUseTime: null,
    maintainCycle: null,
    lastMaintainTime: null,
    warrantyPeriod: null,
    deviceNote: ''
  };
}

function resetPartForm() {
  partFormData.value = {
    partId: null,
    partCode: '',
    partName: '',
    deviceId: null,
    partType: '',
    monitorEnabled: 1,
    installPosition: '',
    partStatus: 1
  };
}

function initFactoryEditData(row: any) {
  factoryFormData.value = {
    factoryId: row.factoryId || null,
    factoryCode: row.factoryCode || '',
    factoryName: row.factoryName || '',
    factoryAddress: row.factoryAddress || '',
    contactPerson: row.contactPerson || '',
    contactPhone: row.contactPhone || '',
    status: row.status ?? 1
  };
}

function initAreaEditData(row: any) {
  areaFormData.value = {
    areaId: row.areaId || null,
    locationCode: row.locationCode || '',
    areaName: row.areaName || '',
    factoryId: row.factoryId || null,
    areaStatus: row.areaStatus ?? 1,
    areaOrder: row.areaOrder ?? 0
  };
}

function initDeviceEditData(row: any) {
  deviceFormData.value = {
    deviceId: row.deviceId || null,
    deviceCode: row.deviceCode || '',
    deviceName: row.deviceName || '',
    deviceModel: row.deviceModel || '',
    deviceSn: row.deviceSn || '',
    deviceStatus: row.deviceStatus ?? null,
    locationId: row.locationId || null,
    manufacturer: row.manufacturer || '',
    installTime: parseTimeToTimestamp(row.installTime),
    startUseTime: parseTimeToTimestamp(row.startUseTime),
    maintainCycle: row.maintainCycle ?? null,
    lastMaintainTime: parseTimeToTimestamp(row.lastMaintainTime),
    warrantyPeriod: row.warrantyPeriod ?? null,
    deviceNote: row.deviceNote || ''
  };
}

function initPartEditData(row: any) {
  partFormData.value = {
    partId: row.partId || null,
    partCode: row.partCode || '',
    partName: row.partName || '',
    deviceId: row.deviceId || null,
    partType: row.partType || '',
    monitorEnabled: row.monitorEnabled ?? 1,
    installPosition: row.installPosition || '',
    partStatus: row.partStatus ?? 1
  };
}

async function handleInitModel() {
  if (props.editType === 'factory') {
    resetFactoryForm();
    if (props.operateType === 'edit' && props.row) {
      initFactoryEditData(props.row);
    }
  } else if (props.editType === 'area') {
    resetAreaForm();
    if (props.operateType === 'edit' && props.row) {
      initAreaEditData(props.row);
    }
  } else if (props.editType === 'device') {
    resetDeviceForm();
    if (props.operateType === 'edit' && props.row) {
      initDeviceEditData(props.row);
    }
    if (props.operateType === 'addChild' && props.row?.locationId) {
      deviceFormData.value.locationId = props.row.locationId;
    }
  } else {
    resetPartForm();
    if (props.operateType === 'edit' && props.row) {
      initPartEditData(props.row);
    }
    if ((props.operateType === 'add' || props.operateType === 'addChild') && props.row?.deviceId) {
      partFormData.value.deviceId = props.row.deviceId;
    }
  }
}

function formatTimeForSubmit(time: number | null): string | null {
  if (!time) return null;
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    let result: any;

    if (props.editType === 'factory') {
      const func = isAdd.value ? fetchAddFactoryInfo : fetchUpdateFactoryInfo;
      result = await func(factoryFormData.value as any);
    } else if (props.editType === 'area') {
      const func = isAdd.value ? fetchAddFactoryArea : fetchUpdateFactoryArea;
      result = await func(areaFormData.value as any);
    } else if (props.editType === 'device') {
      const submitData = {
        ...deviceFormData.value,
        installTime: formatTimeForSubmit(deviceFormData.value.installTime),
        startUseTime: formatTimeForSubmit(deviceFormData.value.startUseTime),
        lastMaintainTime: formatTimeForSubmit(deviceFormData.value.lastMaintainTime)
      };
      const func = isAdd.value ? fetchAddDevice : fetchUpdateDevice;
      result = await func(submitData as any);
    } else {
      const func = isAdd.value ? fetchAddDevicePart : fetchUpdateDevicePart;
      result = await func(partFormData.value as any);
    }

    const { error, data } = result;
    if (!error && data) {
      window.$message?.success(isAdd.value ? $t('common.addSuccess') : $t('common.updateSuccess'));
      visible.value = false;
      emit('submitted');
    }
  } catch (error) {
    console.error('Form validation failed:', error);
  }
}

watch(visible, () => {
  if (visible.value) {
    loadOptions();
    handleInitModel();
    formRef.value?.restoreValidation();
  }
});

onMounted(() => {
  loadOptions();
});
</script>

<style scoped></style>
