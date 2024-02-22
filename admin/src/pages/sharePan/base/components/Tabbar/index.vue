<template>
  <div class="tabbar-container">
    <!-- 面包屑导航 -->
    <div class="left-breadcrumb">
      <Breadcrumb></Breadcrumb>
    </div>
    <!-- 模式切换 -->
    <div class="rig-switchMode">
      <el-dropdown trigger="click" @command="handleClick">
        <span class="el-dropdown-link">
          <el-icon size="large">
            <List v-if="curMode === 0"></List>
            <Menu v-else-if="curMode === 1"></Menu>
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="List" :command="0">列表模式</el-dropdown-item>
            <el-dropdown-item icon="Menu" :command="1">网格模式</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'Tabbar',
  };
</script>
<script setup lang="ts">
  import { ref } from 'vue';
  import Breadcrumb from './breadcrumb.vue';

  const curMode = ref(0);

  const emit = defineEmits(['switchMode']);
  const handleClick = (command: number) => {
    curMode.value = command;
    emit('switchMode', command);
  };
</script>

<style scoped>
  .tabbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
  }
</style>
