<template>
  <NModal v-model:show="visible" preset="card" :title="$t('page.equipment.thresholdConfig')" class="w-750px" :mask-closable="false">
    <NFlex vertical>
      <div class="mb-10px flex items-center justify-between">
        <NText depth="3">
          {{ $t('page.equipment.partName') }}: {{ partData?.partName || '-' }} ({{ $t('page.equipment.partCode') }}: {{ partData?.partCode || '-' }})
        </NText>
        <NButton type="primary" size="small" @click="handleAdd">
          {{ $t('common.add') }}
        </NButton>
      </div>
      <NDataTable :columns="columns" :data="configList" :loading="loading" :pagination="false" size="small" :row-key="row => row.id" />
    </NFlex>

    <NModal v-model:show="showEditModal" preset="card" :title="editTitle" class="w-500px" :mask-closable="false">
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
        <NFormItem :label="$t('page.equipment.configName')" path="configName">
          <NInput v-model:value="formData.configName" :placeholder="$t('page.equipment.form.configName')" clearable />
        </NFormItem>
        <NFormItem :label="$t('page.equipment.tempMin')" path="tempMin">
          <NInputNumber v-model:value="formData.tempMin" :placeholder="$t('page.equipment.form.tempMin')" clearable class="w-full" />
        </NFormItem>
        <NFormItem :label="$t('page.equipment.tempMax')" path="tempMax">
          <NInputNumber v-model:value="formData.tempMax" :placeholder="$t('page.equipment.form.tempMax')" clearable class="w-full" />
        </NFormItem>
        <NFormItem :label="$t('page.equipment.warningMin')" path="warningMin">
          <NInputNumber v-model:value="formData.warningMin" :placeholder="$t('page.equipment.form.warningMin')" clearable class="w-full" />
        </NFormItem>
        <NFormItem :label="$t('page.equipment.warningMax')" path="warningMax">
          <NInputNumber v-model:value="formData.warningMax" :placeholder="$t('page.equipment.form.warningMax')" clearable class="w-full" />
        </NFormItem>
        <NFormItem :label="$t('page.equipment.checkInterval')" path="checkInterval">
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
        <NFormItem :label="$t('page.equipment.configStatus')" path="configStatus">
          <NSwitch v-model:value="formData.configStatus" :checked-value="1" :unchecked-value="0">
            <template #checked>{{ $t('page.manage.common.status.enable') }}</template>
            <template #unchecked>{{ $t('page.manage.common.status.disable') }}</template>
          </NSwitch>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace reverse>
          <NButton @click="showEditModal = false">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NModal>
  </NModal>
</template>

<script setup lang="tsx">
import { computed, ref, watch } from 'vue';
import type { DataTableColumn, FormInst, FormRules } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NSwitch, NTag } from 'naive-ui';
import {
  fetchAddPartThresholdConfig,
  fetchDeletePartThresholdConfig,
  fetchGetPartThresholdConfigList,
  fetchUpdatePartThresholdConfig
} from '@/service/api/equipment';
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
const configList = ref<Api.Equipment.PartThresholdConfig[]>([]);
const showEditModal = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const formRef = ref<FormInst | null>(null);

const formData = ref<Api.Equipment.PartThresholdConfigEdit>({
  id: undefined,
  partId: 0,
  configName: '',
  tempMin: undefined,
  tempMax: undefined,
  warningMin: undefined,
  warningMax: undefined,
  checkInterval: 60,
  configStatus: 1
});

const rules: FormRules = {
  configName: [{ required: true, message: $t('page.equipment.form.configName'), trigger: 'blur' }]
};

const editTitle = computed(() => {
  return operateType.value === 'add' ? $t('page.equipment.addThresholdConfig') : $t('page.equipment.editThresholdConfig');
});

const columns: DataTableColumn[] = [
  {
    key: 'configName',
    title: $t('page.equipment.configName'),
    width: 120,
    align: 'center'
  },
  {
    key: 'tempRange',
    title: $t('page.equipment.tempRange'),
    width: 140,
    align: 'center',
    render: (row: any) => {
      if (row.tempMin === null && row.tempMax === null) return '-';
      return `${row.tempMin ?? '-'} ~ ${row.tempMax ?? '-'}`;
    }
  },
  {
    key: 'warningRange',
    title: $t('page.equipment.warningRange'),
    width: 140,
    align: 'center',
    render: (row: any) => {
      if (row.warningMin === null && row.warningMax === null) return '-';
      return `${row.warningMin ?? '-'} ~ ${row.warningMax ?? '-'}`;
    }
  },
  {
    key: 'checkInterval',
    title: $t('page.equipment.checkInterval'),
    width: 100,
    align: 'center',
    render: (row: any) => `${row.checkInterval || 60}${$t('page.equipment.seconds')}`
  },
  {
    key: 'configStatus',
    title: $t('page.equipment.configStatus'),
    width: 80,
    align: 'center',
    render: (row: any) => (
      <NTag type={row.configStatus === 1 ? 'success' : 'default'}>
        {row.configStatus === 1 ? $t('page.manage.common.status.enable') : $t('page.manage.common.status.disable')}
      </NTag>
    )
  },
  {
    key: 'action',
    title: $t('common.operate'),
    width: 120,
    align: 'center',
    render: (row: any) => (
      <NSpace justify="center">
        <NButton type="info" text size="small" onClick={() => handleEdit(row)}>
          {$t('common.edit')}
        </NButton>
        <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
          {{
            default: () => $t('common.confirmDelete'),
            trigger: () => (
              <NButton type="error" text size="small">
                {$t('common.delete')}
              </NButton>
            )
          }}
        </NPopconfirm>
      </NSpace>
    )
  }
];

async function loadConfigList() {
  if (!props.partData?.partId) return;
  loading.value = true;
  const { data } = await fetchGetPartThresholdConfigList(props.partData.partId);
  loading.value = false;
  configList.value = data || [];
}

function handleAdd() {
  operateType.value = 'add';
  formData.value = {
    id: undefined,
    partId: props.partData?.partId,
    configName: '',
    tempMin: undefined,
    tempMax: undefined,
    warningMin: undefined,
    warningMax: undefined,
    checkInterval: 60,
    configStatus: 1
  };
  showEditModal.value = true;
}

function handleEdit(row: any) {
  operateType.value = 'edit';
  formData.value = {
    id: row.id,
    partId: row.partId,
    configName: row.configName,
    tempMin: row.tempMin,
    tempMax: row.tempMax,
    warningMin: row.warningMin,
    warningMax: row.warningMax,
    checkInterval: row.checkInterval,
    configStatus: row.configStatus
  };
  showEditModal.value = true;
}

async function handleDelete(id: number) {
  const { error, data } = await fetchDeletePartThresholdConfig({ ids: [String(id)] });
  if (!error && data) {
    window.$message?.success($t('common.deleteSuccess'));
    loadConfigList();
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    const func = operateType.value === 'add' ? fetchAddPartThresholdConfig : fetchUpdatePartThresholdConfig;
    const { error, data } = await func(formData.value);
    if (!error && data) {
      window.$message?.success(operateType.value === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'));
      showEditModal.value = false;
      loadConfigList();
    }
  } catch (error) {
    console.error('Form validation failed:', error);
  }
}

watch(visible, val => {
  if (val) {
    loadConfigList();
  } else {
    configList.value = [];
  }
});
</script>

<style scoped></style>
