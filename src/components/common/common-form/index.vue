<template>
  <div class="common-form">
    <NForm v-bind="$attrs" ref="form" :model="formModel">
      <NGrid :cols="24" :x-gap="24" :collapsed="gridCollapsed && showFoldButton">
        <NFormItemGi
          v-for="field in fieldData"
          :key="field.value"
          :label="field.label"
          :path="field.value"
          :class="field.class"
          :label-width="field.labelWidth"
          :span="field.computedSpan"
        >
          <template #label>
            <template v-if="field.labelSlot">
              <slot :name="field.labelSlot" />
            </template>
            <template v-else>{{ field.label }}</template>
          </template>
          <span v-if="field.prefix" :class="field.prefixClass">
            {{ field.prefix }}
          </span>
          <template v-if="field.slot">
            <slot :name="field.slot" />
          </template>
          <template v-else>
            <template v-if="getProps(field)['value-format']">
              <component
                v-bind="getProps(field)"
                :is="com[field.component || 'n-input']"
                v-model:formatted-value="formModel[field.value]"
                :field="field"
                v-on="field.on || {}"
              >
                <template v-if="getProps(field)['switchCheckedSlot']" #checked>
                  {{ getProps(field)['switchCheckedSlot'] }}
                </template>
                <template v-if="getProps(field)['switchUncheckedSlot']" #unchecked>
                  {{ getProps(field)['switchUncheckedSlot'] }}
                </template>
              </component>
            </template>
            <template v-else>
              <component
                v-bind="getProps(field)"
                :is="com[field.component || 'n-input']"
                v-model:value="formModel[field.value]"
                :field="field"
                v-on="field.on || {}"
              >
                <template v-if="getProps(field)['switchCheckedSlot']" #checked>
                  {{ getProps(field)['switchCheckedSlot'] }}
                </template>
                <template v-if="getProps(field)['switchUncheckedSlot']" #unchecked>
                  {{ getProps(field)['switchUncheckedSlot'] }}
                </template>
                <template v-if="getProps(field)['inputNumberSlot']" #suffix>
                  {{ getProps(field)['inputNumberSlot'] }}
                </template>
              </component>
            </template>
          </template>
          <span v-if="field.suffix" :class="field.suffixClass">
            {{ field.suffix }}
          </span>
        </NFormItemGi>
        <!-- <NFormItemGi><slot /></NFormItemGi> -->
        <NFormItemGi v-if="showActionButton" :span="showFoldButton ? 5 : 24" :suffix="!gridCollapsed" :class="actionClass">
          <div class="flex gap-2 w-full" :class="{ 'flex-row-reverse': dialog, 'justify-end': !showFoldButton }">
            <NButton :type="confirmType" :size="size" @click="confirm">
              {{ confirmText }}
            </NButton>
            <NButton :type="cancelType" :size="size" @click="cancel">
              {{ cancelText }}
            </NButton>
            <NButton v-if="showFoldButton && gridSpanCount > 24" text type="info" @click="gridCollapsed = !gridCollapsed">
              <SvgIcon :icon="gridCollapsed ? 'ph:arrow-down-bold' : 'ph:arrow-up-bold'" />
              {{ gridCollapsed ? '展开' : '收起' }}
            </NButton>
          </div>
        </NFormItemGi>
      </NGrid>
    </NForm>
  </div>
</template>

<!-- 用于form组件使用,如用到了需要在这里添加 -->
<script setup lang="ts">
import { computed, reactive, ref, useAttrs } from 'vue';
import type { FormInst } from 'naive-ui';
import {
  NCascader,
  NColorPicker,
  NDatePicker,
  NDynamicTags,
  NEllipsis,
  NImage,
  NInput,
  NInputNumber,
  NSlider,
  NSwitch,
  NTimePicker,
  NTreeSelect
} from 'naive-ui';
import { assign, cloneDeep, forIn, has } from 'lodash-es';
import type { Field, Model } from './form-type';
import NCheckbox from './components/FormCheckobx.vue';
import NRadio from './components/FormRadio.vue';
import NSelect from './components/FormSelect.vue';
// import NUpload from "./components/FormUpload.vue";
import RemoteSelect from './components/RemoteSelect.vue';

