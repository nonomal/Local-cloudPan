<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade">
      <component :is="Component"></component>
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
  import { watch, ref, nextTick } from 'vue';
  // import useLayoutSetting from '@/store/modules/setting';
  // let LayoutSetting = useLayoutSetting();
  //控制当前组件是否销毁重建
  // let flag = ref(true);
  // watch(
  //   () => LayoutSetting.refresh,
  //   () => {
  //     flag.value = false;
  //     nextTick(() => {
  //       flag.value = true;
  //     });
  //   }
  // );
</script>
<script lang="ts">
  export default {
    name: 'MainContent',
  };
</script>

<style scoped>
  .fade-enter-from {
    opacity: 0;
  }

  .fade-enter-active {
    transition: all 0.3s;
  }

  .fade-enter-to {
    opacity: 1;
  }
</style>
