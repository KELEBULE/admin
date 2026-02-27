<template>
  <NModal v-model:show="visible" preset="card" :title="title" class="w-600px" :mask-closable="false">
    <NSpin :show="loading">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NFormItem :label="$t('page.alarm.ruleCode')" path="ruleCode">
          <NInput v-model:value="model.ruleCode" :placeholder="$t('page.alarm.form.ruleCode')" />
        </NFormItem>
        <NFormItem :label="$t('page.alarm.ruleName')" path="ruleName">
          <NInput v-model:value="model.ruleName" :placeholder="$t('page.alarm.form.ruleName')" />
        </NFormItem>
        <NFormItem :label="$t('page.alarm.deviceSelect')" path="deviceIds">
          <DeviceTreeSelect v-model:value="model.deviceIds" />
        </NFormItem>
        <NFormItem :label="$t('page.alarm.alarmLevels.title')" path="alarmLevels">
          <NCheckboxGroup v-model:value="alarmLevelValues">
            <NSpace>
              <NCheckbox v-for="item in alarmLevelOptions" :key="item.value" :value="item.value" :label="item.label" />
            </NSpace>
          </NCheckboxGroup>
        </NFormItem>
        <NFormItem :label="$t('page.alarm.notifyTarget')" path="notifyTargetIds">
          <NotifyTargetSelect v-model:notify-target-ids="model.notifyTargetIds" />
        </NFormItem>
        <NFormItem :label="$t('page.alarm.remark')" path="remark">
          <NInput v-model:value="model.remark" type="textarea" :placeholder="$t('page.alarm.form.remark')" />
        </NFormItem>
        <NFormItem :label="$t('page.alarm.ruleStatus')" path="ruleStatus">
          <NRadioGroup v-model:value="model.ruleStatus">
            <NRadio v-for="item in dictOptions('status')" :key="item.value" :value="Number(item.value)" :label="item.label" />
          </NRadioGroup>
        </NFormItem>
      </NForm>
    </NSpin>
    <template #footer>
      <NSpace justify="end">
        <NButton quaternary @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { fetchAddAlarmRule, fetchUpdateAlarmRule } from '@/service/api/alarm';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import DeviceTreeSelect from './device-tree-select.vue';
import NotifyTargetSelect from './notify-target-select.vue';

defineOptions({
  name: 'AlarmRuleOperateModal'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Alarm.AlarmRule | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { dictOptions } = useDict();

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const loading = ref(false);
const submitting = ref(false);

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.alarm.addRule'),
    edit: $t('page.alarm.editRule')
  };
  return titles[props.operateType];
});

type Model = Api.Alarm.AlarmRuleEdit;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    ruleId: undefined,
    ruleCode: '',
    ruleName: '',
    deviceIds: [],
    alarmLevels: [1, 2, 3],
    notifyTargetIds: [],
    ruleStatus: 1,
    remark: ''
  };
}

type RuleKey = Exclude<keyof Model, 'ruleId' | 'deviceIds' | 'notifyTargetIds' | 'remark'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  ruleCode: defaultRequiredRule,
  ruleName: defaultRequiredRule,
  alarmLevels: defaultRequiredRule,
  ruleStatus: defaultRequiredRule
};

const isEdit = computed(() => props.operateType === 'edit');

const alarmLevelOptions = computed(() => [
  { label: $t('page.alarm.alarmLevels.level1'), value: 1 },
  { label: $t('page.alarm.alarmLevels.level2'), value: 2 },
  { label: $t('page.alarm.alarmLevels.level3'), value: 3 }
]);

const alarmLevelValues = computed({
  get: () => {
    return model.alarmLevels || [];
  },
  set: (values: number[]) => {
    model.alarmLevels = values.sort((a, b) => a - b);
  }
});

function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, {
      ruleId: props.rowData.ruleId,
      ruleCode: props.rowData.ruleCode,
      ruleName: props.rowData.ruleName,
      deviceIds: props.rowData.deviceIds || [],
      alarmLevels: props.rowData.alarmLevels || [1, 2, 3],
      notifyTargetIds: props.rowData.notifyTargetIds || [],
      ruleStatus: props.rowData.ruleStatus,
      remark: props.rowData.remark || ''
    });
  }
}

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  submitting.value = true;
  try {
    const func = isEdit.value ? fetchUpdateAlarmRule : fetchAddAlarmRule;
    const { error, data } = await func(model);
    if (!error && data) {
      window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
      closeModal();
      emit('submitted');
    }
  } finally {
    submitting.value = false;
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<style scoped></style>
