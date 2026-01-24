<template>
  <NTooltip trigger="hover">
    <template #trigger>
      <div class="cursor-pointer table-toolbar-right-icon">
        <NPopover trigger="click" :width="230" class="toolbar-popover" placement="bottom-end">
          <template #trigger>
            <div><Icon icon="uil:setting" size="18" class="text-18px" /></div>
          </template>
          <template #header>
            <div class="table-toolbar-inner-popover-title">
              <NSpace justify="space-between">
                <NCheckbox v-model:checked="state.checkAll" @update:checked="onCheckAll">
                  {{ $t('common.selectAll') }}
                </NCheckbox>
                <NCheckbox
                  v-if="cacheColumnsList.some((item: any) => item.type === 'selection')"
                  v-model:checked="state.selection"
                  @update:checked="onSelection"
                >
                  {{ $t('common.check') }}
                </NCheckbox>
                <NButton text type="info" size="small" class="mt-1" @click="resetColumns">
                  {{ $t('common.reset') }}
                </NButton>
              </NSpace>
            </div>
          </template>
          <div class="table-toolbar-inner">
            <NScrollbar style="max-height: 290px">
              <NCheckboxGroup v-model:value="state.checkList" @update:value="onChange">
                <VueDraggable v-model="columnsList" :animation="300" item-key="key" handle=".drag-icon" filter=".no-draggable" @end="draggableEnd">
                  <div
                    v-for="item in columnsList"
                    :key="item.key"
                    class="table-toolbar-inner-checkbox"
                    :class="{
                      'table-toolbar-inner-checkbox-dark': themeStore.darkMode === true
                    }"
                  >
                    <span class="drag-icon" :class="{ 'no-draggable': item.key === 'selection' }">
                      <IconLocalDrag size="18" class="text-18px" />
                    </span>
                    <NCheckbox :value="item.key" :label="renderLabel(item.title)" />
                    <!-- <div class="fixed-item">
                      <NTooltip trigger="hover" placement="bottom">
                        <template #trigger>
                          <Icon
                            icon="ri:skip-left-line"
                            size="18"
                            class="text-18px"
                            :color="item.fixed === 'left' ? '#2080f0' : undefined"
                            @click="fixedColumn(item, 'left')"
                          />
                        </template>
                        <span>固定到左侧</span>
                      </NTooltip>
                      <NDivider vertical />
                      <NTooltip trigger="hover" placement="bottom">
                        <template #trigger>
                          <Icon
                            icon="ri:skip-right-line"
                            size="18"
                            class="text-18px"
                            :color="item.fixed === 'right' ? '#2080f0' : undefined"
                            @click="fixedColumn(item, 'right')"
                          />
                        </template>
                        <span>固定到右侧</span>
                      </NTooltip>
                    </div> -->
                  </div>
                </VueDraggable>
              </NCheckboxGroup>
            </NScrollbar>
          </div>
        </NPopover>
      </div>
    </template>
    <span>{{ $t('common.columnSetting') }}</span>
  </NTooltip>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, unref, watch } from 'vue';
import { cloneDeep, isEqual } from 'lodash-es';
import { Icon } from '@iconify/vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useThemeStore } from '@/store/modules/theme';
import { isArray, isString } from '@/utils/typeof';

const props = defineProps<{
  initData: any;
}>();
const emit: any = defineEmits(['controlColumns']);
const themeStore = useThemeStore();

interface Options {
  title: string;
  key: string;
  fixed?: boolean | 'left' | 'right';
}
const columnsList = ref<Options[]>([]);
const cacheColumnsList = ref<Options[]>([]); // 克隆一份原始数据
const state: any = reactive({
  selection: true,
  checkAll: true,
  checkList: [],
  defaultCheckList: []
});
const isDraggable = ref(false);

watch(
  () => props.initData,
  () => {
    isDraggable.value = false;
    cacheColumnsList.value = cloneDeep(props.initData);
    const columns = getColumnsFn();
    if (columns.length) {
      init();
    }
  },
  { immediate: true }
);

// 初始化
function init() {
  const columns: any[] = getColumnsFn();
  const checkList: any = columns.map(item => item.key).filter(item => item);
  columnsList.value = cloneDeep(columns);

  // 拖拽结束后，保留之前的勾选状态
  if (!isDraggable.value) {
    isDraggable.value = false;
    state.checkList = checkList;
    state.defaultCheckList = checkList;
  }
}

