<template>
  <div class="w-full h-full flex flex-col justify-center items-center py-4">
    <div class="w-full flex flex-col items-center">
      <NImage :src="userInfo.avatar || '/default-avatar.png'" class="w-80px h-80px rounded-full mb-3" fallback-src="/default-avatar.png"></NImage>
      <NText class="text-18px font-bold mb-1">{{ userInfo.username }}</NText>
      <NText class="text-14px text-gray-600 mb-2">{{ userInfo.realName }}</NText>
      <NText class="text-12px text-gray-500 mb-1">{{ userInfo.gender }}</NText>
      <NText class="text-12px text-gray-500 mb-1">{{ userInfo.phone }}</NText>
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
  }
});
</script>

<style scoped></style>
