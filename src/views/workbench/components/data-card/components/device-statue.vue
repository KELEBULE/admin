<template>
  <div class="w-300px h-300px flex flex-col">
    <div ref="chartRef" class="flex-1 w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as echarts from 'echarts';
import { fetchGetDeviceStatusOverview } from '@/service/api/equipment';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceStatue'
});

interface StatusItem {
  status: number;
  statusName: string;
  count: number;
  percentage: number;
}

interface DeviceStatusOverview {
  statusDistribution: StatusItem[];
}

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;
const loading = ref(true);

const statusColorMap: Record<number, string> = {
  1: '#22c55e',
  2: '#f97316',
  3: '#6b7280'
};

function initChart(data: DeviceStatusOverview) {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const chartData = data.statusDistribution.map(item => ({
    value: item.count,
    name: `${item.statusName} (${item.percentage}%)`,
    itemStyle: { color: statusColorMap[item.status] || '#9ca3af' }
  }));

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}台'
    },
    legend: {
      bottom: 0,
      left: 'center',
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
    const { data, error } = await fetchGetDeviceStatusOverview();
    if (!error && data) {
      initChart(data);
    } else {
      initChart({ statusDistribution: [] });
    }
  } catch {
    initChart({ statusDistribution: [] });
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
