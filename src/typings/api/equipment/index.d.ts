declare namespace Api {
  namespace Equipment {
    type FactoryInfo = {
      factoryId: number;
      factoryCode: string;
      factoryName: string;
      factoryAddress?: string;
      contactPerson?: string;
      contactPhone?: string;
      status?: number;
      createTime?: string;
    };

    type FactoryInfoPageList = Common.PaginatingQueryRecord<FactoryInfo>;

    type FactoryInfoSearchParams = CommonType.RecordNullable<
      Pick<FactoryInfo, 'factoryName' | 'factoryCode' | 'status'> & Api.Common.CommonSearchParams
    >;

    type FactoryInfoEdit = {
      factoryId?: number;
      factoryCode: string;
      factoryName: string;
      factoryAddress?: string;
      contactPerson?: string;
      contactPhone?: string;
      status?: number;
    };

    type FactoryArea = {
      uniqueKey?: string;
      areaId: number;
      locationCode: string;
      areaName: string;
      factoryId?: number;
      parentId?: number;
      areaType?: number;
      longitude?: number;
      latitude?: number;
      areaStatus?: number;
      areaOrder?: number;
      createTime?: string;
      children?: FactoryDevice[];
    };

    type FactoryAreaPageList = Common.PaginatingQueryRecord<FactoryArea>;

    type FactoryAreaSearchParams = CommonType.RecordNullable<
      Pick<FactoryArea, 'areaName' | 'locationCode' | 'areaStatus'> & Api.Common.CommonSearchParams
    >;

    type FactoryAreaEdit = {
      areaId?: number;
      locationCode: string;
      areaName: string;
      factoryId?: number;
      parentId?: number;
      areaType?: number;
      longitude?: number;
      latitude?: number;
      areaStatus?: number;
      areaOrder?: number;
    };

    type Device = {
      uniqueKey?: string;
      deviceId: number;
      deviceCode: string;
      deviceName: string;
      deviceModel?: string;
      typeId?: number;
      locationId?: number;
      installTime?: string;
      startUseTime?: string;
      scrapTime?: string;
      deviceStatus: number;
      scrapStatus?: number;
      totalWorkHours?: number;
      lastOnlineTime?: string;
      deviceSn?: string;
      manufacturer?: string;
      maintainCycle?: number;
      lastMaintainTime?: string;
      warrantyPeriod?: number;
      deviceNote?: string;
      createTime?: string;
      updateTime?: string;
      children?: DevicePart[];
    };

    type DevicePart = {
      uniqueKey?: string;
      partId: number;
      partCode: string;
      partName: string;
      deviceId: number;
      partType?: string;
      monitorEnabled?: number;
      installPosition?: string;
      partStatus?: number;
      createTime?: string;
      updateTime?: string;
    };

    type DeviceTree = Device & {
      children?: (DeviceTree | DevicePartTree)[];
    };

    type DevicePartTree = DevicePart & {
      children?: DevicePartTree[];
    };

    type DevicePageList = Common.PaginatingQueryRecord<Device>;

    type DeviceSearchParams = CommonType.RecordNullable<Pick<Device, 'deviceName' | 'deviceCode' | 'deviceStatus'> & Api.Common.CommonSearchParams>;

    type DeviceEdit = {
      deviceId?: number;
      deviceCode: string;
      deviceName: string;
      deviceModel?: string;
      typeId?: number;
      locationId?: number;
      installTime?: string | number | null;
      startUseTime?: string | number | null;
      scrapTime?: string;
      deviceStatus?: number;
      scrapStatus?: number;
      totalWorkHours?: number;
      deviceSn?: string;
      manufacturer?: string;
      maintainCycle?: number;
      lastMaintainTime?: string | number | null;
      warrantyPeriod?: number;
      deviceNote?: string;
    };

    type DevicePartEdit = {
      partId?: number;
      partCode: string;
      partName: string;
      deviceId: number;
      partType?: string;
      monitorEnabled?: number;
      installPosition?: string;
      partStatus?: number;
    };

    type PartThresholdConfig = {
      id: number;
      partId: number;
      configName: string;
      tempMin?: number;
      tempMax?: number;
      warningMin?: number;
      warningMax?: number;
      checkInterval?: number;
      configStatus?: number;
      createTime?: string;
      updateTime?: string;
    };

    type PartThresholdConfigEdit = {
      id?: number;
      partId: number;
      configName: string;
      tempMin?: number;
      tempMax?: number;
      warningMin?: number;
      warningMax?: number;
      checkInterval?: number;
      configStatus?: number;
    };
  }
}
