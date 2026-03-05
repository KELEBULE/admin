<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { fetchGetPartTemperatureTrend } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'PartTemperatureTrend'
});

const props = defineProps<{
  partId: number;
  startTime: string;
  endTime: string;
}>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

function initChart(data: Api.Alarm.TemperatureTrendResult) {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const times = data.trendData.map((item: Api.Alarm.TemperatureTrendItem) => item.detectTime.substring(5));
  const temperatures = data.trendData.map((item: Api.Alarm.TemperatureTrendItem) => item.detectValue);
  const level1Values = data.trendData.map((item: Api.Alarm.TemperatureTrendItem) => item.level1Value);
  const level2Values = data.trendData.map((item: Api.Alarm.TemperatureTrendItem) => item.level2Value);
  const level3Values = data.trendData.map((item: Api.Alarm.TemperatureTrendItem) => item.level3Value);

  const series: echarts.SeriesOption[] = [
    {
      name: $t('page.monitor.temperature'),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: '#188df0'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 141, 240, 0.2)' },
          { offset: 1, color: 'rgba(24, 141, 240, 0.02)' }
        ])
      },
      data: temperatures
    }
  ];

  if (level1Values.some((v: number | undefined) => v !== null && v !== undefined)) {
    series.push({
      name: $t('page.equipment.level1Alarm'),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 1,
        type: 'dashed',
        color: '#dc2626'
      },
      data: level1Values
    });
  }

  if (level2Values.some((v: number | undefined) => v !== null && v !== undefined)) {
    series.push({
      name: $t('page.equipment.level2Alarm'),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 1,
        type: 'dashed',
        color: '#f97316'
      },
      data: level2Values
    });
  }

  if (level3Values.some((v: number | undefined) => v !== null && v !== undefined)) {
    series.push({
      name: $t('page.equipment.level3Alarm'),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 1,
        type: 'dashed',
        color: '#3b82f6'
      },
      data: level3Values
    });
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((item: any) => {
          if (item.value !== null) {
            result += `${item.marker} ${item.seriesName}: ${item.value}°C<br/>`;
          }
        });
        return result;
      }
    },
    legend: {
      data: series.map(s => (s as any).name).filter(Boolean),
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 10
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
      data: times,
      axisLabel: {
        interval: Math.floor(times.length / 6),
        fontSize: 10,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '°C',
      nameTextStyle: {
        fontSize: 10
      },
      axisLabel: {
        fontSize: 10
      }
    },
    series
  };

  if (data.trendData.length === 0) {
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
    initChart({ trendData: [] });
    return;
  }

  try {
    const { data, error } = await fetchGetPartTemperatureTrend(props.partId, props.startTime, props.endTime);
    if (!error && data) {
      initChart(data);
    } else {
      initChart({ trendData: [] });
    }
  } catch {
    initChart({ trendData: [] });
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
