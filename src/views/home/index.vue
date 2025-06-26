<template>
  <div class="homePage">
    <h1>home page</h1>
    <signature></signature>
    <!-- <signature1></signature1> -->
    <floorSelect></floorSelect>
  </div>
</template>
<script setup lang="ts">
import signature from '@/components/signature/index.vue';
import signature1 from '@/components/signature/simple.vue';
import floorSelect from '@/components/floorSelect/index.vue';
</script>

<style scoped lang="scss">
.homePage {
  width: 100%;
  height: 100%;
}
</style>
