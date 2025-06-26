<template>
  <div class="masonryBox">
    <VirtualList @request="getMockData" :list="list">
      <template #default="{ data }">
        <div class="contentBox">{{ data.id }} - {{ data.content }}</div>
      </template>
    </VirtualList>
  </div>
</template>
<script setup lang="ts">
import VirtualList from '@/components/virtualList/index.vue';
import Mock from 'mockjs';

type IContent = {
  id: number;
  content: string;
};

const list = ref<IContent[]>([]);

const getMockData = () => {
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
.masonryBox {
  margin: 0 50px;
  height: 720px;
  // overflow-y: auto;
  .contentBox {
    border: 1px solid #000;
    padding: 10px;
    letter-spacing: 0.1em;
    margin-top: 8px;
  }
}
</style>
