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
    url: `/device_alarm/detail/${id}`,
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

export function fetchGetFrequentAlarmParts(deviceId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.FrequentAlarmPartResult>({
    url: '/device_alarm/stats/frequent_parts',
    method: 'GET',
    params: { deviceId, startTime, endTime }
  });
}

export function fetchGetFrequentAlarmTime(deviceId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.FrequentAlarmTimeResult>({
    url: '/device_alarm/stats/frequent_time',
    method: 'GET',
    params: { deviceId, startTime, endTime }
  });
}

export function fetchGetAlarmLevelStats(deviceId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.DeviceAlarmLevelStatsResult>({
    url: '/device_alarm/stats/level_stats',
    method: 'GET',
    params: { deviceId, startTime, endTime }
  });
}

export function fetchGetTemperatureTrend(deviceId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.TemperatureTrendResult>({
    url: '/device_alarm/stats/temperature_trend',
    method: 'GET',
    params: { deviceId, startTime, endTime }
  });
}

export function fetchGetPartTemperatureTrend(partId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.TemperatureTrendResult>({
    url: '/device_alarm/stats/part_temperature_trend',
    method: 'GET',
    params: { partId, startTime, endTime }
  });
}

export function fetchGetPartAlarmTemperatureTrend(partId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.TemperatureTrendResult>({
    url: '/device_alarm/stats/part_alarm_temperature_trend',
    method: 'GET',
    params: { partId, startTime, endTime }
  });
}

export function fetchGetPartHourlyAlarmDistribution(partId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.FrequentAlarmTimeResult>({
    url: '/device_alarm/stats/part_hourly_alarm_distribution',
    method: 'GET',
    params: { partId, startTime, endTime }
  });
}

export function fetchGetPartAlarmLevelDistribution(partId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.DeviceAlarmLevelStatsResult>({
    url: '/device_alarm/stats/part_alarm_level_distribution',
    method: 'GET',
    params: { partId, startTime, endTime }
  });
}

export function fetchGetDailyAlarmTrend(deviceId: number, startTime: string, endTime: string) {
  return request<Api.Alarm.DailyAlarmTrendResult>({
    url: '/device_alarm/stats/daily_trend',
    method: 'GET',
    params: { deviceId, startTime, endTime }
  });
}
