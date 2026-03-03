<template>
  <div>
    <NGrid :cols="7" class="w-full h-full">
      <NGridItem :span="2" class="h-300px flex items-center justify-center">
        <AlarmLevel />
      </NGridItem>
      <NGridItem :span="2" class="h-300px flex items-center justify-center">
        <DeviceStatue />
      </NGridItem>
      <NGridItem :span="3" class="h-300px flex items-center justify-center">
        <AlarmDevice />
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import DeviceStatue from './components/device-statue.vue';
import AlarmLevel from './components/alarm-level.vue';
import AlarmDevice from './components/alarm-device.vue';
</script>

<style scoped></style>
