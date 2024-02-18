<script lang="ts" setup>
  import { toggleDark, isDark } from '@/composables/dark';
  import { ref } from 'vue';
  import { User, SwitchButton, Setting } from '@element-plus/icons-vue';

  const name = ref('admin');
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false">
    <el-menu-item index="1">Element Plus</el-menu-item>
    <div class="flex-grow" />
    <el-sub-menu index="2" :popper-offset="4">
      <template #title>
        <el-icon><User /></el-icon>
        {{ name }}
      </template>
      <el-menu-item index="2-1">
        <el-icon><User /></el-icon>
        个人中心
      </el-menu-item>
      <el-menu-item index="2-2">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item @click="toggleDark()">
      <button class="toggle-btn" style="height: var(--ep-menu-item-height)">
        <el-icon size="1rem">
          <Sunny v-if="!isDark" />
          <Moon v-else />
        </el-icon>
      </button>
    </el-menu-item>
    <el-menu-item index="3">
      <el-icon><setting /></el-icon>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
  .flex-grow {
    flex-grow: 1;
  }
  .toggle-btn {
    width: 100%;
    border-style: none;
    background-color: transparent;
    cursor: pointer;
  }
</style>
