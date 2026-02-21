<template>
  <div>
    <NFlex class="rounded-10px p-10px h-full bg-container">
      <NTabs v-model:value="activeTab" class="w-full" type="line" @update:value="handleTabChange">
        <NTabPane name="factory" :tab="$t('page.equipment.factoryTab')" class="w-full h-full">
          <FactoryInfoTab ref="factoryTabRef" />
        </NTabPane>
        <NTabPane name="area" :tab="$t('page.equipment.areaTab')" class="w-full h-full">
          <FactoryAreaTab ref="areaTabRef" @view-device="handleViewDevice" />
        </NTabPane>
        <NTabPane name="device" :tab="$t('page.equipment.deviceTab')" class="w-full h-full">
          <DeviceTab ref="deviceTabRef" :view-device-data="viewDeviceData" />
        </NTabPane>
      </NTabs>
    </NFlex>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FactoryInfoTab from './components/factory-info-tab.vue';
import FactoryAreaTab from './components/factory-area-tab.vue';
import DeviceTab from './components/device-tab.vue';

defineOptions({
  name: 'EquipmentCenterPage'
});

const activeTab = ref('factory');
const factoryTabRef = ref<any>(null);
const areaTabRef = ref<any>(null);
const deviceTabRef = ref<any>(null);
const viewDeviceData = ref<any>(null);

function handleTabChange(tab: string) {
  if (tab === 'area' || tab === 'factory') {
    viewDeviceData.value = null;
  }
}

function handleViewDevice(device: any) {
  viewDeviceData.value = device;
  activeTab.value = 'device';
}
</script>

<style scoped></style>
