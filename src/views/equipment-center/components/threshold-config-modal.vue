<template>
  <NModal v-model:show="visible" preset="card" :title="$t('page.equipment.thresholdConfig')" class="w-650px" :mask-closable="false">
    <NSpin :show="loading">
      <NFlex vertical>
        <div class="mb-10px">
          <NText depth="3">
            {{ $t('page.equipment.partName') }}: {{ configData?.partName || '-' }} ({{ $t('page.equipment.partCode') }}:
            {{ configData?.partCode || '-' }})
          </NText>
        </div>
        <NForm
          ref="formRef"
          label-placement="left"
          label-width="auto"
          label-align="left"
          require-mark-placement="right-hanging"
          size="small"
          :model="formData"
        >
          <NDivider>{{ $t('page.equipment.level1Alarm') }}</NDivider>
          <NGrid :cols="2" :x-gap="16">
            <NGridItem>
              <NFormItem :label="$t('page.equipment.operator')">
                <NSelect v-model:value="formData.level1Operator" :options="operatorOptions" clearable />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem :label="$t('page.equipment.thresholdValue')">
                <NInputNumber v-model:value="formData.level1Value" :placeholder="$t('page.equipment.form.thresholdValue')" clearable class="w-full" />
              </NFormItem>
            </NGridItem>
          </NGrid>

          <NDivider>{{ $t('page.equipment.level2Alarm') }}</NDivider>
          <NGrid :cols="2" :x-gap="16">
            <NGridItem>
              <NFormItem :label="$t('page.equipment.operator')">
                <NSelect v-model:value="formData.level2Operator" :options="operatorOptions" clearable />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem :label="$t('page.equipment.thresholdValue')">
                <NInputNumber v-model:value="formData.level2Value" :placeholder="$t('page.equipment.form.thresholdValue')" clearable class="w-full" />
              </NFormItem>
            </NGridItem>
          </NGrid>

          <NDivider>{{ $t('page.equipment.level3Alarm') }}</NDivider>
          <NGrid :cols="2" :x-gap="16">
            <NGridItem>
              <NFormItem :label="$t('page.equipment.operator')">
                <NSelect v-model:value="formData.level3Operator" :options="operatorOptions" clearable />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem :label="$t('page.equipment.thresholdValue')">
                <NInputNumber v-model:value="formData.level3Value" :placeholder="$t('page.equipment.form.thresholdValue')" clearable class="w-full" />
              </NFormItem>
            </NGridItem>
          </NGrid>

          <NDivider>{{ $t('page.equipment.otherConfig') }}</NDivider>
          <NGrid :cols="2" :x-gap="16">
            <NGridItem>
              <NFormItem :label="$t('page.equipment.checkInterval')">
                <NInputNumber
                  v-model:value="formData.checkInterval"
                  :placeholder="$t('page.equipment.form.checkInterval')"
                  :min="1"
                  clearable
                  class="w-full"
                >
                  <template #suffix>{{ $t('page.equipment.seconds') }}</template>
                </NInputNumber>
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem :label="$t('page.equipment.configStatus')">
                <NSwitch v-model:value="formData.configStatus" :checked-value="1" :unchecked-value="0">
                  <template #checked>{{ $t('page.manage.common.status.enable') }}</template>
                  <template #unchecked>{{ $t('page.manage.common.status.disable') }}</template>
                </NSwitch>
              </NFormItem>
            </NGridItem>
          </NGrid>
        </NForm>
      </NFlex>
    </NSpin>
    <template #footer>
      <NSpace reverse>
        <NButton @click="visible = false">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormInst } from 'naive-ui';
import { fetchGetPartThresholdConfig, fetchSavePartThresholdConfig } from '@/service/api/equipment';
import { $t } from '@/locales';

defineOptions({
  name: 'ThresholdConfigModal'
});

interface Props {
  partData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  partData: null
});

const visible = defineModel<boolean>('visible', { default: false });

const loading = ref(false);
const submitting = ref(false);
const formRef = ref<FormInst | null>(null);
const configData = ref<Api.Equipment.PartThresholdConfig | null>(null);

const formData = ref<Api.Equipment.PartThresholdConfigDTO>({
  partId: 0,
  level1Operator: undefined,
  level1Value: undefined,
  level2Operator: undefined,
  level2Value: undefined,
  level3Operator: undefined,
  level3Value: undefined,
  checkInterval: 60,
  configStatus: 1
});

const operatorOptions = [
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '=', value: '=' }
];

async function loadConfig() {
  if (!props.partData?.partId) return;
  loading.value = true;
  const { data } = await fetchGetPartThresholdConfig(props.partData.partId);
  loading.value = false;
  if (data) {
    configData.value = data;
    formData.value = {
      partId: data.partId,
      level1Operator: data.level1Operator || undefined,
      level1Value: data.level1Value || undefined,
      level2Operator: data.level2Operator || undefined,
      level2Value: data.level2Value || undefined,
      level3Operator: data.level3Operator || undefined,
      level3Value: data.level3Value || undefined,
      checkInterval: data.checkInterval || 60,
      configStatus: data.configStatus ?? 1
    };
  } else {
    configData.value = null;
    formData.value = {
      partId: props.partData.partId,
      level1Operator: undefined,
      level1Value: undefined,
      level2Operator: undefined,
      level2Value: undefined,
      level3Operator: undefined,
      level3Value: undefined,
      checkInterval: 60,
      configStatus: 1
    };
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    const { error, data } = await fetchSavePartThresholdConfig(formData.value);
    submitting.value = false;
    if (!error && data) {
      window.$message?.success($t('common.saveSuccess'));
      visible.value = false;
    }
  } catch (error) {
    console.error('Form validation failed:', error);
  }
}

watch(visible, val => {
  if (val) {
    loadConfig();
  } else {
    configData.value = null;
  }
});
</script>

<style scoped></style>
