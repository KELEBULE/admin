declare namespace Api {
  namespace Alarm {
    type DeviceAlarmSearchParams = {
      alarmCode?: string;
      deviceId?: number;
      partId?: number;
      alarmType?: number;
      alarmLevel?: number;
      alarmTimeStart?: string;
      alarmTimeEnd?: string;
      confirmStatus?: number;
      clearStatus?: number;
      isFalseAlarm?: number;
    };

    type DeviceAlarm = {
      alarmId: number;
      alarmCode: string;
      deviceId: number;
      deviceName?: string;
      deviceCode?: string;
      partId: number;
      partName?: string;
      monitorId?: number;
      ruleId?: number;
      alarmType: number;
      alarmLevel: number;
      alarmTime: string;
      currentValue: number;
      thresholdValue?: number;
      confirmUserId?: number;
      confirmUserName?: string;
      confirmTime?: string;
      confirmStatus: number;
      handleUserId?: number;
      handleUserName?: string;
      handleTime?: string;
      clearUserId?: number;
      clearUserName?: string;
      clearTime?: string;
      clearStatus: number;
      alarmDuration?: number;
      isFalseAlarm?: number;
      workOrderId?: number;
      workOrderCode?: string;
      workOrderStatus?: number;
      createTime: string;
      updateTime?: string;
    };

    type DeviceAlarmPageList = Common.PaginatedQuery<DeviceAlarm>;

    type DeviceAlarmConfirmParams = {
      alarmId: number;
      isFalseAlarm?: number;
    };

    type DeviceAlarmCreateWorkOrderParams = {
      alarmId: number;
      orderType?: number;
      faultTime?: string;
      faultDescription?: string;
      repairRequirement?: string;
      priority?: number;
      assigneeId?: number;
    };
  }
}
