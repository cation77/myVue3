<template>
  <div class="signBox" :style="boxStyle">
    <canvas
      class="drawCanvasBox"
      ref="canvasRef"
      @mousedown="handleMousedown"
      @mousemove="handleMousemove"
      @mouseup="handleMouseup"
      @mouseleave="handleMouseleave"
    ></canvas>

    <canvas class="previewCanvasBox" ref="previewRef"></canvas>
    <div
      class="absolute flex items-center justify-end gap-[10px] top-[380px]"
      style=""
    >
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
const previewRef = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D | null>(null);
const previewCtx = ref<CanvasRenderingContext2D | null>(null);
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

const copy = () => {
  if (previewRef.value && canvasRef.value && ctx.value && previewCtx.value) {
    previewCtx.value.save();
    // 设置合成模式
    previewCtx.value.globalCompositeOperation = 'source-atop';
    previewCtx.value.drawImage(canvasRef.value, 0, 0);
    previewCtx.value.restore();
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
};

const handleMouseup = () => {
  isDrawing.value = false;
  copy();
};

const handleMouseleave = () => {
  isDrawing.value = false;
  copy();
};

const handleClear = () => {
  if (!canvasRef.value || !ctx.value) return;
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  initCanvas();
};

const handleSave = () => {
  if (!previewRef.value) return;
  const dataUrl = previewRef.value.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'signature.png';
  link.href = dataUrl;
  link.click();
};

const initCanvas = () => {
  if (!canvasRef.value || !previewRef.value) return;
  canvasRef.value.width = props.width;
  canvasRef.value.height = props.height;
  previewRef.value.width = props.width;
  previewRef.value.height = props.height;
  ctx.value = canvasRef.value.getContext('2d');
  previewCtx.value = previewRef.value.getContext('2d');
  if (!ctx.value || !previewCtx.value) return;

  // 设置颜色
  ctx.value.lineWidth = 2;
  ctx.value.lineCap = 'round';
  ctx.value.strokeStyle = '#000';

  // 保存Canvas 的当前状态
  ctx.value.save();
  // 设置透明度
  ctx.value.globalAlpha = 0;
  // 恢复目标 Canvas 状态
  ctx.value.restore();

  // 初始背景
  previewCtx.value.fillStyle = '#ffffff';
  previewCtx.value.fillRect(
    0,
    0,
    previewRef.value.width,
    previewRef.value.height
  );
};

onMounted(() => {
  initCanvas();
});
</script>

<style scoped lang="scss">
.signBox {
  position: relative;
  .drawCanvasBox {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 11;
  }
  .previewCanvasBox {
    position: absolute;
    left: 0px;
    top: 0;
    z-index: 1;
  }
  .canvasBox {
    border: 1px solid #37b9ff;
    border-radius: 6px;
    background-color: #fff;
  }
}
</style>
