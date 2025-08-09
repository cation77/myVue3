<template>
  <div class="w-screen h-screen overflow-hidden flex flex-col">
    <Navbar />
    <div class="w-full flex flex-1 bg-white dark:bg-gray-800">
      <div class="w-28 h-full p-2 flex flex-col gap-2">
        <RouterLink
          :to="item.path"
          class="bar-item text-center text-gray-900 dark:text-white"
          v-for="item in barList"
          :key="item.id"
        >
          {{ item.name }}
        </RouterLink>
      </div>
      <div class="h-full flex-1 p-3 overflow-hidden">
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
  { id: 2, name: '虚拟列表', path: '/masonry' },
  { id: 3, name: '验证', path: '/realization' },
  // { id: 4, name: '动态表单', path: '/asyncForm' },
  { id: 4, name: '全景', path: '/panorama' }
];
</script>

<style lang="scss" scoped></style>
