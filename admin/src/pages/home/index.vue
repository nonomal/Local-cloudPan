<script setup lang="ts">
  import { useVirtualList } from '@vueuse/core';

  const allItems = Array.from(Array(99999).keys());

  const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(allItems, {
    itemHeight: 200,
    // overscan: 0,
  });
</script>

<template>
  <div>
    <button @click="allItems.unshift(123123)">添加一行</button>
    <div v-bind="containerProps" class="container">
      <div v-bind="wrapperProps" class="wrapper">
        <div v-for="{ index, data } in list" :key="index" class="item">
          Row {{ index }}
          <span opacity="70" m="l-1">({{ index }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .container {
    padding: 0.5rem;
    border-radius: 0.25rem;
    background-color: #f3f4f6;
    height: 500px;
  }
  .item {
    width: 100%;
    height: 200px;
    background-color: #fff;
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
