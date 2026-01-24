<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div class="w-full flex flex-col justify-center items-center">
      <NText class="text-24px font-bold">{{ userInfo.nickName }}</NText>
      <NText class="text-16px">{{ userInfo.realName }}</NText>
      <NText class="text-16px">{{ userInfo.gender }}</NText>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetEditUserInfo } from '@/service/api/manage/user';
import { useAuthStore } from '@/store/modules/auth';
const userInfo = ref({
  avatar: '',
  username: '',
  phone: '',
  lastLoginTime: 0,
  createTime: 0,
  realName: '',
  gender: '',
  email: '',
  nickName: '',
  code: ''
});
onMounted(async () => {
  const authStore = useAuthStore();
  const id = authStore.userInfo.id;
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
    userInfo.value.nickName = res.data.nickName;
  }
});
</script>

<style scoped></style>
