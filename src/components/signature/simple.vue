<template>
  <div class="signBox" :style="boxStyle">
    <canvas
      class="canvasBox"
      ref="canvasRef"
      @mousedown="handleMousedown"
      @mousemove="handleMousemove"
      @mouseup="handleMouseup"
      @mouseleave="handleMouseleave"
    ></canvas>

    <div class="flex items-center justify-end gap-[10px]">
      <myButton @click="handleClear">清除</myButton>
      <myButton @click="handleSave" type="primary">保存</myButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import myButton from '@/components/myButton/index.vue';

type IProps = {
  width?: number;
  height?: number;
};
type Point = { x: number; y: number };

const props = withDefaults(defineProps<IProps>(), {
  width: 560,
  height: 360
});

const canvasRef = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D | null>(null);
const isDrawing = ref(false);
const lastPosition = ref<Point>({ x: 0, y: 0 });

const boxStyle = computed(() => {
  return `width: ${props.width}px; height: ${props.height + 50}px;`;
});

const getCanvasPosition = (clientX: number, clientY: number) => {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
};

const getEventPosition = (event: MouseEvent) => {
  return getCanvasPosition(event.clientX, event.clientY);
};

const handleMousedown = (event: MouseEvent) => {
  isDrawing.value = true;
  lastPosition.value = getEventPosition(event);
};

const handleMousemove = (event: MouseEvent) => {
  if (!isDrawing.value || !ctx.value) return;
  //获取当前所在位置
  const { x, y } = getEventPosition(event);
  //开始新路径
  ctx.value.beginPath();
  //移动画笔到上一个点
  ctx.value.moveTo(lastPosition.value.x, lastPosition.value.y);
  //绘制线条到当前点
  ctx.value.lineTo(x, y);
  //描边路径
  ctx.value.stroke();
  //更新最后的位置
  lastPosition.value = { x, y };
};

const handleMouseup = () => {
  isDrawing.value = false;
};

const handleMouseleave = () => {
  isDrawing.value = false;
};

const handleClear = () => {
  if (!canvasRef.value || !ctx.value) return;
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  initCanvas();
};

const handleSave = () => {
  if (!canvasRef.value) return;
  const dataUrl = canvasRef.value.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'signature.png';
  link.href = dataUrl;
  link.click();
};

const initCanvas = () => {
  if (!canvasRef.value) return;
  canvasRef.value.width = props.width;
  canvasRef.value.height = props.height;
  ctx.value = canvasRef.value.getContext('2d');
  if (!ctx.value) return;

  ctx.value.lineWidth = 2;
  ctx.value.lineCap = 'round';
  ctx.value.strokeStyle = '#000';

  ctx.value.save();
  ctx.value.fillStyle = '#ffffff';
  ctx.value.restore();
};

onMounted(() => {
  initCanvas();
});
</script>

<style scoped lang="scss">
.signBox {
  .canvasBox {
    border: 1px solid #37b9ff;
    border-radius: 6px;
    background-color: #fff;
  }
}
</style>
