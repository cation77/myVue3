<template>
  <div class="virtualFlowContainer" ref="containerRef" @scroll="handleScroll">
    <div class="virtualFlowList">
      <div
        class="virtualFlowItem"
        v-for="{ item, style } in renderList"
        :key="item.id"
        :style="style"
      >
        <slot :data="item"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDebounceFn, useThrottleFn } from '@vueuse/core';
import type { IFlowCard, ICardRect, IRenderCard } from './type';

const props = defineProps<{
  gap: number;
  column: number;
  pageSize: number;
  enterSize?: number;
}>();

const emits = defineEmits<{
  (event: 'request', page: number, pageSize: number): void;
}>();

defineSlots<{
  default(props: { data: IFlowCard }): any;
}>();

const containerRef = ref<HTMLDivElement>();
const resizeRef = ref<ResizeObserver>();

const dataState = reactive({
  loading: false,
  isFinish: false,
  currentPage: 1,
  list: [] as IFlowCard[]
});

const scrollState = reactive({
  viewWidth: 0,
  viewHeight: 0,
  start: 0
});

const queueState = reactive({
  queue: new Array(props.column).fill(0).map(() => ({ list: [], height: 0 })),
  len: 0
});

const end = computed(() => scrollState.viewHeight + scrollState.start);

const renderList = computed(() => {
  const cardList = queueState.queue.reduce<IRenderCard[]>(
    (pre, { list }) => pre.concat(list),
    []
  );
  return cardList.filter(
    (item) => item.h + item.y > scrollState.start && item.y < end.value
  );
});

const itemSizeInfo = computed(() => dataState.list);

const computedHeight = computed(() => {
  let minIndex = 0;
  let minHeight = Infinity;
  let maxHeight = -Infinity;
  queueState.queue.forEach(({ height }, index) => {
    if (height < minHeight) {
      minHeight = height;
      minIndex = index;
    }
    if (height > maxHeight) {
      maxHeight = height;
    }
  });
  return { minHeight, maxHeight, minIndex };
});

// const listStyle = computed(() =>({ height: `${}px`}))

const generatorItem = () => {};

const addInQueue = (size = props.pageSize) => {
  for (let i = 0; i < size; i++) {
    const minIndex = computedHeight.value.minIndex;
    const currentColumn = queueState.queue[minIndex];
    const before = currentColumn.list[currentColumn.list.length - 1] || null;
    const dataItem = dataState.list[queueState.len];
    const item = generatorItem(dataItem, before, minIndex);
  }
};

const rcComputedQueue = () => {
  queueState.queue = new Array(props.column)
    .fill(0)
    .map(() => ({ list: [], height: 0 }));
  queueState.len = 0;
  addInQueue(dataState.list.length);
};

const initScrollState = () => {
  scrollState.viewWidth = containerRef.value!.clientWidth;
  scrollState.viewHeight = containerRef.value!.clientHeight;
  scrollState.start = containerRef.value!.scrollTop;
};

const handleScroll = () => {};

const handleResize = useDebounceFn(() => {
  initScrollState();
  rcComputedQueue();
}, 200);

const resizeObserver = new ResizeObserver(handleResize);

onMounted(() => {
  resizeObserver.observe(containerRef.value!);
  initScrollState();
});

onUnmounted(() => {
  resizeObserver.unobserve(containerRef.value!);
});
</script>
<style scoped lang="scss"></style>
