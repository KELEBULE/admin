<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { fetchGetPartHourlyAlarmDistribution } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'PartHourlyAlarmDistribution'
});

const props = defineProps<{
  partId: number;
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

  const hours = data.hourlyDistribution.map((item: Api.Alarm.FrequentAlarmTimeItem) => `${item.hour}:00`);
  const counts = data.hourlyDistribution.map((item: Api.Alarm.FrequentAlarmTimeItem) => item.alarmCount);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        return `<strong>${params[0].axisValue}</strong><br/>${params[0].marker} ${$t('page.monitor.alarmCount')}: ${params[0].value}`;
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
        interval: 3,
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
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#69c0ff' }
          ])
        },
        data: counts
      }
    ]
  };

  const total = counts.reduce((sum: number, val: number) => sum + val, 0);
  if (total === 0) {
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
  if (!props.partId) {
    initChart({ hourlyDistribution: [] });
    return;
  }

  try {
    const { data, error } = await fetchGetPartHourlyAlarmDistribution(props.partId, props.startTime, props.endTime);
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
  () => [props.partId, props.startTime, props.endTime],
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
