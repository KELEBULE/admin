<template>
  <NDrawer v-model:show="visible" :width="600" placement="right" :title="title">
    <NDrawerContent>
      <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="120">
        <NFormItem :label="$t('page.workorder.orderType')" path="orderType">
          <NSelect v-model:value="formData.orderType" :options="orderTypeOptions" :placeholder="$t('page.workorder.form.orderType')" />
        </NFormItem>
        <NFormItem :label="$t('page.workorder.devicePart')" path="deviceId" class="w-full">
          <DeviceCascaderSelect v-model:value="formData.deviceId" />
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
        <NFormItem :label="$t('page.workorder.planStartTime')" path="planStartTime">
          <NDatePicker
            v-model:value="planStartTimeValue"
            type="datetime"
            clearable
            class="w-full"
            :placeholder="$t('page.workorder.form.planStartTime')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.workorder.planEndTime')" path="planEndTime">
          <NDatePicker
            v-model:value="planEndTimeValue"
            type="datetime"
            clearable
            class="w-full"
            :placeholder="$t('page.workorder.form.planEndTime')"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace>
          <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchAddWorkOrder, fetchUpdateWorkOrder } from '@/service/api/workorder';
import { $t } from '@/locales';
import DeviceCascaderSelect from './DeviceCascaderSelect.vue';

defineOptions({
  name: 'EditDrawer'
});

const props = defineProps<{
  visible: boolean;
  row: any;
  operateType: 'add' | 'edit';
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  submitted: [];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
});

const title = computed(() => {
  return props.operateType === 'add' ? $t('page.workorder.addWorkOrder') : $t('page.workorder.editWorkOrder');
});

const formRef = ref<FormInst | null>(null);
const loading = ref(false);

const faultTimeValue = ref<number | null>(null);
const planStartTimeValue = ref<number | null>(null);
const planEndTimeValue = ref<number | null>(null);

const formData = ref({
  orderId: undefined as number | undefined,
  orderType: 1,
  deviceId: undefined as number | undefined,
  faultTime: undefined as string | undefined,
  faultDescription: '',
  repairRequirement: '',
  priority: 2,
  assigneeId: undefined as number | undefined,
  planStartTime: undefined as string | undefined,
  planEndTime: undefined as string | undefined
});

const rules: FormRules = {
  orderType: [{ required: true, type: 'number', message: $t('page.workorder.form.orderType'), trigger: 'change' }],
  deviceId: [{ required: true, type: 'number', message: $t('page.workorder.form.deviceId'), trigger: 'change' }],
  faultDescription: [{ required: true, message: $t('page.workorder.form.faultDescription'), trigger: 'blur' }]
};

const orderTypeOptions = [
  { label: $t('page.workorder.orderTypes.repair'), value: 1 },
  { label: $t('page.workorder.orderTypes.maintenance'), value: 2 },
  { label: $t('page.workorder.orderTypes.inspection'), value: 3 },
  { label: $t('page.workorder.orderTypes.calibration'), value: 4 }
];

const priorityOptions = [
  { label: $t('page.workorder.priorities.urgent'), value: 1 },
  { label: $t('page.workorder.priorities.high'), value: 2 },
  { label: $t('page.workorder.priorities.medium'), value: 3 },
  { label: $t('page.workorder.priorities.low'), value: 4 }
];

watch(
  () => props.visible,
  val => {
    if (val) {
      if (props.operateType === 'edit' && props.row) {
        formData.value = {
          orderId: props.row.orderId,
          orderType: props.row.orderType || 1,
          deviceId: props.row.deviceId,
          faultTime: props.row.faultTime,
          faultDescription: props.row.faultDescription || '',
          repairRequirement: props.row.repairRequirement || '',
          priority: props.row.priority || 2,
          assigneeId: props.row.assigneeId,
          planStartTime: props.row.planStartTime,
          planEndTime: props.row.planEndTime
        };
        faultTimeValue.value = props.row.faultTime ? dayjs(props.row.faultTime).valueOf() : null;
        planStartTimeValue.value = props.row.planStartTime ? dayjs(props.row.planStartTime).valueOf() : null;
        planEndTimeValue.value = props.row.planEndTime ? dayjs(props.row.planEndTime).valueOf() : null;
      } else {
        resetForm();
      }
    }
  }
);

function resetForm() {
  formData.value = {
    orderId: undefined,
    orderType: 1,
    deviceId: undefined,
    faultTime: undefined,
    faultDescription: '',
    repairRequirement: '',
    priority: 2,
    assigneeId: undefined,
    planStartTime: undefined,
    planEndTime: undefined
  };
  faultTimeValue.value = null;
  planStartTimeValue.value = null;
  planEndTimeValue.value = null;
}

function handleClose() {
  visible.value = false;
  resetForm();
}

async function handleSubmit() {
  await formRef.value?.validate();

  formData.value.faultTime = faultTimeValue.value ? dayjs(faultTimeValue.value).format('YYYY-MM-DD HH:mm:ss') : undefined;
  formData.value.planStartTime = planStartTimeValue.value ? dayjs(planStartTimeValue.value).format('YYYY-MM-DD HH:mm:ss') : undefined;
  formData.value.planEndTime = planEndTimeValue.value ? dayjs(planEndTimeValue.value).format('YYYY-MM-DD HH:mm:ss') : undefined;

  loading.value = true;
  try {
    const submitData = {
      ...formData.value,
      deviceId: formData.value.deviceId!,
      orderId: formData.value.orderId!
    };
    const { error, data: result } = props.operateType === 'add' ? await fetchAddWorkOrder(submitData) : await fetchUpdateWorkOrder(submitData);

    if (!error && result) {
      window.$message?.success(props.operateType === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'));
      handleClose();
      emit('submitted');
    }
  } finally {
    loading.value = false;
  }
}
</script>
