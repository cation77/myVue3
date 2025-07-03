<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
</script>

<template>
  <el-config-provider :locale="zhCn">
    <a-config-provider :locale="zhCN"><router-view /></a-config-provider>
  </el-config-provider>
</template>

<style scoped></style>
