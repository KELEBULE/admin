import { request } from '@/service/request/index';

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
    // 流式响应不需要JSON解析
    responseType: 'stream'
  });
};

// 历史/ai_chat/session/{sessionId}
export const fetchSessionCompletion = (sessionId: string, data: any) => {
  return request({
    url: `/ai_chat/session/${sessionId}`,
    method: 'POST',
    data
  });
};
// 删除历史/ai_chat/session/{sessionId}
export const deleteSessionCompletion = (sessionId: string) => {
  return request({
    url: `/ai_chat/session/${sessionId}`,
    method: 'DELETE'
  });
};
// 获取可用模型/ai_chat/models
export const fetchAvailableModels = () => {
  return request({
    url: '/ai_chat/models',
    method: 'GET'
  });
};
// 上传文件/ai_chat/file/upload
export const uploadFileCompletion = (data: any) => {
  return request({
    url: '/ai_chat/file/upload',
    method: 'POST',
    data
  });
};

// 删除文件/ai_chat/file
export const deleteFileCompletion = (data: any) => {
  return request({
    url: `/ai_chat/file`,
    method: 'DELETE',
    data
  });
};

// 获取会话历史/ai_chat/session/{sessionId}
export const fetchSessionHistory = (sessionId: string) => {
  return request({
    url: `/ai_chat/session/${sessionId}`,
    method: 'GET'
  });
};

// 清除会话历史/ai_chat/session/{sessionId}
export const clearSessionHistory = (sessionId: string) => {
  return request({
    url: `/ai_chat/session/${sessionId}`,
    method: 'DELETE'
  });
};
