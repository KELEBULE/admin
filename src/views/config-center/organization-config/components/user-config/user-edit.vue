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
          <NFormItem :label="$t('page.manage.user.userName')" path="userName">
            <NInput v-model:value="formData.userName" :placeholder="$t('page.manage.user.form.userName')" :disabled="!isAdd" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.user.gender')" path="gender">
            <NRadioGroup v-model:value="formData.gender">
              <NRadio v-for="item in dictOptions('gender')" :key="item.value" :value="item.value" :label="item.label" />
            </NRadioGroup>
          </NFormItem>
          <NFormItem :label="$t('page.manage.user.realName')" path="realName">
            <NInput v-model:value="formData.realName" :placeholder="$t('page.manage.user.form.realName')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.user.phone')" path="phone">
            <NInput v-model:value="formData.phone" :placeholder="$t('page.manage.user.form.phone')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.user.email')" path="email">
            <NInput v-model:value="formData.email" :placeholder="$t('page.manage.user.form.email')" clearable />
          </NFormItem>
          <NFormItem :label="$t('page.manage.user.status')" path="status">
            <NRadioGroup v-model:value="formData.status">
              <NRadio v-for="item in dictOptions('status')" :key="item.value" :value="item.value" :label="item.label" />
            </NRadioGroup>
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
import { ref, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { fetchAddUser, fetchGetEditUserInfo, fetchUpdateUserInfo } from '@/service/api/manage/user';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';

interface Props {
  row?: any;
  operateType?: 'add' | 'edit';
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

type Model = Api.SystemManage.UserEdit;

const formData = ref<Model>({
  id: '',
  userName: '',
  gender: '0',
  nickName: '',
  realName: '',
  phone: '',
  email: '',
  status: '1'
});

const rules: FormRules = {
  userName: [{ required: true, message: $t('page.manage.user.form.userName'), trigger: 'blur' }],
  realName: [{ required: true, message: $t('page.manage.user.form.realName'), trigger: 'blur' }],
  phone: [
    { required: true, message: $t('page.manage.user.form.phone'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: $t('page.manage.user.form.email'), trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  status: [{ required: true, message: $t('page.manage.user.form.status'), trigger: 'change' }]
};

const title = computed(() => {
  const titles: Record<string, string> = {
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

const isAdd = computed(() => props.operateType === 'add');

function createDefaultModel(): Model {
  return {
    id: '',
    userName: '',
    gender: '0',
    nickName: '',
    realName: '',
    phone: '',
    email: '',
    status: '1'
  };
}

async function handleInitModel() {
  formData.value = createDefaultModel();

  if (props.operateType === 'edit' && props.row) {
    const { error, data } = await fetchGetEditUserInfo(props.row.id);
    if (!error && data) {
      Object.assign(formData.value, data);
    }
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    const func = isAdd.value ? fetchAddUser : fetchUpdateUserInfo;
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
