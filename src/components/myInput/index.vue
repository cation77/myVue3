<template>
  <div class="myInbutBox">
    <component
      :is="h(Input, { ...$attrs, ...props, ref: changeRef as any }, $slots)"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { h, getCurrentInstance } from 'vue';
import { Input, type InputProps } from 'ant-design-vue';

const props = defineProps<Partial<InputProps>>();
const vm = getCurrentInstance();

const changeRef = (refInstance: any) => {
  if (vm) {
    vm.exposed = refInstance || {};
    vm.exposeProxy = refInstance || {};
  }
};
</script>

<style lang="scss" scoped></style>
