import { request } from '@/service/request';

export function fetchGetWorkOrderPageList(params?: Api.WorkOrder.WorkOrderSearchParams) {
  return request<Api.WorkOrder.WorkOrderPageList>({
    url: '/device_work_order/page',
    method: 'GET',
    params
  });
}

export function fetchGetWorkOrder(id: string | number) {
  return request<Api.WorkOrder.WorkOrder>({
    url: `/device_work_order/${id}`,
    method: 'GET'
  });
}

export function fetchAddWorkOrder(data: Api.WorkOrder.WorkOrderAdd) {
  return request<boolean>({
    url: '/device_work_order/',
    method: 'POST',
    data
  });
}

export function fetchUpdateWorkOrder(data: Api.WorkOrder.WorkOrderUpdate) {
  return request<boolean>({
    url: '/device_work_order/',
    method: 'PUT',
    data
  });
}

export function fetchDeleteWorkOrder(data: Api.Common.DeleteParams) {
  return request<boolean>({
    url: '/device_work_order/',
    method: 'DELETE',
    data
  });
}

export function fetchFlowWorkOrder(data: Api.WorkOrder.WorkOrderFlow) {
  return request<boolean>({
    url: '/device_work_order/flow',
    method: 'POST',
    data
  });
}

export function fetchGetWorkOrderLogs(orderId: string | number) {
  return request<Api.WorkOrder.WorkOrderLog[]>({
    url: `/device_work_order/logs/${orderId}`,
    method: 'GET'
  });
}
