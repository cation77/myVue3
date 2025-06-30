<template>
  <div class="navbar flex justify-between items-center h-14">
    <div class="flex items-center">
      <div class="flex items-center">
        <router-link key="expand" class="flex items-center" to="/">
          <img :src="logo" class="w-8 h-8 mr-3" />
          <div class="sidebar-title">
            {{ props.title || 'ICE SYS' }}
          </div>
        </router-link>
      </div>
    </div>

    <div
      class="flex cursor-pointer theme-btn p-2 rounded-lg flex justify-center items-center space-x-1 text-muted bg-muted hover:bg-main/80"
      @click="toggleTheme"
    >
      切换主题
    </div>
  </div>
</template>

<script lang="ts" setup>
import toggleTheme from '@/utils/toggleTheme';
import logo from '@/assets/vue.svg';
const props = defineProps<{ title?: string }>();
</script>

<style lang="scss" scoped>
.navbar {
  overflow: hidden;
  position: relative;
  background: #3d6fe4;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1002;
  padding: 0 20px;

  .sidebar-title {
    font-family: PingFang SC;
    font-size: 22px;
  }
}
</style>
