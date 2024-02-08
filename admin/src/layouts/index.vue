<template>
  <div class="layout-container">
    <!-- 顶部导航 -->
    <BaseHeader />
    <div class="main-container">
      <!-- 侧边栏 -->
      <MainSide />
      <SubSide />

      <!-- 内容区 -->
      <div class="layout-main">
        <MainContent></MainContent>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseHeader from './components/BaseHeader.vue';
  import MainContent from './components/MainContent.vue';
  import MainSide from './components/MainSide.vue';
  import SubSide from './components/SubSide.vue';
</script>

<style>
  #app {
    text-align: center;
    color: var(--ep-text-color-primary);
  }

  .main-container {
    display: flex;
    height: calc(100vh - var(--ep-menu-horizontal-height));
  }
  .layout-main {
    width: 100%;
    height: calc(100vh - var(--ep-menu-horizontal-height));
    padding: 20px;
  }
</style>
