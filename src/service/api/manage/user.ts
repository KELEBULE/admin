import { request } from '@/service/request';

// =============== User Begin ===============

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/sys_user/page',
    method: 'GET',
    params
  });
}

// 根据ID获取用户详情
export function fetchGetEditUserInfo(id: string) {
  return request<Api.SystemManage.User>({
    url: `/sys_user/${id}`,
    method: 'GET'
  });
}
// 根据ID修改用户信息
export function fetchUpdateUserInfo(data: any) {
  return request<boolean>({
    url: `/auth/user_info`,
    method: 'PUT',
    data
  });
}

/** add user info */
export function fetchAddUser(data: Api.SystemManage.UserEdit) {
  return request<boolean>({
    url: '/sys_user/',
    method: 'POST',
    data
  });
}

// /** edit update user info */
// export function fetchUpdateUserInfo(data: Api.SystemManage.UserEdit) {
//   return request<boolean>({
//     url: '/sys_user/',
//     method: 'PUT',
//     data
//   });
// }

/** edit delete user */
export function fetchDeleteUser(data: Api.Common.DeleteParams) {
  return request<boolean>({
    url: '/sys_user/',
    method: 'DELETE',
    data
  });
}

/** edit delete user */
export function fetchResetUserPassword(userId: string) {
  return request<string>({
    url: `/sys_user/reset_password/${userId}`,
    method: 'PUT'
  });
}

/** get user responsibilities */
export function fetchGetUserResponsibilities(userId: string) {
  return request<Api.SystemManage.UserResponsibilities>({
    url: `/sys_user/responsibilities/${userId}`,
    method: 'GET'
  });
}

/** get user responsibilities */
export function fetchSaveUserResponsibilities(data: Api.SystemManage.UserResponsibilities) {
  return request<boolean>({
    url: `/sys_user/responsibilities`,
    method: 'PUT',
    data
  });
}

// =============== User End  ===============
