<template>
  <NDrawer v-model:show="visible" placement="right" :width="400" class="m-8px rounded-10px">
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
          <NFormItem :label="$t('page.manage.orgUnits.name')" path="name">
            <NInput v-model:value="formData.name" :placeholder="$t('page.manage.orgUnits.form.name')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.orgUnits.code')" path="code">
            <NInput v-model:value="formData.code" :placeholder="$t('page.manage.orgUnits.form.code')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.orgUnits.abbr')" path="abbr">
            <NInput v-model:value="formData.abbr" :placeholder="$t('page.manage.orgUnits.form.abbr')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.orgUnits.status')" path="status">
            <NRadioGroup v-model:value="formData.status">
              <NRadio v-for="item in dictOptions('status')" :key="item.value" :value="item.value" :label="item.label" />
            </NRadioGroup>
          </NFormItem>
          <NFormItem :label="$t('page.manage.orgUnits.sort')" path="sort">
            <NInputNumber v-model:value="formData.sort" :placeholder="$t('page.manage.orgUnits.form.sort')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.orgUnits.description')" path="description">
            <NInput
              v-model:value="formData.description"
              :placeholder="$t('page.manage.orgUnits.form.description')"
              type="textarea"
              :autosize="{
                minRows: 3,
                maxRows: 8
              }"
              clearable
            />
          </NFormItem>
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
import { computed, ref, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { fetchAddOrgUnits, fetchUpdateOrgUnits } from '@/service/api/manage/org-units';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';

interface Props {
  row?: any;
  operateType?: 'add' | 'edit' | 'addChild';
}

const props = withDefaults(defineProps<Props>(), {
  row: null,
  operateType: 'add'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const { dictOptions } = useDict();
const formRef = ref<FormInst | null>(null);

type Model = Api.SystemManage.OrgUnitsEdit;

const formData = ref<Model>({
  id: '0',
  parentId: 0,
  name: '',
  code: '',
  abbr: '',
  level: 1,
  ancestors: '0',
  description: '',
  sort: 1,
  status: '1'
});

const rules: FormRules = {
  name: [{ required: true, message: $t('page.manage.orgUnits.form.name'), trigger: 'blur' }],
  code: [{ required: true, message: $t('page.manage.orgUnits.form.code'), trigger: 'blur' }],
  status: [{ required: true, message: $t('page.manage.orgUnits.form.status'), trigger: 'change' }]
};

const title = computed(() => {
  const titles: Record<string, string> = {
    add: $t('page.manage.orgUnits.addOrgUnits'),
    edit: $t('page.manage.orgUnits.editOrgUnits'),
    addChild: $t('page.manage.orgUnits.addChildOrgUnits')
  };
  return titles[props.operateType];
});

const isAdd = computed(() => props.operateType === 'add' || props.operateType === 'addChild');

function createDefaultModel(): Model {
  return {
    id: '0',
    parentId: 0,
    name: '',
    code: '',
    abbr: '',
    level: 1,
    ancestors: '0',
    description: '',
    sort: 1,
    status: '1'
  };
}

function getLevelAndAncestors(row: any) {
  const level = (row.level || 0) + 1;
  const ancestors = row.ancestors ? `${row.ancestors},${row.id}` : `0,${row.id}`;
  return { level, ancestors };
}

async function handleInitModel() {
  formData.value = createDefaultModel();

  if (props.operateType === 'edit' && props.row) {
    Object.assign(formData.value, props.row);
  }

  if (props.operateType === 'addChild' && props.row) {
    const { id } = props.row;
    const { level, ancestors } = getLevelAndAncestors(props.row);
    Object.assign(formData.value, { parentId: id, level, ancestors });
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    const func = isAdd.value ? fetchAddOrgUnits : fetchUpdateOrgUnits;
    const { error, data } = await func(formData.value);
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
    handleInitModel();
    formRef.value?.restoreValidation();
  }
});
</script>

<style scoped></style>
