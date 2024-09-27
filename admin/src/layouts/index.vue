<template>
  <div class="app-container">
    <!-- 侧边导航 -->
    <MainSide />
    <!-- <SubSide /> -->

    <!-- 内容区 -->
    <div class="main-container">
      <MainContent></MainContent>
    </div>
  </div>
</template>

<script setup lang="ts">
  import MainContent from './components/MainContent.vue';
  import MainSide from './components/MainSide.vue';
  import SubSide from './components/SubSide.vue';
</script>

<style scoped>
  .app-container {
    text-align: center;
    display: flex;
    width: 100%;
    height: 100vh;
    color: var(--ep-text-color-primary);
  }

  .main-container {
    width: 100%;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }
</style>
