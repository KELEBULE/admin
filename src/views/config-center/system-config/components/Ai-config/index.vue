<template>
  <NCard :title="$t('aiConfig.title')">
    <NSpin :show="loading">
      <NForm ref="formRef" :model="formData" label-placement="left" label-width="120px" class="max-w-800px">
        <NFormItem :label="$t('aiConfig.serviceStatus')">
          <NSpace align="center">
            <NTag :type="serviceStatus.status === 'UP' ? 'success' : 'error'">
              {{ serviceStatus.status === 'UP' ? $t('aiConfig.serviceRunning') : $t('aiConfig.serviceError') }}
            </NTag>
            <NText depth="3" class="text-12px">{{ serviceStatus.endpoint || '-' }}</NText>
          </NSpace>
        </NFormItem>

        <NFormItem :label="$t('aiConfig.defaultModel')">
          <NSpace align="center" class="w-full">
            <NSelect v-model:value="formData.defaultModel" :options="modelOptions" :placeholder="$t('aiConfig.selectModel')" class="flex-1" />
            <NButton text :loading="refreshingModels" @click="refreshModels">
              <template #icon>
                <SvgIcon icon="mdi:refresh" />
              </template>
            </NButton>
          </NSpace>
        </NFormItem>

        <NFormItem :label="$t('aiConfig.temperature')">
          <NSpace align="center" class="w-full" :size="12">
            <NInputNumber v-model:value="formData.temperature" :min="0" :max="2" :step="0.1" class="w-100px" />
          </NSpace>
        </NFormItem>

        <NFormItem :label="$t('aiConfig.maxTokens')">
          <NInputNumber v-model:value="formData.maxTokens" :min="100" :max="10000" :step="100" class="w-full" />
        </NFormItem>

        <NFormItem :label="$t('aiConfig.systemPrompt')">
          <NInput v-model:value="formData.systemPrompt" type="textarea" :rows="10" :placeholder="$t('aiConfig.systemPromptPlaceholder')" />
        </NFormItem>

        <NFormItem :show-label="false">
          <NSpace>
            <NButton type="primary" :loading="saving" @click="handleSave">
              {{ $t('common.save') }}
            </NButton>
            <NButton @click="handleReset">
              {{ $t('common.reset') }}
            </NButton>
          </NSpace>
        </NFormItem>
      </NForm>
    </NSpin>
  </NCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useAiConfigStore } from '@/store/modules/ai-config';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';

const message = useMessage();
const aiConfigStore = useAiConfigStore();

const loading = computed(() => aiConfigStore.loading);
const saving = ref(false);
const refreshingModels = ref(false);

const formData = ref({
  defaultModel: 'qwen3:14b',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: ''
});

const serviceStatus = computed(() => aiConfigStore.serviceStatus);

const modelOptions = computed(() =>
  aiConfigStore.availableModels.map(model => ({
    label: model,
    value: model
  }))
);

async function refreshModels() {
  refreshingModels.value = true;
  try {
    await aiConfigStore.loadAvailableModels();
    message.success($t('aiConfig.refreshSuccess'));
  } finally {
    refreshingModels.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const success = await aiConfigStore.saveConfig(formData.value);
    if (success) {
      message.success($t('aiConfig.saveSuccess'));
    } else {
      message.error($t('aiConfig.saveFailed'));
    }
  } finally {
    saving.value = false;
  }
}

function handleReset() {
  formData.value = {
    defaultModel: aiConfigStore.config.defaultModel,
    temperature: aiConfigStore.config.temperature,
    maxTokens: aiConfigStore.config.maxTokens,
    systemPrompt: aiConfigStore.config.systemPrompt
  };
}

onMounted(async () => {
  await aiConfigStore.loadConfig();
  formData.value = {
    defaultModel: aiConfigStore.config.defaultModel,
    temperature: aiConfigStore.config.temperature,
    maxTokens: aiConfigStore.config.maxTokens,
    systemPrompt: aiConfigStore.config.systemPrompt
  };
});
</script>

<style scoped>
.max-w-800px {
  max-width: 800px;
}

.w-full {
  width: 100%;
}

.flex-1 {
  flex: 1;
}

.w-100px {
  width: 100px;
}
</style>
