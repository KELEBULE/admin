import { request } from '@/service/request/index';
import type { AiConfig } from '@/store/modules/ai-config';

export const fetchAiConfig = () => {
  return request<AiConfig>({
    url: '/ai_config',
    method: 'GET'
  });
};

export const updateAiConfig = (data: Partial<AiConfig>) => {
  return request({
    url: '/ai_config',
    method: 'PUT',
    data
  });
};

export const fetchAvailableModels = () => {
  return request<string[]>({
    url: '/ai_config/models',
    method: 'GET'
  });
};

export const fetchServiceStatus = () => {
  return request<Record<string, any>>({
    url: '/ai_config/status',
    method: 'GET'
  });
};
