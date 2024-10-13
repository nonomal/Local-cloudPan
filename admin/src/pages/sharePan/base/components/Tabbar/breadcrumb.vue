<template>
  <el-breadcrumb separator-icon="ArrowRight">
    <el-breadcrumb-item :to="{ path: route.path, query: { path: '' } }">
      <span class="breadcrumb-title">全部文件</span>
    </el-breadcrumb-item>

    <el-breadcrumb-item
      v-for="(path, index) in pathArr"
      :key="index"
      :to="{
        path: route.path,
        query: { path: queryParam(index) },
      }">
      <span class="breadcrumb-title">{{ path }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  defineOptions({ name: 'Breadcrumb' });
  const route = useRoute();
  const pathArr = computed(() => {
    return route.query.path === '' ? [] : (route.query.path as string).split('/');
  });

  const queryParam = (index: number) => pathArr.value.slice(0, index + 1).join('/');
</script>
