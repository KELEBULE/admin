<template>
  <NDrawer v-model:show="visible" :width="500" placement="right" :title="flowTitle">
    <NDrawerContent>
      <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="120">
        <NFormItem v-if="flowType === 'assign'" :label="$t('page.workorder.assigneeId')" path="assigneeId">
          <RemoteSelect
            v-model:value="formData.assigneeId"
            url="/sys_user/page"
            label-field="realName"
            value-field="id"
            :placeholder="$t('page.workorder.form.assigneeId')"
          />
        </NFormItem>

        <template v-if="flowType === 'complete'">
          <NFormItem :label="$t('page.workorder.handleDuration')" path="handleDuration">
            <NInputNumber v-model:value="formData.handleDuration" :min="0" :placeholder="$t('page.workorder.form.handleDuration')" class="w-full">
              <template #suffix>分钟</template>
            </NInputNumber>
          </NFormItem>
          <NFormItem :label="$t('page.workorder.repairResult')" path="repairResult">
            <NInput v-model:value="formData.repairResult" type="textarea" :rows="3" :placeholder="$t('page.workorder.form.repairResult')" />
          </NFormItem>
          <NFormItem :label="$t('page.workorder.repairCost')" path="repairCost">
            <NInputNumber
              v-model:value="formData.repairCost"
              :min="0"
              :precision="2"
              :placeholder="$t('page.workorder.form.repairCost')"
              class="w-full"
            >
              <template #prefix>¥</template>
            </NInputNumber>
          </NFormItem>
          <NFormItem :label="$t('page.workorder.spareParts')" path="spareParts">
            <NInput v-model:value="formData.spareParts" type="textarea" :rows="2" :placeholder="$t('page.workorder.form.spareParts')" />
          </NFormItem>
        </template>

        <NFormItem v-if="flowType === 'review'" :label="$t('page.workorder.reviewResult')" path="reviewResult">
          <NInput v-model:value="formData.reviewResult" type="textarea" :rows="3" :placeholder="$t('page.workorder.form.reviewResult')" />
        </NFormItem>

        <template v-if="flowType === 'evaluate'">
          <NFormItem :label="$t('page.workorder.evaluationScore')" path="evaluationScore">
            <NRate v-model:value="formData.evaluationScore" :count="5" allow-half />
          </NFormItem>
          <NFormItem :label="$t('page.workorder.evaluationRemark')" path="evaluationRemark">
            <NInput v-model:value="formData.evaluationRemark" type="textarea" :rows="2" :placeholder="$t('page.workorder.form.evaluationRemark')" />
          </NFormItem>
        </template>

        <NFormItem :label="$t('page.workorder.form.remark')" path="remark">
          <NInput v-model:value="formData.remark" type="textarea" :rows="2" :placeholder="$t('page.workorder.form.remark')" />
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
import type { FormInst, FormItemRule, FormRules } from 'naive-ui';
import { fetchFlowWorkOrder } from '@/service/api/workorder';
import { $t } from '@/locales';
import RemoteSelect from '@/components/common/common-form/components/RemoteSelect.vue';

defineOptions({
  name: 'FlowDrawer'
});

const props = defineProps<{
  visible: boolean;
  row: any;
  flowType: 'start' | 'complete' | 'review' | 'cancel' | 'assign' | 'evaluate';
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  submitted: [];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
});

const flowTitle = computed(() => {
  const titleMap: Record<string, string> = {
    start: $t('page.workorder.startProcess'),
    complete: $t('page.workorder.completeProcess'),
    review: $t('page.workorder.passReview'),
    cancel: $t('page.workorder.cancelOrder'),
    assign: $t('page.workorder.assignHandler'),
    evaluate: $t('page.workorder.evaluate')
  };
  return titleMap[props.flowType] || '';
});

const formRef = ref<FormInst | null>(null);
const loading = ref(false);

const formData = ref({
  orderId: undefined as number | undefined,
  targetStatus: undefined as number | undefined,
  assigneeId: undefined as number | undefined,
  remark: '',
  handleDuration: undefined as number | undefined,
  repairResult: '',
  repairCost: undefined as number | undefined,
  spareParts: '',
  reviewResult: '',
  evaluationScore: undefined as number | undefined,
  evaluationRemark: ''
});

const rules = computed<FormRules>(() => ({
  assigneeId: [
    {
      required: props.flowType === 'assign',
      message: $t('page.workorder.form.assigneeId'),
      trigger: 'change'
    }
  ],
  evaluationScore: [
    {
      required: props.flowType === 'evaluate',
      validator: (_rule: FormItemRule, value: number) => {
        if (props.flowType === 'evaluate' && (!value || value <= 0)) {
          return new Error($t('page.workorder.form.evaluationScore'));
        }
        return true;
      },
      trigger: 'change'
    }
  ]
}));

watch(
  () => props.visible,
  val => {
    if (val) {
      resetForm();
      if (props.row?.orderId) {
        formData.value.orderId = props.row.orderId;
      }

      const statusMap: Record<string, number> = {
        start: 1,
        complete: 2,
        review: 3,
        cancel: 4,
        assign: 0,
        evaluate: 3
      };
      formData.value.targetStatus = statusMap[props.flowType];
    }
  }
);

function resetForm() {
  formData.value = {
    orderId: undefined,
    targetStatus: undefined,
    assigneeId: undefined,
    remark: '',
    handleDuration: undefined,
    repairResult: '',
    repairCost: undefined,
    spareParts: '',
    reviewResult: '',
    evaluationScore: undefined,
    evaluationRemark: ''
  };
}

function handleClose() {
  visible.value = false;
  resetForm();
}

async function handleSubmit() {
  await formRef.value?.validate();

  loading.value = true;
  try {
    const submitData: any = {
      orderId: formData.value.orderId,
      targetStatus: formData.value.targetStatus,
      remark: formData.value.remark
    };

    if (props.flowType === 'assign') {
      submitData.assigneeId = formData.value.assigneeId;
      submitData.targetStatus = undefined;
    }

    if (props.flowType === 'complete') {
      submitData.handleDuration = formData.value.handleDuration;
      submitData.repairResult = formData.value.repairResult;
      submitData.repairCost = formData.value.repairCost;
      submitData.spareParts = formData.value.spareParts;
    }

    if (props.flowType === 'review') {
      submitData.reviewResult = formData.value.reviewResult;
    }

    if (props.flowType === 'evaluate') {
      submitData.evaluationScore = formData.value.evaluationScore;
      submitData.evaluationRemark = formData.value.evaluationRemark;
      submitData.targetStatus = undefined;
    }

    const { error, data: result } = await fetchFlowWorkOrder(submitData);

    if (!error && result) {
      window.$message?.success($t('common.updateSuccess'));
      handleClose();
      emit('submitted');
    }
  } finally {
    loading.value = false;
  }
}
</script>
