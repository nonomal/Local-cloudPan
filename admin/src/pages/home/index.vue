<script setup lang="ts"></script>

<template>
  <!-- 上传文件 -->
  <el-upload
    ref="uploadRef"
    action="/api/upload"
    multiple
    :data="{ path: $route.query.path ? $route.query.path : '' }"
    show-file-list>
    <el-button type="primary">上传文件</el-button>
  </el-upload>
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
