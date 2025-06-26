<template>
  <div class="app-wrapper overflow-hidden flex">
    <div class="drawer-bg" />
    <Navbar />
    <div class="main-container flex">
      <div class="app-bar p-2 flex">
        <RouterLink
          :to="item.path"
          class="bar-item text-center"
          v-for="item in barList"
          :key="item.id"
        >
          {{ item.name }}
        </RouterLink>
      </div>
      <div class="app-main p-3 overflow-hidden">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive>
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Navbar from './Navbar.vue';

const barList = [
  { id: 1, name: '首页', path: '/home' },
  { id: 2, name: '虚拟列表', path: '/masonry' }
];
</script>

<style lang="scss" scoped>
.app-wrapper {
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.3);
}

.main-container {
  width: 100%;
  flex: 1;
  .app-bar {
    width: 100px;
    height: 100%;
    flex-direction: column;
    background-color: aquamarine;

    .bar-item {
      &:hover {
        color: #fff;
      }
      & + .bar-item {
        margin-top: 12px;
      }
    }
  }

  .app-main {
    flex: 1;
    height: 100%;
  }
}
</style>
