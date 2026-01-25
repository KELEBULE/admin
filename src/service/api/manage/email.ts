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

export function fetchLoginCode(email: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/send_email_code',
    method: 'post',
    params: { email }
  });
}

export function fetchEmailLogin(data: { email: string; code: string }) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/email_code',
    method: 'post',
    data
  });
}
