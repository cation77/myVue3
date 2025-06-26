<template>
  <div class="virtualContainer customScrollbar" ref="containerRef">
    <div class="virtualList" ref="virtualListRef" :style="scrollStyle">
      <div
        class="virtualItem"
        v-for="item in renderList"
        :id="String(item.id)"
        :key="item.id"
      >
        <slot :data="item"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import type { IPosInfo, IVirtual } from './type';

const props = withDefaults(
  defineProps<{
    list: IVirtual[];
    estimatedHeight?: number;
  }>(),
  { estimatedHeight: 120 }
);

const emits = defineEmits<{
  (event: 'request'): void;
}>();

defineSlots<{
  default(props: { data: IVirtual }): any;
}>();

const containerRef = ref<HTMLDivElement>();
const virtualListRef = ref<HTMLDivElement>();

const positions = ref<IPosInfo[]>([]);
const state = reactive({
  // 容器高度
  viewHeight: 0,
  // 列表高度
  listHeight: 0,
  // 起始索引
  startIndex: 0,
  // 最大容纳量
  maxCount: 0,
  // 缓存上次计算长度
  preLen: 0
});

const renderList = computed(() => {
  const endIndex = Math.min(
    props.list.length,
    state.startIndex + state.maxCount
  );
  return props.list.slice(state.startIndex, endIndex);
});

const offsetDis = computed(() => {
  return state.startIndex > 0
    ? positions.value[state.startIndex - 1].bottom
    : 0;
});
const scrollStyle = computed(() => ({
  height: `${state.listHeight - offsetDis.value}px`,
  transform: `translate3d(0, ${offsetDis.value}px, 0)`
}));

watch(
  () => state.startIndex,
  () => {
    setPosition();
  }
);

watch(
  () => props.list.length,
  () => {
    initPosition();
    nextTick(() => {
      setPosition();
    });
  }
);

const setPosition = () => {
  const nodes = virtualListRef.value?.children;
  if (!nodes?.length) return;
  [...nodes].forEach((node) => {
    const rect = node.getBoundingClientRect();
    const item = positions.value[Number(node.id)];
    const dHeight = item.height - rect.height;
    if (dHeight) {
      item.height = rect.height;
      item.bottom = item.bottom - dHeight;
      item.dHeight = dHeight;
    }
  });
  const startId = Number(nodes[0].id);
  const len = positions.value.length;
  let startHeight = positions.value[startId].dHeight;
  for (let i = startId + 1; i < len; i++) {
    const item = positions.value[i];
    item.top = positions.value[i - 1].bottom;
    item.bottom = item.bottom - startHeight;
    if (item.dHeight) {
      startHeight += item.dHeight;
      item.dHeight = 0;
    }
  }
  state.listHeight = positions.value[len - 1].bottom;
};

const binarySearch = (list: IPosInfo[], value: number) => {
  let left = 0;
  let right = list.length - 1;
  let index = -1;
  while (left < right) {
    const mid = Math.floor((right - left) / 2) + left;
    const midValue = list[mid].bottom;
    if (midValue === value) {
      return mid + 1;
    } else if (midValue < value) {
      left = mid + 1;
    } else {
      if (index === -1 || index > mid) {
        index = mid;
      }
      right = mid;
    }
  }
  return index;
};

const handleScroll = useThrottleFn(() => {
  const { scrollTop, clientHeight, scrollHeight } = containerRef.value!;
  state.startIndex = binarySearch(positions.value, scrollTop || 0);
  const bottom = scrollHeight - clientHeight - scrollTop;
  if (bottom < props.estimatedHeight) {
    emits('request');
  }
}, 20);

const initPosition = () => {
  const pos: IPosInfo[] = [];
  const disLen = props.list.length - state.preLen;
  const currentLen = positions.value.length;
  const preBottom = positions.value[currentLen - 1]?.bottom || 0;
  for (let i = 0; i < disLen; i++) {
    const item = props.list[state.preLen + i];
    pos.push({
      index: item.id,
      height: props.estimatedHeight,
      top: preBottom
        ? preBottom + i * props.estimatedHeight
        : item.id * props.estimatedHeight,
      bottom: preBottom
        ? preBottom + (i + 1) * props.estimatedHeight
        : (item.id + 1) * props.estimatedHeight,
      dHeight: 0
    });
  }
  positions.value = [...positions.value, ...pos];
  state.preLen = props.list.length;
};

const initView = () => {
  state.viewHeight = containerRef.value?.offsetHeight || 0;
  state.maxCount = Math.ceil(state.viewHeight / props.estimatedHeight) + 3;
  console.log(state);
};

onMounted(() => {
  initView();
  initPosition();
  containerRef.value &&
    containerRef.value.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  containerRef.value &&
    containerRef.value.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped lang="scss">
.virtualContainer {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  .virtualItem {
    width: 100%;
  }
}
</style>
