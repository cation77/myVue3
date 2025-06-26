<template>
  <component
    :is="h(Button, { ...$attrs, ...props, ref: changeRef as any }, $slots)"
  ></component>
</template>

<script lang="ts" setup>
import { h, getCurrentInstance } from 'vue';
import { Button, type ButtonProps } from 'ant-design-vue';

const props = defineProps<Partial<ButtonProps>>();
const vm = getCurrentInstance();

const changeRef = (refInstance: any) => {
  if (vm) {
    vm.exposed = refInstance || {};
    vm.exposeProxy = refInstance || {};
  }
};
</script>

<style lang="scss" scoped></style>
