export enum SetupStoreId {
  App = 'app-store',
  Theme = 'theme-store',
  Auth = 'auth-store',
  Route = 'route-store',
  Tab = 'tab-store',
  Dict = 'dict-store',
  AiChat = 'ai-chat-store'
}

export enum DateTimePattern {
  Date = 'YYYY-MM-DD',
  Time = 'HH:mm:ss',
  DateTime = 'YYYY-MM-DD HH:mm:ss'
}
/** 数据类型 */
export enum EnumDataType {
  number = '[object Number]',
  string = '[object String]',
  boolean = '[object Boolean]',
  null = '[object Null]',
  undefined = '[object Undefined]',
  object = '[object Object]',
  array = '[object Array]',
  date = '[object Date]',
  regexp = '[object RegExp]',
  set = '[object Set]',
  map = '[object Map]',
  file = '[object File]'
}
export enum NoticeCategory {
  Notice = 1,
  Announce = 2
}
export const NoticeCategoryMap = {
  [NoticeCategory.Announce]: '公告',
  [NoticeCategory.Notice]: '通知'
};
