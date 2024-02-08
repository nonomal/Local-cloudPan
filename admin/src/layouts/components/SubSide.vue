<template>
  <el-menu default-active="2" class="el-menu-vertical-demo">
    <el-menu-item index="1">
      <el-icon :size="24"><location /></el-icon>
      <template #title>Navigator One</template>
    </el-menu-item>
    <el-menu-item index="2">
      <el-icon :size="24"><icon-menu /></el-icon>
      <template #title>Navigator Two</template>
    </el-menu-item>
    <el-menu-item index="3">
      <el-icon :size="24"><document /></el-icon>
      <template #title>Navigator Three</template>
    </el-menu-item>
    <el-menu-item index="4">
      <el-icon :size="24"><setting /></el-icon>
      <template #title>Navigator Four</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
  import {
    Location,
    Document,
    Menu as IconMenu,
    Setting,
  } from '@element-plus/icons-vue';
</script>
