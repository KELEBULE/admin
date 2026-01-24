import { request } from '@/service/request';

export function fetchSendEmail(data: { email: string }) {
  return request<boolean>({
    url: '/email/send_code',
    method: 'post',
    data
  });
}

export function fetchVerifyEmail(data: { email: string; code: string }) {
  return request<boolean>({
    url: '/email/verify_code',
    method: 'post',
    data
  });
}
