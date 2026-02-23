<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex items-center justify-between mb-4px">
      <NText class="text-18px font-bold">通知</NText>
      <NButton text type="primary" @click="handleMore">更多</NButton>
    </div>
    <NScrollbar>
      <div class="flex-1 min-h-0">
        <NList hoverable clickable>
          <NListItem v-for="item in noticeList" :key="item.id" @click="handleDetail(item)">
            <template #prefix>
              <NTag :type="typeMap[item.category as NoticeCategory]">
                {{ NoticeCategoryMap[item.category as NoticeCategory] }}
              </NTag>
            </template>
            <div class="flex flex-col">
              <NText class="text-16px font-medium">{{ item.title }}</NText>
              <NText class="text-12px text-gray-500">
                {{ dayjs(item.releaseTime).format('YYYY-MM-DD HH:mm') }}
              </NText>
            </div>
          </NListItem>
          <NEmpty v-if="!noticeList.length" description="暂无通知" />
        </NList>
      </div>
    </NScrollbar>
    <Detail v-model:visible="showDetail" :row="detailRow"></Detail>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { fetchGetNoticeList } from '@/service/api/manage/notice';
import { NoticeCategory, NoticeCategoryMap } from '@/enum/index';
import Detail from '@/views/config-center/system-announce/components/detail.vue';

const router = useRouter();
const noticeList = ref<any[]>([]);
const showDetail = ref(false);
const detailRow = ref<any>({});

const typeMap: Record<string, any> = {
  [NoticeCategory.Announce]: 'primary',
  [NoticeCategory.Notice]: 'success'
};

onMounted(async () => {
  await loadNoticeList();
});

const loadNoticeList = async () => {
  try {
    const res = await fetchGetNoticeList({
      page: 1,
      pageSize: 10
    });
    if (res.data?.records) {
      noticeList.value = res.data.records;
    }
  } catch (error) {
    console.error('加载通知列表失败:', error);
  }
};

const handleMore = () => {
  router.push('/config-center/system-announce');
};

const handleDetail = (row: any) => {
  detailRow.value = row;
  showDetail.value = true;
};
</script>

<style scoped>
:deep(.n-list-item) {
  padding: 8px 0;
  border-bottom: 1px solid var(--n-border-color);
}

:deep(.n-list-item:last-child) {
  border-bottom: none;
}
</style>
