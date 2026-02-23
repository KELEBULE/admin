import { request } from '@/service/request/index';

export interface AiSessionVO {
  id: number;
  sessionId: string;
  title: string;
  model: string;
  lastActiveTime: string;
  createTime: string;
}

export const fetchNormalCompletion = (data: any) => {
  return request({
    url: '/ai_chat/completion',
    method: 'POST',
    data
  });
};

export const fetchStreamCompletion = (params: any) => {
  return request({
    url: '/ai_chat/stream',
    method: 'GET',
    params,
    responseType: 'stream'
  });
};

export const fetchSessionCompletion = (sessionId: string, data: any) => {
  return request({
    url: `/ai_chat/session/${sessionId}`,
    method: 'POST',
    data
  });
};

export const deleteSessionCompletion = (sessionId: string) => {
  return request({
    url: `/ai_chat/session/${sessionId}`,
    method: 'DELETE'
  });
};

export const fetchAvailableModels = () => {
  return request({
    url: '/ai_chat/models',
    method: 'GET'
  });
};

export const uploadFileCompletion = (data: any) => {
  return request({
    url: '/ai_chat/file/upload',
    method: 'POST',
    data
  });
};

export const deleteFileCompletion = (data: any) => {
  return request({
    url: `/ai_chat/file`,
    method: 'DELETE',
    data
  });
};

export const fetchSessionHistory = (sessionId: string) => {
  return request({
    url: `/ai_chat/session/${sessionId}`,
    method: 'GET'
  });
};

export const clearSessionHistory = (sessionId: string) => {
  return request({
    url: `/ai_chat/session/${sessionId}`,
    method: 'DELETE'
  });
};

export const fetchSessionList = () => {
  return request<AiSessionVO[]>({
    url: '/ai_chat/sessions',
    method: 'GET'
  });
};
