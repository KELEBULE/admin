import { request } from '@/service/request';

export function fetchGetDeviceDetectionRecordPageList(params?: Api.Detection.DeviceDetectionRecordSearchParams) {
  return request<Api.Detection.DeviceDetectionRecordPageList>({
    url: '/device_detection_record/page',
    method: 'GET',
    params
  });
}

export function fetchGetDeviceDetectionRecord(id: string | number) {
  return request<Api.Detection.DeviceDetectionRecord>({
    url: `/device_detection_record/${id}`,
    method: 'GET'
  });
}
