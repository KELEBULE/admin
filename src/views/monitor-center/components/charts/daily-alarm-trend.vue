<template>
  <div class="w-full h-full flex flex-col">
    <div ref="chartRef" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { fetchGetDailyAlarmTrend } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'DailyAlarmTrend'
});

const props = defineProps<{
  deviceId: number | null;
  startTime: string;
  endTime: string;
}>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

function initChart(data: Api.Alarm.DailyAlarmTrendResult) {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const dates = data.dailyData.map(item => item.date.substring(5));
  const counts = data.dailyData.map(item => item.alarmCount);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
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
      data: dates,
      axisLabel: {
        interval: Math.floor(dates.length / 6),
        fontSize: 10,
        rotate: 30
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
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f97316' },
            { offset: 1, color: '#fb923c' }
          ])
        },
        data: counts
      }
    ]
  };

  if (data.dailyData.length === 0) {
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
    initChart({ dailyData: [] });
    return;
  }

  try {
    const { data, error } = await fetchGetDailyAlarmTrend(props.deviceId, props.startTime, props.endTime);
    if (!error && data) {
      initChart(data);
    } else {
      initChart({ dailyData: [] });
    }
  } catch {
    initChart({ dailyData: [] });
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
