<template>
  <div class="file-item-container" :class="{ checked: isCheck }" @contextmenu="handleContextMenu">
    <input class="file-checkbox" type="checkbox" v-model="isCheck" />
    <div @click="fileClick">
      <img :src="file.iconSrc" alt="" width="128px" height="128px" />
      <p class="filename">{{ file.name }}</p>
      <div class="describe">
        <p v-if="file.isDir">{{ file.modified }}</p>
        <p v-else>{{ file.size }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'FileItem',
  };
</script>
<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { formatFile } from '@/api/file/types';

  const isCheck = ref(false);
  const props = defineProps<{
    file: formatFile;
  }>();
  const emit = defineEmits(['fileClick', 'fileChoosed']);
  const fileClick = () => {
    emit('fileClick', props.file);
  };
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    isCheck.value = true;
  };
  watch(
    () => isCheck.value,
    () => {
      emit('fileChoosed', isCheck.value, props.file);
    }
  );
</script>

<style lang="scss">
  // $--file-hover-bg-color: #e9ecf0;
  .file-item-container {
    padding: 10px;
    border-radius: 8px;

    .file-checkbox {
      display: block;
      visibility: hidden;
    }
    &:hover,
    &.checked {
      background-color: var(--ep-file-hover);
      transform: scale(1.02);
      transition: transform 0.2s ease-out;
      .file-checkbox {
        visibility: visible;
      }
    }
    .filename {
      line-height: 18px;
      font-size: 14px;
      color: var(--ep-table-text-color);
      overflow: hidden;
    }
    .describe {
      font-size: 12px;
      color: #818999;
      line-height: 16px;
      margin: 8px 0;
    }
  }
</style>
