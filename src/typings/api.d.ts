/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      page: number;
      /** page size */
      pageSize: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /**
     * enable status
     *
     * - "0": disabled
     * - "1": enabled
     */
    type EnableStatus = '0' | '1';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: string;
      /** record creator */
      createUser: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateUser: string;
      /** record update time */
      updateTime: string;
    } & T;

    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'page' | 'pageSize'>;

    /** common delete params */
    type DeleteParams = {
      ids: string[];
    };
  }

  namespace Alarm {
    type AlarmRule = {
      ruleId: number;
      ruleCode: string;
      ruleName: string;
      deviceIds: number[];
      alarmLevels: number[];
      notifyTargetIds: string[];
      ruleStatus: number;
      remark: string;
      createTime: string;
      updateTime: string;
    };

    type AlarmRuleSearchParams = CommonType.RecordNullable<Pick<AlarmRule, 'ruleName' | 'ruleStatus'> & Api.Common.CommonSearchParams>;

    type AlarmRuleEdit = {
      ruleId?: number;
      ruleCode: string;
      ruleName: string;
      deviceIds: number[];
      alarmLevels: number[];
      notifyTargetIds: string[];
      ruleStatus: number;
      remark: string;
    };

    type AlarmRulePageList = Common.PaginatingQueryRecord<AlarmRule>;

    type AlarmNotice = {
      id: string;
      ruleId: string;
      ruleName: string;
      alarmId: string;
      deviceId: string;
      deviceName: string;
      deviceCode: string;
      alarmType: number;
      alarmLevel: number;
      alarmMessage: string;
      currentValue: string;
      thresholdValue: string;
      notifyUserId: string;
      notifyUserName: string;
      notifyStatus: number;
      notifyTime: string;
      readStatus: number;
      readTime: string;
      createTime: string;
    };

    type AlarmNoticeSearchParams = CommonType.RecordNullable<
      Pick<AlarmNotice, 'deviceName' | 'alarmLevel' | 'readStatus' | 'notifyUserId'> & Api.Common.CommonSearchParams
    >;

    type AlarmNoticeReadParams = {
      ids: string[];
      notifyUserId: string;
    };

    type AlarmNoticePageList = Common.PaginatingQueryRecord<AlarmNotice>;

    type DeviceTreeNode = {
      id: number;
      name: string;
      code: string;
      type: 'factory' | 'area' | 'device';
      children?: DeviceTreeNode[];
    };

    type OrgUserTreeNode = {
      id: string;
      name: string;
      type: 'org' | 'user';
      children?: OrgUserTreeNode[];
    };
  }
}
