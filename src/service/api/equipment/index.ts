import { request } from '@/service/request';

export function fetchGetFactoryInfoPageList(params?: Api.Equipment.FactoryInfoSearchParams) {
  return request<Api.Equipment.FactoryInfoPageList>({
    url: '/factory_info/page',
    method: 'GET',
    params
  });
}

export function fetchGetFactoryInfoList() {
  return request<Api.Equipment.FactoryInfo[]>({
    url: '/factory_info/list',
    method: 'GET'
  });
}

export function fetchAddFactoryInfo(data: Api.Equipment.FactoryInfoEdit) {
  return request<boolean>({
    url: '/factory_info/',
    method: 'POST',
    data
  });
}

export function fetchGetFactoryInfo(id: string | number) {
  return request<Api.Equipment.FactoryInfo>({
    url: `/factory_info/${id}`,
    method: 'GET'
  });
}

export function fetchUpdateFactoryInfo(data: Api.Equipment.FactoryInfoEdit) {
  return request<boolean>({
    url: '/factory_info/',
    method: 'PUT',
    data
  });
}

export function fetchDeleteFactoryInfo(data: Api.Common.DeleteParams) {
  return request<boolean>({
    url: '/factory_info/',
    method: 'DELETE',
    data
  });
}

export function fetchGetFactoryAreaPageList(params?: Api.Equipment.FactoryAreaSearchParams) {
  return request<Api.Equipment.FactoryAreaPageList>({
    url: '/factory_area/page',
    method: 'GET',
    params
  });
}

export function fetchGetFactoryAreaList() {
  return request<Api.Equipment.FactoryArea[]>({
    url: '/factory_area/list',
    method: 'GET'
  });
}

export function fetchAddFactoryArea(data: Api.Equipment.FactoryAreaEdit) {
  return request<boolean>({
    url: '/factory_area/',
    method: 'POST',
    data
  });
}

export function fetchGetFactoryArea(id: string | number) {
  return request<Api.Equipment.FactoryArea>({
    url: `/factory_area/${id}`,
    method: 'GET'
  });
}

export function fetchUpdateFactoryArea(data: Api.Equipment.FactoryAreaEdit) {
  return request<boolean>({
    url: '/factory_area/',
    method: 'PUT',
    data
  });
}

export function fetchDeleteFactoryArea(data: Api.Common.DeleteParams) {
  return request<boolean>({
    url: '/factory_area/',
    method: 'DELETE',
    data
  });
}

export function fetchGetDevicePageList(params?: Api.Equipment.DeviceSearchParams) {
  return request<Api.Equipment.DevicePageList>({
    url: '/factory_device/page',
    method: 'GET',
    params
  });
}

export function fetchAddDevice(data: Api.Equipment.DeviceEdit) {
  return request<boolean>({
    url: '/factory_device/',
    method: 'POST',
    data
  });
}

export function fetchGetDevice(id: string | number) {
  return request<Api.Equipment.Device>({
    url: `/factory_device/${id}`,
    method: 'GET'
  });
}

export function fetchUpdateDevice(data: Api.Equipment.DeviceEdit) {
  return request<boolean>({
    url: '/factory_device/',
    method: 'PUT',
    data
  });
}

export function fetchDeleteDevice(data: Api.Common.DeleteParams) {
  return request<boolean>({
    url: '/factory_device/',
    method: 'DELETE',
    data
  });
}

export function fetchGetDevicePartList(deviceId: number | string) {
  return request<Api.Equipment.DevicePart[]>({
    url: `/device_part/list/${deviceId}`,
    method: 'GET'
  });
}

export function fetchAddDevicePart(data: Api.Equipment.DevicePartEdit) {
  return request<boolean>({
    url: '/device_part/',
    method: 'POST',
    data
  });
}

export function fetchGetDevicePart(id: string | number) {
  return request<Api.Equipment.DevicePart>({
    url: `/device_part/${id}`,
    method: 'GET'
  });
}

export function fetchUpdateDevicePart(data: Api.Equipment.DevicePartEdit) {
  return request<boolean>({
    url: '/device_part/',
    method: 'PUT',
    data
  });
}

export function fetchDeleteDevicePart(data: Api.Common.DeleteParams) {
  return request<boolean>({
    url: '/device_part/',
    method: 'DELETE',
    data
  });
}

export function fetchGetPartThresholdConfig(partId: number | string) {
  return request<Api.Equipment.PartThresholdConfig>({
    url: `/part_threshold_config/${partId}`,
    method: 'GET'
  });
}

export function fetchSavePartThresholdConfig(data: Api.Equipment.PartThresholdConfigDTO) {
  return request<boolean>({
    url: '/part_threshold_config/',
    method: 'POST',
    data
  });
}
