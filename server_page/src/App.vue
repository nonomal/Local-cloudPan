<template>
  <div class="app-container">
    <ServerConfig />
  </div>
</template>

<script setup>
  import ServerConfig from './components/ServerConfig.vue';
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  #app {
    width: 100%;
    height: 100%;
    background-color: white;
  }

  .app-container {
    max-width: 1200px;
    min-width: 500px;
    margin: 0 auto;
    padding: 28px 16px;
    height: 100vh;
    overflow-y: hidden;
  }

  .main-title {
    text-align: center;
    margin-bottom: 24px;
    font-size: 30px;
    font-weight: 700;
    color: #1a1a1a;
  }

  :root {
    --el-color-primary: #18181b;
    --el-border-radius-base: 8px;
  }
</style>
