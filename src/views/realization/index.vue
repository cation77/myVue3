<template>
  <div class="homePage">
    <h1>Vue 验证</h1>
    <div class="m-[10px]"><myButton @click="handleCount">累加</myButton></div>

    <div>累加值：{{ count }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { effect, reactive } from '@/vueCoding/reactive';
import myButton from '@/components/myButton/index.vue';

const count = ref(0);
const state = reactive({ count: 1 });

effect(() => {
  count.value = state.count;
});

const handleCount = () => {
  state.count++;
};
</script>
