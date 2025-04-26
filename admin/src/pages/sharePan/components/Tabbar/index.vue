<template>
  <div class="tabbar-container">
    <!-- 面包屑 -->
    <div class="left-breadcrumb">
      <Breadcrumb></Breadcrumb>
    </div>

    <!-- 右侧操作面板 -->
    <div class="rig-switchMode">
      <!-- 上传 -->
      <FileUpload v-bind="$attrs"></FileUpload>

      <!-- 模式切换 -->
      <ElButton plain @click="handleClick" tag="div" style="width: 2.7rem">
        <el-icon :size="18">
          <i-mynaui:grid-one v-show="curMode === 0" />
          <i-mynaui:list v-show="curMode === 1" />
        </el-icon>
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Breadcrumb from './breadcrumb.vue';
  import FileUpload from '../FileUpload/index.vue';

  defineOptions({ name: 'Tabbar' });
  const emit = defineEmits(['switchMode']);

  const curMode = ref<0 | 1>(0);
  const handleClick = () => {
    curMode.value = curMode.value === 0 ? 1 : 0;
    emit('switchMode', curMode.value);
  };
</script>

<style scoped lang="scss">
  .tabbar-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;

    @media screen and (max-width: 500px) {
      flex-direction: column;
      align-items: flex-start;
      padding: 0;
      gap: 1.5rem;
    }

    .left-breadcrumb {
      @media screen and (max-width: 500px) {
        order: 2;
      }
    }

    .rig-switchMode {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;

      @media screen and (max-width: 500px) {
        order: 1;
        width: 100%;
        justify-content: flex-start;
      }

      :deep(path) {
        stroke-width: 2;
      }
    }
  }
</style>
