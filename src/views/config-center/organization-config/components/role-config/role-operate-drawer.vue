<template>
  <NDrawer v-model:show="visible" placement="right" :width="400" class="m-8px rounded-10px">
    <NDrawerContent closable>
      <template #header>{{ title }}</template>
      <NFlex>
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
          <NFormItem :label="$t('page.manage.role.roleName')" path="roleName">
            <NInput v-model:value="formData.roleName" :placeholder="$t('page.manage.role.form.roleName')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.role.roleCode')" path="roleCode">
            <NInput v-model:value="formData.roleCode" :placeholder="$t('page.manage.role.form.roleCode')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.role.status')" path="status">
            <NRadioGroup v-model:value="formData.status">
              <NRadio v-for="item in dictOptions('status')" :key="item.value" :value="item.value" :label="item.label" />
            </NRadioGroup>
          </NFormItem>
          <NFormItem :label="$t('page.manage.role.description')" path="description">
            <NInput
              v-model:value="formData.description"
              :placeholder="$t('page.manage.role.form.description')"
              type="textarea"
              :autosize="{
                minRows: 3,
                maxRows: 8
              }"
              clearable
            />
          </NFormItem>
          <NFormItem :label="$t('page.manage.role.sort')" path="sort">
            <NInputNumber v-model:value="formData.sort" :placeholder="$t('page.manage.role.form.sort')" clearable />
          </NFormItem>
        </NForm>
      </NFlex>
      <template #footer>
        <NSpace reverse>
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { fetchAddRole, fetchUpdateRoleInfo } from '@/service/api/manage/role';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** type of operation */
  operateType: NaiveUI.TableOperateType;
  /** edit row data */
  rowData?: Api.SystemManage.Role | null;
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
const formRef = ref<FormInst | null>(null);

type Model = Api.SystemManage.RoleEdit;

const formData = ref<Model>({
  id: '',
  roleName: '',
  roleCode: '',
  description: '',
  status: '1',
  sort: 1
});

const rules: FormRules = {
  roleName: [{ required: true, message: $t('page.manage.role.form.roleName'), trigger: 'blur' }],
  roleCode: [{ required: true, message: $t('page.manage.role.form.roleCode'), trigger: 'blur' }],
  status: [{ required: true, message: $t('page.manage.role.form.status'), trigger: 'change' }]
};

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.manage.role.addRole'),
    edit: $t('page.manage.role.editRole')
  };
  return titles[props.operateType];
});

const isEdit = computed(() => props.operateType === 'edit');

function createDefaultModel(): Model {
  return {
    id: '',
    roleName: '',
    roleCode: '',
    description: '',
    status: '1',
    sort: 1
  };
}

async function handleInitModel() {
  formData.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(formData.value, props.rowData);
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    const func = isEdit.value ? fetchUpdateRoleInfo : fetchAddRole;
    const { error, data } = await func(formData.value);
    if (!error && data) {
      window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
      visible.value = false;
      emit('submitted');
    }
  } catch (error) {
    console.error('Form validation failed:', error);
  }
}

function closeDrawer() {
  visible.value = false;
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    formRef.value?.restoreValidation();
  }
});
</script>

<style scoped></style>
