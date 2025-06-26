<template>
  <div class="navbar">
    <div class="left-menu">
      <div class="logo-container">
        <router-link key="expand" class="sidebar-logo-link" to="/">
          <img :src="logo" class="sidebar-logo" />
          <div class="sidebar-title">{{ props.title || 'ICE SYS' }}</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import logo from '@/assets/vue.svg';
const props = defineProps<{ title?: string }>();
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  height: 60px;
  overflow: hidden;
  position: relative;
  background: #3d6fe4;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1002;
  padding: 0 20px;

  .left-menu {
    display: flex;
    align-items: center;

    .logo-container {
      display: flex;
      align-items: center;

      .sidebar-logo {
        width: 36px;
        height: 36px;
        margin-right: 12px;
      }

      .sidebar-logo-link {
        display: flex;
        align-items: center;
      }

      .sidebar-title {
        font-family: PingFang SC;
        font-size: 22px;
        font-variation-settings: 'opsz' auto;
        color: #ffffff;
        line-height: 1;
      }
    }
  }
}
</style>
