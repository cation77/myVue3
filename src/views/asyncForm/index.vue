<template>
  <elFormbuilder ref="formRef" :formItems v-model="formData" :rules>
    <template #tip>成年了</template>
  </elFormbuilder>

  <el-button type="primary" @click="handleSubmit">提交</el-button>
</template>

<script lang="ts" setup>
import { ref, computed, useTemplateRef } from 'vue';
import elFormbuilder from '@/components/form/elFormbuilder.vue';
import type { IFormItem } from '@/components/form/types';

const formInstance = useTemplateRef<HTMLFormElement>('formRef');
const age = ref(0);
const formItems = computed<IFormItem[]>(() => [
  {
    label: '姓名',
    type: 'input',
    key: 'name',
    span: 12,
    props: {
      placeholder: '请输入姓名'
    }
  },
  {
    label: '年龄',
    type: 'inputNumber',
    key: 'age',
    span: 12,
    props: {
      controls: false,
      onChange: (e: any) => {
        age.value = e;
      }
    }
  },

  {
    label: '提示',
    key: 'tip',
    hide: age.value < 18
  },

  {
    label: '性别',
    type: 'select',
    key: 'gender',
    span: 16,
    hide: age.value < 18,
    props: {
      placeholder: '请选择性别',
      options: [
        { label: '男', value: '1' },
        { label: '女', value: '2' }
      ]
    }
  }
]);

const formData = ref({});
const rules = {
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
};

const handleSubmit = () => {
  formInstance.value?.validate().then((res: any) => {
    if (res) {
      console.log('validate--->', formData.value);
    }
  });
};
</script>

<style lang="scss" scoped></style>
