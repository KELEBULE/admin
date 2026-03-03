<template>
  <div class="w-full h-full flex flex-col">
    <div ref="chartRef" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as echarts from 'echarts';
import { fetchGetAlarmLevelDistribution } from '@/service/api/alarm/device-alarm';
import { $t } from '@/locales';

defineOptions({
  name: 'AlarmLevel'
});

interface LevelItem {
  level: number;
  levelName: string;
  count: number;
  percentage: number;
}

interface AlarmLevelDistribution {
  levelDistribution: LevelItem[];
}

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;
const loading = ref(true);

const levelColorMap: Record<number, string> = {
  1: '#dc2626',
  2: '#f97316',
  3: '#3b82f6'
};

function initChart(data: AlarmLevelDistribution) {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const chartData = data.levelDistribution.map(item => ({
    value: item.count,
    name: `${item.levelName} (${item.percentage}%)`,
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
        color: '#9ca3af'
      },
      icon: 'circle',
      formatter: (name: string) => name.split(' (')[0]
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
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
        data: chartData.length > 0 ? chartData : [{ value: 1, name: $t('page.workbench.noData'), itemStyle: { color: '#e5e7eb' } }]
      }
    ]
  };

  chartInstance.setOption(option);
}

function resizeChart() {
  chartInstance?.resize();
}

async function fetchData() {
  try {
    loading.value = true;
    const { data, error } = await fetchGetAlarmLevelDistribution();
    if (!error && data) {
      initChart(data);
    } else {
      initChart({ levelDistribution: [] });
    }
  } catch {
    initChart({ levelDistribution: [] });
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
