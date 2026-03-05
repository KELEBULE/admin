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
      page?: number;
      pageSize?: number;
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

    type AlarmLevelItem = {
      level: number;
      levelName: string;
      count: number;
      percentage: number;
    };

    type AlarmLevelDistribution = {
      levelDistribution: AlarmLevelItem[];
    };

    type DeviceAlarmItem = {
      deviceId: number;
      deviceName: string;
      level1Count: number;
      level2Count: number;
      level3Count: number;
      totalCount: number;
    };

    type DeviceAlarmTop = {
      deviceAlarmList: DeviceAlarmItem[];
    };

    type FrequentAlarmPart = {
      partId: number;
      partName: string;
      partCode: string;
      alarmCount: number;
      percentage: number;
    };

    type FrequentAlarmPartResult = {
      partList: FrequentAlarmPart[];
    };

    type FrequentAlarmTimeItem = {
      hour: number;
      alarmCount: number;
    };

    type FrequentAlarmTimeResult = {
      hourlyDistribution: FrequentAlarmTimeItem[];
    };

    type AlarmLevelStats = {
      level: number;
      levelName: string;
      count: number;
      percentage: number;
    };

    type DeviceAlarmLevelStatsResult = {
      levelStats: AlarmLevelStats[];
    };

    type TemperatureTrendItem = {
      detectTime: string;
      detectValue: number;
      level1Value?: number;
      level2Value?: number;
      level3Value?: number;
    };

    type TemperatureTrendResult = {
      trendData: TemperatureTrendItem[];
    };

    type DailyAlarmCount = {
      date: string;
      alarmCount: number;
    };

    type DailyAlarmTrendResult = {
      dailyData: DailyAlarmCount[];
    };

    type HourlyAlarmItem = {
      hour: number;
      count: number;
    };

    type HourlyAlarmDistributionResult = {
      distribution: HourlyAlarmItem[];
    };
  }
}
