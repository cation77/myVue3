<template>
  <div class="waterfallFlowBox"></div>
</template>
<script setup lang="ts">
import Mock from 'mockjs';

const list = ref<any[]>([]);

const getMockData = () => {
  console.log('get mock data');
  if (list.value.length > 599) return;
  const newData = [];
  for (let i = 0; i < 100; i++) {
    const len: number = list.value.length + newData.length;
    newData.push({
      id: len,
      content: Mock.mock('@csentence(40, 360)') // 内容
    });
  }
  list.value = [...list.value, ...newData];
};

onMounted(() => {
  getMockData();
});
</script>

<style scoped lang="scss">
.waterfallFlowBox {
  margin: 0 50px;
  height: 720px;
}
</style>
