<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { fetchGetPartAlarmLevelDistribution } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'PartAlarmLevelDistribution'
});

const props = defineProps<{
  partId: number;
  startTime: string;
  endTime: string;
}>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

const levelColorMap: Record<number, string> = {
  1: '#dc2626',
  2: '#f97316',
  3: '#3b82f6'
};

function initChart(data: Api.Alarm.DeviceAlarmLevelStatsResult) {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const chartData = data.levelStats
    .filter(item => item.count > 0)
    .map(item => ({
      value: item.count,
      name: item.levelName,
      itemStyle: { color: levelColorMap[item.level] || '#9ca3af' }
    }));

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 10
      },
      icon: 'circle'
    },
    series: [
      {
        name: $t('page.monitor.alarmLevel'),
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  };

  if (chartData.length === 0) {
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
    initChart({ levelStats: [] });
    return;
  }

  try {
    const { data, error } = await fetchGetPartAlarmLevelDistribution(props.partId, props.startTime, props.endTime);
    if (!error && data) {
      initChart(data);
    } else {
      initChart({ levelStats: [] });
    }
  } catch {
    initChart({ levelStats: [] });
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
