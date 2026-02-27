import { request } from '@/service/request';

export function fetchGetAlarmRulePageList(params?: Api.Alarm.AlarmRuleSearchParams) {
  return request<Api.Alarm.AlarmRulePageList>({
    url: '/alarm_rule/page',
    method: 'GET',
    params
  });
}

export function fetchGetAlarmRule(id: string) {
  return request<Api.Alarm.AlarmRule>({
    url: `/alarm_rule/${id}`,
    method: 'GET'
  });
}

export function fetchAddAlarmRule(data: Api.Alarm.AlarmRuleEdit) {
  return request<boolean>({
    url: '/alarm_rule/',
    method: 'POST',
    data
  });
}

export function fetchUpdateAlarmRule(data: Api.Alarm.AlarmRuleEdit) {
  return request<boolean>({
    url: '/alarm_rule/',
    method: 'PUT',
    data
  });
}

export function fetchDeleteAlarmRule(data: Api.Common.DeleteParams) {
  return request<boolean>({
    url: '/alarm_rule/',
    method: 'DELETE',
    data
  });
}

export function fetchGetDeviceTree() {
  return request<Api.Alarm.DeviceTreeNode[]>({
    url: '/alarm_rule/device_tree',
    method: 'GET'
  });
}

export function fetchGetOrgUserTree() {
  return request<Api.Alarm.OrgUserTreeNode[]>({
    url: '/alarm_rule/org_user_tree',
    method: 'GET'
  });
}

export function fetchGetAlarmNoticePageList(params?: Api.Alarm.AlarmNoticeSearchParams) {
  return request<Api.Alarm.AlarmNoticePageList>({
    url: '/alarm_notice/page',
    method: 'GET',
    params
  });
}

export function fetchGetAlarmNotice(id: string) {
  return request<Api.Alarm.AlarmNotice>({
    url: `/alarm_notice/${id}`,
    method: 'GET'
  });
}

export function fetchMarkAlarmNoticeRead(data: Api.Alarm.AlarmNoticeReadParams) {
  return request<boolean>({
    url: '/alarm_notice/read',
    method: 'PUT',
    data
  });
}

export function fetchGetUnreadCount(notifyUserId: string) {
  return request<number>({
    url: '/alarm_notice/unread_count',
    method: 'GET',
    params: { notifyUserId }
  });
}
