<template>
  <el-form ref="formRef" :rules="rules" :model="modelValue" label-width="120px">
    <el-row :gutter="20">
      <el-col v-for="item in items" :key="item.key" :span="item.span || 24">
        <el-form-item :label="item.label" :prop="item.key">
          <slot :name="item.key">
            <componentItem :item="item"></componentItem>
          </slot>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { h, useTemplateRef, computed, useSlots } from 'vue';
import {
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox
} from 'element-plus';

const props = defineProps(['formItems', 'rules']);

const modelValue = defineModel() as Ref<Record<string, any>>;

const slots = useSlots();

const formInstance = useTemplateRef<HTMLFormElement>('formRef');

const items = computed(() =>
  props.formItems.filter((item: any) => !item.hidden)
);
const transformOptions = (
  component: Component,
  optionsComponent: Component
) => {
  return (props: { options: { label: string; value: string | number }[] }) => {
    const { options = [] } = props;
    return h(component, props, () =>
      options.map((item) =>
        h(optionsComponent, {
          label: item.label,
          value: item.value
        })
      )
    );
  };
};

const compoentMap: Record<string, Component> = {
  input: ElInput,
  inputNumber: ElInputNumber,
  select: transformOptions(ElSelect, ElOption),
  radioGroup: transformOptions(ElRadioGroup, ElRadio),
  checkboxGroup: transformOptions(ElCheckboxGroup, ElCheckbox)
};

const rootProps = ['label', 'type', 'value', 'span'];
function getProps(item: Record<string, any>) {
  if (item.props) return item.props;
  const { label, type, value, span, ...rest } = item;
  return rest;
  // return omit(item, rootProps);
}

function getComponent(item: Record<string, any>) {
  const { type } = item;

  if (typeof type !== 'string') {
    return type;
  }
  return compoentMap[type];
}

const componentItem = {
  props: ['item'],
  setup(props: { item: Record<string, any> }) {
    return () => {
      const { item } = props;
      return h(
        getComponent(item),
        {
          ...reactive(getProps(item)),
          modelValue: modelValue.value[item.key],
          'onUpdate:modelValue': (value: any) =>
            (modelValue.value[item.key] = value)
        },
        Object.assign(
          item.slots || {},
          Object.entries(item.slots || {}).reduce(
            (acc, [key, value]) => {
              if (typeof value === 'string') {
                if (slots[value]) {
                  acc[key] = slots[value];
                }
              }
              return acc;
            },
            {} as Record<string, any>
          )
        )
      );
    };
  }
};

defineExpose({
  validate(...args: any) {
    return formInstance.value?.validate(...args);
  }
});
</script>

<style lang="scss" scoped></style>
