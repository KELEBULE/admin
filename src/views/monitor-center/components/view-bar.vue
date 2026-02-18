<template>
  <div class="absolute bottom-30px left-50% w-280px transform-translate-x--50% z-1002">
    <NCard size="small" :bordered="false">
      <NSpace :size="4" justify="space-between">
        <NButton :type="currentView === 'left' ? 'primary' : 'default'" size="small" @click="switchView('left')">左视角</NButton>
        <NButton :type="currentView === 'right' ? 'primary' : 'default'" size="small" @click="switchView('right')">右视角</NButton>
        <NButton :type="currentView === 'front' ? 'primary' : 'default'" size="small" @click="switchView('front')">前视角</NButton>
        <NButton :type="currentView === 'back' ? 'primary' : 'default'" size="small" @click="switchView('back')">后视角</NButton>
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export type ViewType = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back' | 'default';

const emit = defineEmits<{
  switchView: [view: ViewType];
}>();

const currentView = ref<ViewType>('default');

const CAMERA_DISTANCE = 5;

const viewPositions: Record<ViewType, { x: number; y: number; z: number }> = {
  top: { x: 0, y: CAMERA_DISTANCE, z: 0.001 },
  bottom: { x: 0, y: -CAMERA_DISTANCE, z: 0.001 },
  left: { x: -CAMERA_DISTANCE * 0.7, y: 2, z: CAMERA_DISTANCE * 0.7 },
  right: { x: CAMERA_DISTANCE * 0.7, y: 2, z: CAMERA_DISTANCE * 0.7 },
  front: { x: 0, y: 1, z: CAMERA_DISTANCE },
  back: { x: 0, y: 1, z: -CAMERA_DISTANCE },
  default: { x: 4, y: 3, z: 4 }
};

function switchView(view: ViewType) {
  currentView.value = view;
  emit('switchView', view);
}

function getViewPosition(view: ViewType) {
  return viewPositions[view];
}

function resetToDefault() {
  currentView.value = 'default';
}

defineExpose({
  getViewPosition,
  resetToDefault,
  currentView
});
</script>

<style scoped lang="scss"></style>