type ButtonType = 'default' | 'tertiary' | 'primary' | 'info' | 'success' | 'warning' | 'error';
type ButtonSize = 'tiny' | 'small' | 'medium' | 'large';

const props = withDefaults(
  defineProps<{
    model: Model;
    fieldList: Field[];
    confirmText?: string;
    confirmType?: ButtonType;
    cancelText?: string;
    cancelType?: ButtonType;
    dialog?: boolean; // 是否在弹窗里
    actionClass?: string;
    showActionButton?: boolean;
    showFoldButton?: boolean; // 是否显示展开收起按钮
  }>(),
  {
    confirmText: '查询',
    cancelText: '重置',
    confirmType: 'primary',
    cancelType: 'default',
    dialog: false,
    showActionButton: true,
    showFoldButton: false,
    actionClass: () => {
      return '';
    }
  }
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm', form: FormInst): void;
}>();
const attrs = useAttrs();
const size: ButtonSize = (attrs.size as ButtonSize) ?? 'medium';
const gridCollapsed = ref(true); // 默认折叠收起
const gridSpanCount = ref(0); // 栅格列总数
const fieldData = computed(() => {
  let count = 5;
  return props.fieldList.map((item: any) => {
    const { span = 6 } = item;
    item.computedSpan = span;
    count += span;
    if (count > 24 && gridCollapsed.value && props.showFoldButton) item.computedSpan = 0;
    gridSpanCount.value = count;
    return item;
  });
});
//  components: {
//   NInput,
//   NInputNumber,
//   NSlider,
//   NSwitch,
//   NDatePicker,
//   NTimePicker,
//   NCascader,
//   NDynamicTags,
//   NCheckbox,
//   NRadio,
//   NSelect,
//   //NUpload,
//   NImage,
//   RemoteSelect,
//   NColorPicker,
//   NEllipsis,
// }

const com: Record<string, any> = {
  'n-input': NInput,
  'n-input-number': NInputNumber,
  'n-slider': NSlider,
  'n-switch': NSwitch,
  'n-date-picker': NDatePicker,
  'n-time-picker': NTimePicker,
  'n-cascader': NCascader,
  'n-dynamic-tags': NDynamicTags,
  'n-checkbox': NCheckbox,
  'n-radio': NRadio,
  'n-select': NSelect,
  'n-image': NImage,
  'remote-select': RemoteSelect,
  'n-color-picker': NColorPicker,
  'n-ellipsis': NEllipsis,
  'n-tree-select': NTreeSelect
};

const initModel = cloneDeep(props.model);
const form = ref<FormInst>();
const formModel = reactive<Model>(props.model);

const FORM_CONTEXT_EVENT_FLAG = '__formContextWrapped';

const wrapEventWithContext = (target: Record<string, any>, field: Field) => {
  const handlerKeys = ['onUpdateValue', 'onUpdateFormattedValue', 'onUpdate:value', 'onUpdate:formatted-value'];
  handlerKeys.forEach(key => {
    const handler = target[key];
    if (typeof handler !== 'function' || handler[FORM_CONTEXT_EVENT_FLAG]) return;
    const wrappedHandler: any = (...args: any[]) => {
      handler(...args, { formModel, field });
    };
    wrappedHandler[FORM_CONTEXT_EVENT_FLAG] = true;
    target[key] = wrappedHandler;
  });
};
const confirm = async () => {
  if (form.value) {
    await form.value.validate();
    emit('confirm', form.value);
  }
};
const reset = () => {
  assign(formModel, initModel);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  forIn(formModel, (val, key) => {
    if (!has(initModel, key)) {
      formModel[key] = null;
    }
  });
};
const cancel = async () => {
  if (form.value) {
    await form.value.restoreValidation();
    reset();
    emit('cancel');
  }
};

const getProps = (field: Field) => {
  const { component, label, extraProps } = field;
  const compProps = extraProps || {};
  if (!compProps.placeholder) {
    const isInput = typeof component === 'undefined' || component === 'n-input';
    compProps.placeholder = (isInput ? `请输入${label}` : `请选择${label}`).replace(/(.*)[:：]/, '$1');
  }
  wrapEventWithContext(compProps, field);
  return compProps;
};

defineExpose({
  confirm,
  cancel
});
</script>
