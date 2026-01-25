<template>
  <NFlex class="h-full w-full">
    <NGrid :cols="3" class="w-full h-full" x-gap="16px">
      <NGridItem :span="1" class="h-full">
        <NFlex class="h-full w-full items-center justify-center" :size="0">
          <div class="w-full flex flex-col items-center justify-center">
            <NImage :src="userInfo.avatar" class="w-100px h-100px rounded-full"></NImage>
            <NText class="text-24px font-bold">{{ userInfo.username }}</NText>
            <NText class="text-10px text-gray-500">
              上次登录时间：{{ userInfo.lastLoginTime ? new Date(userInfo.lastLoginTime).toLocaleString() : '未登录' }}
            </NText>
            <NText class="text-10px text-gray-500">
              账号创建时间：{{ userInfo.createTime ? new Date(userInfo.createTime).toLocaleString() : '未创建' }}
            </NText>
            <NText class="text-12px text-blue-400 cursor-pointer" @click="edit = true">编辑</NText>
          </div>
        </NFlex>
      </NGridItem>
      <NGridItem :span="2" class="h-full">
        <NCard class="h-full">
          <NFlex v-if="edit" vertical class="w-full h-full" :size="0">
            <NForm ref="formRef" :model="userInfo" class="w-full h-full" size="small" :rules="rules">
              <NFormItem label="姓名：" :label-width="100" label-placement="left" label-align="left" size="small" path="realName">
                <NInput v-model:value="userInfo.realName" placeholder="请输入真实姓名" clearable></NInput>
              </NFormItem>
              <NFormItem label="性别：" :label-width="100" label-placement="left" label-align="left" size="small" path="gender">
                <NSelect v-model:value="userInfo.gender" :options="genderOptions" placeholder="请选择性别" clearable></NSelect>
              </NFormItem>
              <NFormItem label="手机号：" :label-width="100" label-placement="left" label-align="left" size="small" path="phone">
                <NInput v-model:value="userInfo.phone" placeholder="请输入手机号" clearable></NInput>
              </NFormItem>
              <NFormItem label="邮箱：" :label-width="100" label-placement="left" label-align="left" size="small" path="email">
                <NInput v-model:value="userInfo.email" placeholder="请输入邮箱" clearable></NInput>
              </NFormItem>
              <NFormItem label="验证码：" :label-width="100" label-placement="left" label-align="left" size="small" path="code">
                <NInput v-model:value="userInfo.code" placeholder="请输入邮箱验证码"></NInput>
                <NButton v-if="!wait" class="ml-10px" @click="sendCode">获取验证码</NButton>
                <NButton v-else class="ml-10px">{{ countdown }}秒后重新获取</NButton>
              </NFormItem>
              <NFormItem label="操作：" :label-width="100" label-placement="left" label-align="left" size="small">
                <NFlex class="w-full flex items-center justify-center">
                  <NButton type="default" @click="save">保存</NButton>
                  <NButton type="primary" class="ml-10px" @click="cancel">取消</NButton>
                </NFlex>
              </NFormItem>
            </NForm>
          </NFlex>
          <NFlex v-else class="w-full h-full items-center justify-center" :size="0">
            <div class="w-full flex flex-col justify-center">
              <NText class="text-16px">姓名: {{ userInfo.realName }}</NText>
              <NDivider />
              <NText class="text-16px">性别: {{ userInfo.gender }}</NText>
              <NDivider />
              <NText class="text-16px">手机: {{ userInfo.phone }}</NText>
              <NDivider />
              <NText class="text-16px">邮箱: {{ userInfo.email }}</NText>
            </div>
          </NFlex>
        </NCard>
      </NGridItem>
    </NGrid>
  </NFlex>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { FormInst } from 'naive-ui';
import { fetchSendEmail, fetchVerifyEmail } from '@/service/api/manage/email';
import { fetchGetEditUserInfo, fetchUpdateUserInfo } from '@/service/api/manage/user';
import { useAuthStore } from '@/store/modules/auth';

const genderOptions = [
  { label: '男', value: '1' },
  { label: '女', value: '2' }
];
const formRef = ref<FormInst | null>(null);
const userInfo = ref({
  avatar: '',
  username: '',
  phone: '',
  lastLoginTime: 0,
  createTime: 0,
  realName: '',
  gender: '',
  email: '',
  code: ''
});
const edit = ref(false);
const save = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    const EmailData = {
      email: userInfo.value.email,
      code: userInfo.value.code
    };
    const res = await fetchVerifyEmail(EmailData);
    if (res.data) {
      const authStore = useAuthStore();
      // 更新用户信息
      const updateData = {
        realName: userInfo.value.realName,
        gender: userInfo.value.gender,
        phone: userInfo.value.phone,
        email: userInfo.value.email,
        id: authStore.userInfo.id
      };
      const updateRes = await fetchUpdateUserInfo(updateData);
      if (updateRes.data) {
        window.$message?.success('用户信息更新成功');
        edit.value = false;
      } else {
        window.$message?.error('用户信息更新失败');
      }
    } else {
      window.$message?.error('验证码错误');
    }
  } catch (error) {
    console.log(error);
    window.$message?.error(`表单验证失败`);
  }
};
const cancel = () => {
  edit.value = false;
};
const rules = ref({
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码长度为 6 个字符', trigger: 'blur' }
  ]
});
// 验证码
const countdown = ref(60);
const wait = ref(false);
const sendCode = async () => {
  // 直接使用正则表达式验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userInfo.value.email)) {
    window.$message?.error('邮箱格式不正确，请检查输入');
    return;
  }
  try {
    const data = {
      email: userInfo.value.email
    };
    const res = await fetchSendEmail(data);
    if (res.data) {
      window.$message?.success('验证码发送成功');
      wait.value = true;
      // 倒计时
      const timer = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value <= 0) {
          clearInterval(timer);
          countdown.value = 60;
          wait.value = false;
        }
      }, 1000);
    } else {
      window.$message?.error('验证码发送失败');
    }
  } catch (error) {
    window.$message?.error(`发送验证码失败,${error}`);
  }
};

onMounted(async () => {
  const authStore = useAuthStore();
  const id = authStore.userInfo.id;
  try {
    const res = await fetchGetEditUserInfo(id);

    if (res.data) {
      userInfo.value.phone = res.data.phone;
      userInfo.value.username = res.data.userName;
      userInfo.value.avatar = res.data.avatar;
      userInfo.value.lastLoginTime = res.data.lastLoginTime;
      userInfo.value.createTime = res.data.createTime;
      userInfo.value.realName = res.data.realName;
      userInfo.value.gender = res.data.gender === '1' ? '男' : '女';
      userInfo.value.email = res.data.email;
    }
  } catch (error) {
    window.$message?.error(`获取用户信息失败,${error}`);
  }
});
</script>
