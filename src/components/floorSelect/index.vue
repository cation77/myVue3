<template>
  <div class="floor-select" v-if="floorList.length">
    <myButton @click="handleClick('prev')"> <UpOutlined /> </myButton>
    <ul ref="listBoxRef">
      <li
        v-for="item in floorList"
        :class="{ active: activeFloor === item.value }"
        :key="item.value"
        @click="onChange(item)"
      >
        {{ item.label }}
      </li>
    </ul>
    <myButton @click="handleClick('next')"> <DownOutlined /> </myButton>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { UpOutlined, DownOutlined } from '@ant-design/icons-vue';
import myButton from '@/components/myButton/index.vue';
import useScroll from '@/hooks/scroll';

type Floor = {
  label: string;
  value: number;
};
const floorList = ref<Floor[]>([]);

const listBoxRef = ref();
const activeFloor = ref();
const { prev, next } = useScroll(listBoxRef, 'column');
const handleClick = useDebounceFn((evType: 'next' | 'prev') => {
  if (evType === 'next') {
    next();
  } else {
    prev();
  }
}, 100);
const onChange = (item: Floor) => {
  if (activeFloor.value !== item.value) {
    activeFloor.value = item.value;
  }
};

onMounted(() => {
  const len = Math.floor(Math.random() * 50) + 10;
  const arr = new Array(len)
    .fill(0)
    .map((_, index) => ({
      label: `${index + 1}F`,
      value: index + 1
    }))
    .reverse();
  floorList.value = arr;
});
</script>

<style lang="scss" scoped>
.floor-select {
  position: absolute;
  z-index: 1;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  min-width: 40px;
  max-height: 320px;
  border-radius: 2px;
  background: #ffffff;
  align-items: center;
  .el-button {
    padding: 0;
    width: 100%;
    border: 0;
    min-height: 32px;
    color: #d8d8d8;
    font-size: 16px;
  }
  ul {
    flex: 1;
    height: 0;
    margin: 0;
    width: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
    list-style: none;
    overflow: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    li {
      width: 100%;
      color: #3d3d3d;
      min-height: 32px;
      padding: 0 6px;
      font-size: 14px;
      line-height: 32px;
      text-align: center;
      cursor: pointer;
      &.active {
        background: #3997ea;
        color: #fff;
      }
    }
  }
}
</style>
