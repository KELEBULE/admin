<template>
  <NModal v-model:show="visible" preset="card" :title="$t('page.equipment.import.title')" style="width: 600px" :mask-closable="false">
    <NSpin :show="loading">
      <div v-if="!importResult" class="flex flex-col gap-4">
        <NUpload
          ref="uploadRef"
          v-model:file-list="fileList"
          :max="1"
          accept=".xlsx,.xls"
          :custom-request="handleCustomRequest"
          @remove="handleRemove"
        >
          <NUploadDragger>
            <div class="flex flex-col items-center justify-center py-8">
              <NIcon size="48" class="text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
                  />
                </svg>
              </NIcon>
              <NText class="text-16px mb-2">{{ $t('page.equipment.import.dragTip') }}</NText>
              <NText depth="3" class="text-12px">{{ $t('page.equipment.import.fileTypeTip') }}</NText>
            </div>
          </NUploadDragger>
        </NUpload>

        <div class="flex justify-center">
          <NButton text type="primary" @click="handleDownloadTemplate">
            <template #icon>
              <NIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
              </NIcon>
            </template>
            {{ $t('page.equipment.import.downloadTemplate') }}
          </NButton>
        </div>
      </div>

      <div v-else class="flex flex-col gap-4">
        <NAlert :type="importResult.failCount > 0 ? 'warning' : 'success'" :title="$t('page.equipment.import.result')">
          <div class="flex flex-col gap-2">
            <div>{{ $t('page.equipment.import.totalCount') }}: {{ importResult.totalCount }}</div>
            <div>{{ $t('page.equipment.import.successCount') }}: {{ importResult.successCount }}</div>
            <div>{{ $t('page.equipment.import.failCount') }}: {{ importResult.failCount }}</div>
            <NDivider class="my-2" />
            <div>{{ $t('page.equipment.import.factoryCount') }}: {{ importResult.factoryCount }}</div>
            <div>{{ $t('page.equipment.import.areaCount') }}: {{ importResult.areaCount }}</div>
            <div>{{ $t('page.equipment.import.deviceCount') }}: {{ importResult.deviceCount }}</div>
            <div>{{ $t('page.equipment.import.partCount') }}: {{ importResult.partCount }}</div>
          </div>
        </NAlert>

        <div v-if="importResult.errorMessages && importResult.errorMessages.length > 0">
          <NText class="mb-2 font-medium">{{ $t('page.equipment.import.errorMessages') }}:</NText>
          <NScrollbar style="max-height: 200px">
            <div v-for="(msg, index) in importResult.errorMessages" :key="index" class="text-red-500 text-12px mb-1">
              {{ msg }}
            </div>
          </NScrollbar>
        </div>
      </div>
    </NSpin>

    <template #footer>
      <div class="flex justify-end gap-2">
        <NButton v-if="!importResult && fileList.length > 0" type="primary" :loading="loading" @click="handleConfirmImport">
          {{ $t('common.confirm') }}
        </NButton>
        <NButton v-if="importResult" @click="handleReset">{{ $t('common.continue') }}</NButton>
        <NButton @click="visible = false">{{ $t('common.close') }}</NButton>
      </div>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { NAlert, NButton, NDivider, NIcon, NScrollbar, NSpin, NText, NUpload, NUploadDragger, useMessage } from 'naive-ui';
import { fetchDownloadEquipmentTemplate, fetchImportEquipment } from '@/service/api/equipment';
import { $t } from '@/locales';

interface Props {
  show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: false
});

const emit = defineEmits<{
  'update:show': [value: boolean];
  success: [];
}>();

const message = useMessage();
const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val)
});

const loading = ref(false);
const fileList = ref<UploadFileInfo[]>([]);
const importResult = ref<Api.Equipment.ImportResult | null>(null);

watch(
  () => props.show,
  val => {
    if (val) {
      handleReset();
    }
  }
);

function handleRemove() {
  fileList.value = [];
}

function handleCustomRequest({ onFinish }: { file: UploadFileInfo; onFinish: () => void }) {
  onFinish();
}

async function handleConfirmImport() {
  if (fileList.value.length === 0) {
    message.warning($t('page.equipment.import.dragTip'));
    return;
  }

  const file = fileList.value[0];
  if (!file.file) {
    message.error($t('page.equipment.import.importFailed'));
    return;
  }

  try {
    loading.value = true;
    const { error, data } = await fetchImportEquipment(file.file);

    if (!error && data) {
      importResult.value = data;
      if (data.successCount > 0) {
        emit('success');
        window.$message?.success(`${$t('page.equipment.import.successCount')}: ${data.successCount}`);
      }
    } else {
      message.error($t('page.equipment.import.importFailed'));
    }
  } catch (err: any) {
    message.error(err?.message || $t('page.equipment.import.importFailed'));
  } finally {
    loading.value = false;
  }
}

async function handleDownloadTemplate() {
  try {
    loading.value = true;
    const { error, data } = await fetchDownloadEquipmentTemplate();

    if (!error && data) {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = '设备导入模板.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  } catch {
    message.error($t('page.equipment.import.downloadFailed'));
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  fileList.value = [];
  importResult.value = null;
}
</script>
