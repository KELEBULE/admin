import { request } from '@/service/request/index';

export function getAlarmList(params: any) {
  return request({
    url: '/device_work_order/page',
    method: 'get',
    params
  });
}
