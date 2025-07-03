<template>
  <elFormbuilder ref="formRef" :formItems v-model="formData" :rules>
    <template #tip>特别有时候</template>
  </elFormbuilder>

  <el-button type="primary" @click="handleSubmit">提交</el-button>
</template>

<script lang="ts" setup>
import elFormbuilder from '@/components/form/elFormbuilder.vue';

const formInstance = useTemplateRef<HTMLFormElement>('formRef');

const formItems = [
  {
    label: '姓名',
    type: 'input',
    key: 'name',
    span: 12,
    props: { placeholder: '请输入姓名' }
  },
  {
    label: '年龄',
    type: 'inputNumber',
    key: 'age',
    span: 12,
    props: {
      controls: false
    }
  },
  {
    label: '提示',
    key: 'tip'
  },

  {
    label: '性别',
    type: 'select',
    key: 'sex',
    span: 16,
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
