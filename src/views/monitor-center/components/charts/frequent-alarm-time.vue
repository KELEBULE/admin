<template>
  <div class="w-full h-full flex flex-col">
    <div ref="chartRef" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { fetchGetFrequentAlarmTime } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'FrequentAlarmTime'
});

const props = defineProps<{
  deviceId: number | null;
  startTime: string;
  endTime: string;
}>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

function initChart(data: Api.Alarm.FrequentAlarmTimeResult) {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const hours = data.hourlyDistribution.map(item => `${item.hour}:00`);
  const counts = data.hourlyDistribution.map(item => item.alarmCount);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      formatter: (params: any) => {
        const item = params[0];
        return `<strong>${item.axisValue}</strong><br/>${$t('page.monitor.alarmCount')}: ${item.value}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: {
        interval: 2,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: $t('page.monitor.alarmCount'),
      nameTextStyle: {
        fontSize: 10
      },
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: $t('page.monitor.alarmCount'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#188df0'
        },
        itemStyle: {
          color: '#188df0'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 141, 240, 0.3)' },
            { offset: 1, color: 'rgba(24, 141, 240, 0.05)' }
          ])
        },
        data: counts
      }
    ]
  };

  if (data.hourlyDistribution.length === 0) {
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
  if (!props.deviceId) {
    initChart({ hourlyDistribution: [] });
    return;
  }

  try {
    const { data, error } = await fetchGetFrequentAlarmTime(props.deviceId, props.startTime, props.endTime);
    if (!error && data) {
      initChart(data);
    } else {
      initChart({ hourlyDistribution: [] });
    }
  } catch {
    initChart({ hourlyDistribution: [] });
  }
}

watch(
  () => [props.deviceId, props.startTime, props.endTime],
  () => {
    fetchData();
  }
);

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
