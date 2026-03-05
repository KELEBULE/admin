<template>
  <div class="w-full h-full flex flex-col">
    <div ref="chartRef" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { fetchGetFrequentAlarmParts } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'FrequentAlarmParts'
});

const props = defineProps<{
  deviceId: number | null;
  startTime: string;
  endTime: string;
}>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

function initChart(data: Api.Alarm.FrequentAlarmPartResult) {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const parts = data.partList.map(item => item.partName);
  const counts = data.partList.map(item => item.alarmCount);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = params[0];
        const part = data.partList.find(p => p.partName === item.name);
        return `<strong>${item.name}</strong><br/>${$t('page.monitor.alarmCount')}: ${item.value}<br/>${$t('page.monitor.percentage', { value: part?.percentage.toFixed(1) || 0 })}`;
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
      data: parts,
      axisLabel: {
        interval: 0,
        rotate: 30,
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
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        data: counts
      }
    ]
  };

  if (data.partList.length === 0) {
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
    initChart({ partList: [] });
    return;
  }

  try {
    const { data, error } = await fetchGetFrequentAlarmParts(props.deviceId, props.startTime, props.endTime);
    if (!error && data) {
      initChart(data);
    } else {
      initChart({ partList: [] });
    }
  } catch {
    initChart({ partList: [] });
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
