<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component"></component>
  </RouterView>
</template>

<script setup lang="ts">
  defineOptions({ name: 'MainContent' });
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
