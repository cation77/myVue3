<template>
  <div class="viewer-container">
    <div id="panorama" ref="panoramaRef"></div>
    <div class="controls">
      <button @click="toggleAutoRotate">切换自动旋转</button>
      <button @click="setAddingPointMode(true)">添加标记点</button>
      <button @click="clearPoints">清除所有标记点</button>
      <button @click="resetView">重置视角</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import usePanorama from '@/hooks/usePanorama';

const { toggleAutoRotate, setAddingPointMode, clearPoints, resetView } =
  usePanorama(
    'panoramaRef',
    'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg'
  );
</script>

<style lang="scss" scoped>
.viewer-container {
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);

  #panorama {
    width: 100%;
    height: 100%;
    outline: none;
  }

  .controls {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;

    button {
      margin-right: 10px;
      padding: 8px 16px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.9);
      }
    }
  }
}
</style>
