<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="userName">
      <NInput v-model:value="model.userName" size="medium" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        size="medium"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NSpace vertical :size="24">
      <NButton type="primary" size="large" block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
    </NSpace>
    <div class="flex w-full justify-between items-center mt-8px">
      <NCheckbox v-model:checked="rememberMe" @update:checked="handleRememberMeChange">记住我</NCheckbox>
      <NText type="primary">忘记密码？</NText>
    </div>
  </NForm>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { sha256 } from '@/utils/crypto';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdLogin'
});

const STORAGE_KEY = 'login_remember_me';
const authStore = useAuthStore();
const { formRef, validate } = useNaiveForm();
const rememberMe = ref(false);

interface FormModel {
  userName: string;
  password: string;
}

const model: FormModel = reactive({
  userName: '',
  password: ''
});

function handleRememberMeChange(checked: boolean) {
  if (checked) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        userName: model.userName,
        password: model.password
      })
    );
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

onMounted(() => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const { userName, password } = JSON.parse(savedData);
      if (userName && password) {
        model.userName = userName;
        model.password = password;
        rememberMe.value = true;
      }
    } catch (error) {
      console.error('Failed to parse saved login data:', error);
    }
  }
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd
  };
});

async function handleSubmit() {
  await validate();
  if (rememberMe.value) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        userName: model.userName,
        password: model.password
      })
    );
  }
  await authStore.login(model.userName, sha256(model.password));
}
</script>

<style scoped></style>
