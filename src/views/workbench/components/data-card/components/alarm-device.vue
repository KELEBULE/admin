<template>
  <div class="w-500px h-300px flex flex-col">
    <div ref="chartRef" class="flex-1 w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as echarts from 'echarts';
import { fetchGetDeviceAlarmTop } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'AlarmDevice'
});

interface DeviceAlarmItem {
  deviceId: number;
  deviceName: string;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalCount: number;
}

interface DeviceAlarmTop {
  deviceAlarmList: DeviceAlarmItem[];
}

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;
const loading = ref(true);

function initChart(data: DeviceAlarmTop) {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const devices = data.deviceAlarmList.map(item => item.deviceName);
  const level1Data = data.deviceAlarmList.map(item => item.level1Count);
  const level2Data = data.deviceAlarmList.map(item => item.level2Count);
  const level3Data = data.deviceAlarmList.map(item => item.level3Count);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        let total = 0;
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
          total += item.value;
        });
        result += `<strong>${$t('page.workbench.alarmCount')}: ${total}</strong>`;
        return result;
      }
    },
    legend: {
      data: [$t('page.workbench.level1Alarm'), $t('page.workbench.level2Alarm'), $t('page.workbench.level3Alarm')],
      top: 'top',
      right: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 11
      },
      icon: 'circle'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: devices
    },
    yAxis: {
      type: 'value',
      name: $t('page.workbench.alarmCount'),
      nameTextStyle: {
        fontSize: 10
      },
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: $t('page.workbench.level1Alarm'),
        barWidth: 30,
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#dc2626'
        },
        data: level1Data
      },
      {
        name: $t('page.workbench.level2Alarm'),
        barWidth: 30,
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#f97316'
        },
        data: level2Data
      },
      {
        name: $t('page.workbench.level3Alarm'),
        barWidth: 30,
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#3b82f6'
        },
        data: level3Data
      }
    ]
  };

  if (data.deviceAlarmList.length === 0) {
    (option as any).title = {
      text: $t('page.workbench.noData'),
      left: 'center',
      top: 'center',
      textStyle: {
        color: '#9ca3af',
        fontSize: 14
      }
    };
  }

  chartInstance.setOption(option);
}

function resizeChart() {
  chartInstance?.resize();
}

async function fetchData() {
  try {
    loading.value = true;
    const { data, error } = await fetchGetDeviceAlarmTop(10);
    if (!error && data) {
      initChart(data);
    } else {
      initChart({ deviceAlarmList: [] });
    }
  } catch {
    initChart({ deviceAlarmList: [] });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
});
</script>

<style scoped></style>
