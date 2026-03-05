<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    :title="modalTitle"
    :positive-text="$t('common.confirm')"
    :negative-text="$t('common.cancel')"
    :loading="loading"
    @positive-click="handleConfirm"
  >
    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="100">
      <NFormItem v-if="showStatusSelect" :label="$t('page.equipment.deviceStatus')" path="targetStatus">
        <NSelect v-model:value="formData.targetStatus" :options="statusOptions" :placeholder="$t('page.equipment.selectStatus')" />
      </NFormItem>
      <NFormItem :label="$t('page.equipment.statusLog.changeReason')" path="changeReason">
        <NInput
          v-model:value="formData.changeReason"
          type="textarea"
          :placeholder="$t('page.equipment.statusLog.changeReasonPlaceholder')"
          :maxlength="500"
          :rows="4"
          show-count
        />
      </NFormItem>
      <NFormItem :label="$t('page.equipment.statusLog.imageUrls')">
        <NUpload
          v-model:file-list="fileList"
          list-type="image-card"
          :max="3"
          accept=".jpg,.jpeg,.png"
          :custom-request="handleUpload"
          @remove="handleRemove"
          @before-upload="beforeUpload"
        >
          <NUploadDragger>
            <div class="text-center flex flex-col items-center justify-center">
              <NIcon size="32">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </NIcon>
            </div>
          </NUploadDragger>
        </NUpload>
      </NFormItem>
      <div class="text-12px text-gray-500 justify-center flex">{{ $t('page.equipment.statusLog.imageUploadTip') }}</div>
    </NForm>
  </NModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FormInst, FormRules, UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui';
import { NIcon, NUpload, NUploadDragger, useMessage } from 'naive-ui';
import { fetchChangeDeviceStatus, fetchScrapDevices } from '@/service/api/equipment';
import { fetchUploadFile } from '@/service/api/monitor/file';
import { $t } from '@/locales';

interface Props {
  show?: boolean;
  deviceIds?: number[];
  mode?: 'status' | 'scrap';
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  deviceIds: () => [],
  mode: 'status'
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
const formRef = ref<FormInst | null>(null);
const fileList = ref<UploadFileInfo[]>([]);
const uploadedUrls = ref<string[]>([]);

const formData = ref({
  targetStatus: null as number | null,
  changeReason: '',
  imageUrls: [] as string[]
});

const showStatusSelect = computed(() => props.mode === 'status');

const modalTitle = computed(() => {
  return props.mode === 'scrap' ? $t('page.equipment.statusLog.scrapDevice') : $t('page.equipment.statusLog.changeStatus');
});

const statusOptions = [
  { label: $t('page.equipment.statusNormal'), value: 1 },
  { label: $t('page.equipment.statusMaintenance'), value: 2 },
  { label: $t('page.equipment.statusDisabled'), value: 0 }
];

const rules: FormRules = {
  targetStatus: {
    required: true,
    type: 'number',
    message: $t('page.equipment.selectStatus'),
    trigger: 'change'
  },
  changeReason: [
    { required: true, message: $t('page.equipment.statusLog.changeReasonRequired'), trigger: 'blur' },
    { min: 20, max: 500, message: $t('page.equipment.statusLog.changeReasonLength'), trigger: 'blur' }
  ]
};

watch(
  () => props.show,
  val => {
    if (val) {
      formData.value = {
        targetStatus: null,
        changeReason: '',
        imageUrls: []
      };
      fileList.value = [];
      uploadedUrls.value = [];
    }
  }
);

function beforeUpload({ file }: { file: UploadFileInfo }) {
  const isImage = file.file?.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件');
    return false;
  }

  const isLt5M = (file.file?.size || 0) / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB');
    return false;
  }

  return true;
}

async function handleUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
  try {
    const formDataObj = new FormData();
    formDataObj.append('file', file.file as File);

    const { error, data } = await fetchUploadFile(formDataObj);

    if (!error && data) {
      uploadedUrls.value.push(data);
      onFinish();
    } else {
      onError();
    }
  } catch {
    onError();
  }
}

function handleRemove({ file }: { file: UploadFileInfo }) {
  const index = fileList.value.findIndex(f => f.id === file.id);
  if (index > -1) {
    uploadedUrls.value.splice(index, 1);
  }
}

async function handleConfirm() {
  try {
    await formRef.value?.validate();

    if (props.mode === 'status' && formData.value.targetStatus === null) {
      window.$message?.warning($t('page.equipment.selectStatus'));
      return false;
    }

    loading.value = true;

    const deviceIds = props.deviceIds.map(id => Number(id));
    const imageUrls = uploadedUrls.value.length > 0 ? uploadedUrls.value : undefined;

    if (props.mode === 'scrap') {
      const { error } = await fetchScrapDevices({
        deviceIds,
        changeReason: formData.value.changeReason,
        imageUrls
      });

      if (!error) {
        window.$message?.success($t('page.equipment.statusLog.scrapSuccess'));
        emit('success');
        visible.value = false;
      }
    } else {
      const { error } = await fetchChangeDeviceStatus({
        deviceIds,
        targetStatus: formData.value.targetStatus!,
        changeReason: formData.value.changeReason,
        imageUrls
      });

      if (!error) {
        window.$message?.success($t('page.equipment.statusLog.changeStatusSuccess'));
        emit('success');
        visible.value = false;
      }
    }
  } catch {
    return false;
  } finally {
    loading.value = false;
  }

  return false;
}
</script>
