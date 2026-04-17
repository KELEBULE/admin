import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchAiConfig, fetchAvailableModels, updateAiConfig } from '@/service/api/ai/config';
import { SetupStoreId } from '@/enum';

export interface AiConfig {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  availableModels?: string[];
  serviceStatus?: Record<string, any>;
}

export const useAiConfigStore = defineStore(SetupStoreId.AiConfig, () => {
  const config = ref<AiConfig>({
    defaultModel: 'qwen3:14b',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: ''
  });

  const availableModels = ref<string[]>([]);
  const serviceStatus = ref<Record<string, any>>({});
  const loading = ref(false);

  async function loadConfig() {
    loading.value = true;
    try {
      const { data } = await fetchAiConfig();
      if (data) {
        config.value = {
          defaultModel: data.defaultModel || 'qwen3:14b',
          temperature: data.temperature || 0.7,
          maxTokens: data.maxTokens || 1000,
          systemPrompt: data.systemPrompt || '',
          availableModels: data.availableModels,
          serviceStatus: data.serviceStatus
        };
        if (data.availableModels) {
          availableModels.value = data.availableModels;
        }
        if (data.serviceStatus) {
          serviceStatus.value = data.serviceStatus;
        }
      }
    } catch (error) {
      console.error('加载AI配置失败', error);
    } finally {
      loading.value = false;
    }
  }

  async function saveConfig(newConfig: Partial<AiConfig>) {
    try {
      await updateAiConfig({
        defaultModel: newConfig.defaultModel,
        temperature: newConfig.temperature,
        maxTokens: newConfig.maxTokens,
        systemPrompt: newConfig.systemPrompt
      });
      if (newConfig.defaultModel) config.value.defaultModel = newConfig.defaultModel;
      if (newConfig.temperature !== undefined) config.value.temperature = newConfig.temperature;
      if (newConfig.maxTokens !== undefined) config.value.maxTokens = newConfig.maxTokens;
      if (newConfig.systemPrompt !== undefined) config.value.systemPrompt = newConfig.systemPrompt;
      return true;
    } catch (error) {
      console.error('保存AI配置失败', error);
      return false;
    }
  }

  async function loadAvailableModels() {
    try {
      const { data } = await fetchAvailableModels();
      if (data) {
        availableModels.value = data;
      }
    } catch (error) {
      console.error('加载模型列表失败', error);
    }
  }

  return {
    config,
    availableModels,
    serviceStatus,
    loading,
    loadConfig,
    saveConfig,
    loadAvailableModels
  };
});
