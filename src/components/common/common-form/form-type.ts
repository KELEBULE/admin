/**
 * 通用选项接口，用于下拉选择、单选、多选等组件的选项数据
 */
export interface Info {
  /** 选项的值 */
  value: string | number;
  /** 选项的显示文本 */
  label: string;
  /** 其他自定义属性 */
  [key: string]: any;
}

/**
 * 表单数据模型接口，用于定义表单字段及其对应值
 */
export interface Model {
  /** 表单字段名与字段值的映射关系 */
  [key: string]: any;
}

/**
 * 表单字段配置接口，用于定义表单中每个字段的属性和行为
 */
export interface Field {
  /** 字段名，对应model中的属性名 */
  value: string;
  /** 字段标签文本 */
  label: string;
  /** 自定义插槽名，用于完全自定义字段的渲染 */
  slot?: string;
  /** 字段容器的自定义类名 */
  class?: string;
  /** 字段标签宽度 */
  labelWidth?: string;
  /** 字段标签的自定义插槽名 */
  labelSlot?: string;
  /** 字段使用的组件类型，如"input"、"select"等 */
  component?: string;
  /** 选项列表，用于下拉选择、单选、多选等组件 */
  list?: Info[];
  /** 组件事件监听器 */
  on?: object;
  /** 组件的额外属性 */
  extraProps?: any;
  /** 字段前缀内容 */
  prefix?: string;
  /** 字段前缀的自定义类名 */
  prefixClass?: string;
  /** 字段后缀内容 */
  suffix?: string;
  /** 字段后缀的自定义类名 */
  suffixClass?: string;
  /** 字段占用的栅格列数 */
  span?: number;
  /** 计算后的字段栅格列数，用于响应式布局 */
  computedSpan?: number;
}
