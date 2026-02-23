<template>
  <div class="h-full">
    <NGrid class="h-full w-full" :cols="5" x-gap="4">
      <NGridItem :span="2" class="h-full flex items-center justify-center">
        <div ref="chartRef" class="w-180px h-180px flex-shrink-0"></div>
      </NGridItem>
      <NGridItem :span="3" class="h-full flex items-center">
        <NGrid :cols="2" :rows="4" y-gap="8px" x-gap="8px" class="w-full">
          <NGridItem class="flex items-center justify-between">
            <span class="text-gray-500">{{ $t('page.workbench.uncompleted') }}</span>
            <span class="text-gray-500">{{ (statistics?.total || 0) - (statistics?.completed || 0) }}</span>
          </NGridItem>
          <NGridItem class="flex items-center justify-between">
            <span class="text-gray-500">{{ $t('page.workbench.completed') }}</span>
            <span class="text-blue-500">{{ statistics?.completed || 0 }}</span>
          </NGridItem>
          <NGridItem class="flex items-center justify-between">
            <span class="text-gray-500">{{ $t('page.workbench.totalOrders') }}</span>
            <span class="text-gray-500">{{ statistics?.total || 0 }}</span>
          </NGridItem>
          <NGridItem class="flex items-center justify-between">
            <span class="text-gray-500">{{ $t('page.workbench.completionRate') }}</span>
            <span class="text-blue-500">{{ statistics?.completionRate || 0 }}%</span>
          </NGridItem>
          <NGridItem class="flex items-center justify-between">
            <span class="text-gray-500">{{ $t('page.workbench.priorityUrgent') }}</span>
            <span class="text-red-600">{{ priorityUrgent }}</span>
          </NGridItem>
          <NGridItem class="flex items-center justify-between">
            <span class="text-gray-500">{{ $t('page.workbench.priorityHigh') }}</span>
            <span class="text-orange-500">{{ priorityHigh }}</span>
          </NGridItem>
          <NGridItem class="flex items-center justify-between">
            <span class="text-gray-500">{{ $t('page.workbench.priorityMedium') }}</span>
            <span class="text-yellow-600">{{ priorityMedium }}</span>
          </NGridItem>
          <NGridItem class="flex items-center justify-between">
            <span class="text-gray-500">{{ $t('page.workbench.priorityLow') }}</span>
            <span class="text-green-500">{{ priorityLow }}</span>
          </NGridItem>
        </NGrid>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { request } from '@/service/request';
import { $t } from '@/locales';

defineOptions({
  name: 'WorkOrderCard'
});

interface PriorityDistribution {
  priority: number;
  priorityName: string;
  count: number;
}

interface StatusDistribution {
  status: number;
  statusName: string;
  count: number;
}

interface Statistics {
  total: number;
  completed: number;
  completionRate: number;
  priorityDistribution: PriorityDistribution[];
  statusDistribution: StatusDistribution[];
}

const statistics = ref<Statistics | null>(null);
const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

const priorityUrgent = computed(() => statistics.value?.priorityDistribution?.find(p => p.priority === 1)?.count || 0);
const priorityHigh = computed(() => statistics.value?.priorityDistribution?.find(p => p.priority === 2)?.count || 0);
const priorityMedium = computed(() => statistics.value?.priorityDistribution?.find(p => p.priority === 3)?.count || 0);
const priorityLow = computed(() => statistics.value?.priorityDistribution?.find(p => p.priority === 4)?.count || 0);

const statusColorMap: Record<number, string> = {
  0: '#faad14',
  1: '#1890ff',
  2: '#52c41a',
  3: '#722ed1',
  4: '#d9d9d9'
};

const priorityChartData = computed(() => {
  const data = [
    { value: priorityUrgent.value, name: $t('page.workbench.priorityUrgent'), color: '#dc2626' },
    { value: priorityHigh.value, name: $t('page.workbench.priorityHigh'), color: '#f97316' },
    { value: priorityMedium.value, name: $t('page.workbench.priorityMedium'), color: '#ca8a04' },
    { value: priorityLow.value, name: $t('page.workbench.priorityLow'), color: '#22c55e' }
  ];
  return data
    .filter(item => item.value > 0)
    .map(item => ({
      value: item.value,
      name: item.name,
      itemStyle: { color: item.color }
    }));
});

const statusChartData = computed(() => {
  const list = statistics.value?.statusDistribution || [];
  return list.map(item => ({
    value: item.count,
    name: item.statusName,
    itemStyle: { color: statusColorMap[item.status] || '#9ca3af' }
  }));
});

function initChart() {
  if (!chartRef.value || !statistics.value) return;
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = echarts.init(chartRef.value);
  const completed = statistics.value.completed || 0;
  const total = statistics.value.total || 0;
  const uncompleted = total - completed;
  chartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['70%', '85%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 2, borderColor: '#fff', borderWidth: 1 },
        label: { show: false },
        emphasis: { disable: false },
        data: [
          { value: completed, name: $t('page.workbench.completed'), itemStyle: { color: '#3b82f6' } },
          { value: uncompleted, name: $t('page.workbench.uncompleted'), itemStyle: { color: '#e5e7eb' } }
        ]
      },
      {
        type: 'pie',
        radius: ['45%', '60%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 2, borderColor: '#fff', borderWidth: 1 },
        label: { show: false },
        emphasis: {
          emphasis: { disable: false }
        },
        data: priorityChartData.value.length > 0 ? priorityChartData.value : [{ value: 1, name: '', itemStyle: { color: '#e5e7eb' } }]
      },
      {
        type: 'pie',
        radius: ['20%', '35%'],
        itemStyle: { borderRadius: 2, borderColor: '#fff', borderWidth: 1 },
        label: { show: false },
        emphasis: {
          emphasis: { disable: false }
        },
        data: statusChartData.value.length > 0 ? statusChartData.value : [{ value: 1, name: '', itemStyle: { color: '#e5e7eb' } }]
      }
    ]
  });
}

function resizeChart() {
  chartInstance?.resize();
}

watch(statistics, async () => {
  if (statistics.value) {
    await nextTick();
    initChart();
  }
});

async function fetchStatistics() {
  try {
    const { data, error } = await request<Statistics>({
      url: '/device_work_order/statistics',
      method: 'GET'
    });
    if (!error && data) {
      statistics.value = data;
    }
  } catch {
    // ignore
  }
}

onMounted(() => {
  fetchStatistics();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
});
</script>
