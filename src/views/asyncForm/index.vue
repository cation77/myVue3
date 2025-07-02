<template>
  <elFormbuilder :formItems="formItems" v-model="formData"></elFormbuilder>
</template>

<script lang="ts" setup>
import elFormbuilder from '@/components/form/elFormbuilder.vue';

const formItems = [
  {
    labvel: '姓名',
    type: 'input',
    key: 'name',
    props: { placeholder: '请输入姓名' }
  },
  {
    labvel: '性别',
    type: 'select',
    key: 'sex',
    props: {
      placeholder: '请选择性别',
      options: [
        { label: '男', value: '1' },
        { label: '女', value: '2' }
      ]
    }
  }
];

const formData = ref({});

setTimeout(() => {
  formData.value = {
    name: '张三'
  };
}, 1000);

setTimeout(() => {
  console.log(formData.value);
}, 5000);
</script>

<style lang="scss" scoped></style>