// 设置
function setColumns(list: any) {
  const columns: any[] = cloneDeep(list);
  if (!isArray(columns)) return;

  if (isString(list[0])) {
    const cacheKeys = columnsList.value.map((item: any) => item.key);
    const newColumns: any[] = [];
    cacheColumnsList.value.forEach((item: any) => {
      if (list.includes(item.key)) {
        newColumns.push({ ...item });
      }
    });
    if (!isEqual(cacheKeys, columns)) {
      newColumns.sort((prev, next) => {
        return cacheKeys.indexOf(prev.key) - cacheKeys.indexOf(next.key);
      });
    }
    // console.log('filed', newColumns);
    emit('controlColumns', handleSelectionActions(newColumns));
  } else {
    // console.log('array', columns);
    emit('controlColumns', handleSelectionActions(columns));
  }
}

// 勾选列、操作栏、单独处理
function handleSelectionActions(columns: any) {
  const newColumns = cloneDeep(columns);

  // 勾选列
  if (state.selection) {
    const selection = cacheColumnsList.value.filter((item: any) => item.type === 'selection');
    if (selection.length) {
      newColumns.unshift(selection[0]);
    }
  }

  // 展开列
  const expands = cacheColumnsList.value.filter((item: any) => item.type === 'expand');
  if (expands.length) {
    newColumns.unshift(expands[0]);
  }

  // 操作栏
  const actions = cacheColumnsList.value.filter((item: any) => item.key === 'actions' && item.title === '操作');
  if (actions.length) {
    newColumns.push(actions[0]);
  }
  return newColumns;
}

// 获取
function getColumnsFn() {
  const columns = cloneDeep(cacheColumnsList.value);
  return columns
    .filter((item: any) => item.type !== 'expand' && item.type !== 'selection' && item.key !== 'actions' && item.title !== '操作')
    .map((item: any) => {
      return { ...item, title: item.title, key: item.key, fixed: item.fixed || undefined };
    });
}

// 重置
function resetColumns() {
  state.checkList = [...state.defaultCheckList];
  state.checkAll = true;
  const newColumns = getColumnsFn();
  setColumns(newColumns);
  columnsList.value = newColumns;
}

// 全选
function onCheckAll(e: any) {
  const checkList = columnsList.value.map((item: any) => item.key);
  if (e) {
    setColumns(checkList);
    state.checkList = checkList;
  } else {
    setColumns([]);
    state.checkList = [];
  }
}

// 单选
function onChange(checkList: any) {
  // if (state.selection && !checkList.includes('selection')) {
  //   checkList.unshift('selection');
  // }
  setColumns(checkList);
}

// 拖拽排序
function draggableEnd() {
  const columns = toRaw(unref(columnsList));
  columnsList.value = columns;

  const newColumns = columns.filter((item: any) => state.checkList.includes(item.key));
  setColumns(newColumns);
  isDraggable.value = true;
}

// 勾选列
function onSelection(e: any) {
  // const checkList = columnsList.value.map((item: any) => item.key);
  const checkList = cloneDeep(state.checkList);
  if (e) {
    setColumns(checkList);
  } else {
    setColumns(checkList);
  }
}

// 勾选列的显示名称处理
const renderLabel = (title: string | (() => string)) => {
  if (typeof title === 'function') {
    return title();
  }
  return title;
};

// 固定
// function fixedColumn(item: any, fixed: any) {
//   if (!state.checkList.includes(item.key)) return;
//   const isFixed = item.fixed === fixed ? undefined : fixed;
//   const index = columnsList.value.findIndex((res: any) => res.key === item.key);
//   const newColumns: any = [];
//   columnsList.value[index].fixed = isFixed;
//   columnsList.value.forEach((i: any) => {
//     if (state.checkList.includes(i.key)) {
//       newColumns.push({ ...i });
//     }
//   });
//   setColumns(newColumns);
// }
</script>

<style scoped lang="scss">
.table-toolbar-inner {
  &-checkbox {
    display: flex;
    align-items: center;
    padding: 10px 14px;

    &:hover {
      background: #e6f7ff;
    }

    .drag-icon {
      display: inline-flex;
      margin-right: 8px;
      cursor: move;
    }
    .drag-icon.no-draggable {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .fixed-item {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-left: auto;
    }
  }

  &-checkbox-dark {
    &:hover {
      background: hsla(0, 0%, 100%, 0.08);
    }
  }
}

.toolbar-popover {
  .n-popover__content {
    padding: 0;
  }
}
</style>
