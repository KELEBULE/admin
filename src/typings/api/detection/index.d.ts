declare namespace Api {
  namespace Detection {
    type DeviceDetectionRecordSearchParams = {
      deviceId?: number;
      partId?: number;
      detectStatus?: number;
      isFalseAlarm?: number;
      detectTimeStart?: string;
      detectTimeEnd?: string;
      sensorCode?: string;
    };

    type DeviceDetectionRecord = {
      recordId: number;
      deviceId: number;
      deviceName?: string;
      deviceCode?: string;
      partId: number;
      partName?: string;
      thresholdId?: number;
      detectValue: number;
      detectStatus: number;
      level1Value?: number;
      level2Value?: number;
      level3Value?: number;
      isFalseAlarm?: number;
      alarmId?: number;
      detectTime: string;
      sensorCode?: string;
      dataSource?: string;
      createTime: string;
    };

    type DeviceDetectionRecordPageList = Common.PaginatedQuery<DeviceDetectionRecord>;
  }
}
