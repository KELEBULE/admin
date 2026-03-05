<template>
  <div class="w-full h-full flex flex-col">
    <div ref="chartRef" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { fetchGetAlarmLevelStats } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'AlarmLevelDistribution'
});

const props = defineProps<{
  deviceId: number | null;
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

  const totalCount = data.levelStats.reduce((sum, item) => sum + item.count, 0);

  if (totalCount === 0) {
    const option: echarts.EChartsOption = {
      title: {
        text: $t('page.workbench.noData'),
        left: 'center',
        top: '40%',
        textStyle: {
          color: '#9ca3af',
          fontSize: 14
        }
      },
      legend: {
        left: 'center',
        bottom: 0,
        textStyle: {
          color: '#9ca3af',
          fontSize: 10
        },
        icon: 'circle',
        data: ['一级报警', '二级报警', '三级报警']
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: false
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 1, name: '一级报警', itemStyle: { color: '#e5e7eb' } },
            { value: 1, name: '二级报警', itemStyle: { color: '#e5e7eb' } },
            { value: 1, name: '三级报警', itemStyle: { color: '#e5e7eb' } }
          ]
        }
      ]
    };
    chartInstance.setOption(option);
    return;
  }

  const chartData = data.levelStats.map(item => ({
    value: item.count,
    name: `${item.levelName} (${item.percentage.toFixed(1)}%)`,
    itemStyle: { color: levelColorMap[item.level] || '#9ca3af' }
  }));

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}次'
    },
    legend: {
      left: 'center',
      bottom: 0,
      textStyle: {
        color: '#9ca3af',
        fontSize: 10
      },
      icon: 'circle',
      formatter: (name: string) => name.split(' (')[0]
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  };

  chartInstance.setOption(option);
}

function resizeChart() {
  chartInstance?.resize();
}

async function fetchData() {
  if (!props.deviceId) {
    initChart({ levelStats: [] });
    return;
  }

  try {
    const { data, error } = await fetchGetAlarmLevelStats(props.deviceId, props.startTime, props.endTime);
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
