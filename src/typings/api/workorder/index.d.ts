declare namespace Api {
  namespace WorkOrder {
    type WorkOrder = {
      id: number;
      orderId: number;
      orderCode: string;
      deviceId: number;
      deviceCode?: string;
      deviceName?: string;
      alarmId?: number;
      orderType: number;
      orderSource: number;
      faultTime?: string;
      faultDescription: string;
      repairRequirement?: string;
      priority: number;
      creatorId: number;
      creatorName?: string;
      assigneeId?: number;
      assigneeName?: string;
      processorId?: number;
      processorName?: string;
      reviewerId?: number;
      reviewerName?: string;
      planStartTime?: string;
      planEndTime?: string;
      actualStartTime?: string;
      actualEndTime?: string;
      orderStatus: number;
      handleDuration?: number;
      repairResult?: string;
      repairCost?: number;
      spareParts?: string;
      reviewResult?: string;
      reviewTime?: string;
      evaluationScore?: number;
      evaluationRemark?: string;
      createTime?: string;
      updateTime?: string;
      flowLogs?: WorkOrderLog[];
    };

    type WorkOrderLog = {
      id: number;
      logId: number;
      orderId: number;
      orderCode: string;
      actionType: number;
      fromStatus?: number;
      toStatus?: number;
      fromAssignee?: number;
      toAssignee?: number;
      actionRemark?: string;
      operatorId: number;
      operatorName?: string;
      createTime?: string;
    };

    type WorkOrderPageList = Common.PaginatingQueryRecord<WorkOrder>;

    type WorkOrderSearchParams = CommonType.RecordNullable<
      Pick<WorkOrder, 'orderCode' | 'orderType' | 'orderStatus' | 'priority' | 'assigneeId'> & Api.Common.CommonSearchParams
    >;

    type WorkOrderAdd = {
      orderCode?: string;
      deviceId: number;
      alarmId?: number;
      orderType: number;
      orderSource?: number;
      faultTime?: string;
      faultDescription: string;
      repairRequirement?: string;
      priority?: number;
      assigneeId?: number;
      planStartTime?: string;
      planEndTime?: string;
      orderStatus?: number;
    };

    type WorkOrderUpdate = {
      orderId: number;
      deviceId?: number;
      alarmId?: number;
      orderType?: number;
      faultTime?: string;
      faultDescription?: string;
      repairRequirement?: string;
      priority?: number;
      assigneeId?: number;
      planStartTime?: string;
      planEndTime?: string;
      handleDuration?: number;
      repairResult?: string;
      repairCost?: number;
      spareParts?: string;
    };

    type WorkOrderFlow = {
      orderId: number;
      targetStatus?: number;
      assigneeId?: number;
      remark?: string;
      actualStartTime?: string;
      actualEndTime?: string;
      handleDuration?: number;
      repairResult?: string;
      repairCost?: number;
      spareParts?: string;
      reviewResult?: string;
      evaluationScore?: number;
      evaluationRemark?: string;
    };
  }
}
