import { request } from '@/service/request';

export function fetchGetDeviceAlarmPageList(params?: Api.Alarm.DeviceAlarmSearchParams) {
  return request<Api.Alarm.DeviceAlarmPageList>({
    url: '/device_alarm/page',
    method: 'GET',
    params
  });
}

export function fetchGetDeviceAlarm(id: string | number) {
  return request<Api.Alarm.DeviceAlarm>({
    url: `/device_alarm/${id}`,
    method: 'GET'
  });
}

export function fetchConfirmDeviceAlarm(data: Api.Alarm.DeviceAlarmConfirmParams) {
  return request<boolean>({
    url: '/device_alarm/confirm',
    method: 'PUT',
    data
  });
}

export function fetchCreateWorkOrder(data: Api.Alarm.DeviceAlarmCreateWorkOrderParams) {
  return request<boolean>({
    url: '/device_alarm/create_work_order',
    method: 'POST',
    data
  });
}

export function fetchExportDeviceAlarm(ids: number[]) {
  return request<boolean, 'blob'>({
    url: '/device_alarm/export',
    method: 'POST',
    data: { ids },
    responseType: 'blob'
  });
}

export function fetchGetAlarmLevelDistribution() {
  return request<Api.Alarm.AlarmLevelDistribution>({
    url: '/device_alarm/level_distribution',
    method: 'GET'
  });
}

export function fetchGetDeviceAlarmTop(limit: number = 10) {
  return request<Api.Alarm.DeviceAlarmTop>({
    url: '/device_alarm/device_top',
    method: 'GET',
    params: { limit }
  });
}
