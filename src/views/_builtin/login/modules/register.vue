<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="realName">
      <NInput v-model:value="model.realName" placeholder="请输入姓名" />
    </NFormItem>
    <NFormItem path="userName">
      <NInput v-model:value="model.userName" placeholder="请输入用户名" />
    </NFormItem>
    <NFormItem path="email">
      <NInput v-model:value="model.email" placeholder="请输入邮箱" />
    </NFormItem>
    <NFormItem path="code">
      <div class="w-full flex-y-center gap-16px">
        <NInput v-model:value="model.code" :placeholder="$t('page.login.common.codePlaceholder')" />
        <NButton size="large" :disabled="isCounting" :loading="loading" @click="getCaptcha(model.email)">
          {{ label }}
        </NButton>
      </div>
    </NFormItem>
    <NFormItem path="password">
      <NInput v-model:value="model.password" type="password" show-password-on="click" :placeholder="$t('page.login.common.passwordPlaceholder')" />
    </NFormItem>
    <NFormItem path="confirmPassword">
      <NInput
        v-model:value="model.confirmPassword"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
      />
    </NFormItem>
    <NSpace vertical :size="18" class="w-full">
      <NButton type="primary" size="large" round block @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { fetchRegisterByEmail } from '@/service/api/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useCaptcha } from '@/hooks/business/captcha';
import { $t } from '@/locales';
defineOptions({
  name: 'Register'
});
const { formRef, validate } = useNaiveForm();
const { label, isCounting, loading, getCaptcha } = useCaptcha();

interface FormModel {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
  realName: string;
  userName: string;
}

const model: FormModel = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  realName: '',
  userName: ''
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules, createConfirmPwdRule } = useFormRules();

  return {
    email: formRules.email,
    code: formRules.code,
    password: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.password),
    realName: formRules.realName,
    userName: formRules.userName
  };
});

async function handleSubmit() {
  await validate();
  // request to register
  try {
    const data = {
      email: model.email,
      code: model.code,
      password: model.password,
      realName: model.realName,
      userName: model.userName
    };
    const res = await fetchRegisterByEmail(data);
    if (res.data) {
      window.$message?.success('注册成功,等待管理员审核');
      // redirect to login page
      window.location.href = '/login';
    } else {
      window.$message?.error('注册失败');
    }
  } catch (error) {
    window.$message?.error(`注册失败,${error}`);
  }
}
</script>

<style scoped></style>
