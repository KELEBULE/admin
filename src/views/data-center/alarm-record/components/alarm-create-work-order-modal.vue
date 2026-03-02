<template>
  <NModal v-model:show="visible" preset="card" :title="$t('page.alarm.record.createWorkOrder')" class="w-600px" :mask-closable="false">
    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="120">
      <NFormItem :label="$t('page.alarm.record.alarmCode')">
        <NInput :value="alarmData?.alarmCode" disabled />
      </NFormItem>
      <NFormItem :label="$t('page.workorder.devicePart')">
        <NInput :value="devicePartLabel" disabled />
      </NFormItem>
      <NFormItem :label="$t('page.workorder.orderType')" path="orderType">
        <NSelect v-model:value="formData.orderType" :options="orderTypeOptions" :placeholder="$t('page.workorder.form.orderType')" />
      </NFormItem>
      <NFormItem :label="$t('page.workorder.faultTime')" path="faultTime">
        <NDatePicker v-model:value="faultTimeValue" type="datetime" clearable class="w-full" :placeholder="$t('page.workorder.form.faultTime')" />
      </NFormItem>
      <NFormItem :label="$t('page.workorder.faultDescription')" path="faultDescription">
        <NInput v-model:value="formData.faultDescription" type="textarea" :rows="3" :placeholder="$t('page.workorder.form.faultDescription')" />
      </NFormItem>
      <NFormItem :label="$t('page.workorder.repairRequirement')" path="repairRequirement">
        <NInput v-model:value="formData.repairRequirement" type="textarea" :rows="2" :placeholder="$t('page.workorder.form.repairRequirement')" />
      </NFormItem>
      <NFormItem :label="$t('page.workorder.priority')" path="priority">
        <NSelect v-model:value="formData.priority" :options="priorityOptions" :placeholder="$t('page.workorder.form.priority')" />
      </NFormItem>
      <NFormItem :label="$t('page.workorder.assigneeId')" path="assigneeId">
        <RemoteSelect
          v-model:value="formData.assigneeId"
          url="/sys_user/page"
          label-field="realName"
          value-field="id"
          :placeholder="$t('page.workorder.form.assigneeId')"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchCreateWorkOrder } from '@/service/api/alarm';
import { $t } from '@/locales';

defineOptions({ name: 'AlarmCreateWorkOrderModal' });

interface Props {
  visible: boolean;
  alarmData: Api.Alarm.DeviceAlarm | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  success: [];
}>();

const visible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val)
});

const formRef = ref<FormInst>();
const submitting = ref(false);
const faultTimeValue = ref<number | null>(null);

const formData = reactive({
  alarmId: 0,
  orderType: 1,
  faultTime: '',
  faultDescription: '',
  repairRequirement: '',
  priority: 2,
  assigneeId: undefined as number | undefined
});

const rules: FormRules = {
  orderType: [{ required: true, type: 'number', message: $t('page.workorder.form.orderType'), trigger: 'change' }],
  faultDescription: [{ required: true, message: $t('page.workorder.form.faultDescription'), trigger: 'blur' }]
};

const orderTypeOptions = computed(() => [
  { label: $t('page.workorder.orderTypes.repair'), value: 1 },
  { label: $t('page.workorder.orderTypes.maintenance'), value: 2 },
  { label: $t('page.workorder.orderTypes.inspection'), value: 3 },
  { label: $t('page.workorder.orderTypes.calibration'), value: 4 }
]);

const priorityOptions = computed(() => [
  { label: $t('page.workorder.priorities.urgent'), value: 1 },
  { label: $t('page.workorder.priorities.high'), value: 2 },
  { label: $t('page.workorder.priorities.medium'), value: 3 },
  { label: $t('page.workorder.priorities.low'), value: 4 }
]);

const devicePartLabel = computed(() => {
  if (!props.alarmData) return '-';
  const parts = [props.alarmData.deviceName, props.alarmData.partName].filter(Boolean);
  return parts.join(' / ') || '-';
});

watch(
  () => props.visible,
  val => {
    if (val && props.alarmData) {
      formData.alarmId = props.alarmData.alarmId;
      formData.orderType = 1;
      formData.faultTime = props.alarmData.alarmTime || '';
      formData.faultDescription = `报警编码: ${props.alarmData.alarmCode}\n当前值: ${props.alarmData.currentValue}\n阈值: ${props.alarmData.thresholdValue || '-'}`;
      formData.repairRequirement = '';
      formData.priority = 4;
      formData.assigneeId = undefined;
      faultTimeValue.value = props.alarmData.alarmTime ? dayjs(props.alarmData.alarmTime).valueOf() : null;
    }
  }
);

const handleSubmit = async () => {
  await formRef.value?.validate();

  submitting.value = true;
  try {
    const submitData: Api.Alarm.DeviceAlarmCreateWorkOrderParams = {
      alarmId: formData.alarmId,
      orderType: formData.orderType,
      faultTime: faultTimeValue.value ? dayjs(faultTimeValue.value).format('YYYY-MM-DD HH:mm:ss') : undefined,
      faultDescription: formData.faultDescription,
      repairRequirement: formData.repairRequirement || undefined,
      priority: formData.priority,
      assigneeId: formData.assigneeId
    };

    const { error, data: result } = await fetchCreateWorkOrder(submitData);
    if (!error && result) {
      window.$message?.success($t('common.addSuccess'));
      visible.value = false;
      emit('success');
    }
  } finally {
    submitting.value = false;
  }
};
</script>
