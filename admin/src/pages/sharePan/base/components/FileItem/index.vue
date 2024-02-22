<template>
  <div class="file-item-container" :class="{ checked: isCheck }" @contextmenu="handleContextMenu">
    <input class="file-checkbox" type="checkbox" v-model="isCheck" />
    <div @click="fileClick">
      <img :src="file.iconSrc" alt="" width="128px" height="128px" />
      <template v-if="file.isRename">
        <input
          ref="renameIpt"
          type="text"
          name="filename"
          class="rename-ipt"
          v-focus
          :value="file.name"
          @click.stop="() => {}"
        />
        <ElButton
          type="primary"
          size="small"
          class="rename-btn"
          @click.stop="finishRenameOrCreate(file)"
        >
          <ElIcon size="14"><Select /></ElIcon>
        </ElButton>
        <ElButton type="primary" size="small" class="rename-btn" @click.stop="cancelRename(file)">
          <ElIcon size="14"><CloseBold /></ElIcon>
        </ElButton>
      </template>
      <p v-else class="filename">{{ file.name }}</p>
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
  const renameIpt = ref(null);

  const props = defineProps<{
    file: formatFile;
    onSuccess: (file: formatFile, newName: string) => void;
  }>();
  const emit = defineEmits(['fileClick', 'fileChoosed', 'finish', 'cancel']);

  const fileClick = () => {
    emit('fileClick', props.file);
  };
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    isCheck.value = true;
  };

  const finishRenameOrCreate = async (file: formatFile) => {
    emit('finish', file, renameIpt.value.value);
  };
  const cancelRename = (file: formatFile) => {
    isCheck.value = false;
    emit('cancel', file);
  };
  watch(
    () => isCheck.value,
    () => {
      emit('fileChoosed', isCheck.value, props.file);
    }
  );
</script>

<style lang="scss">
  .file-item-container {
    position: relative;
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
    .rename-ipt {
      width: 150px;
      margin-right: 12px;
      line-height: 23px;
      height: 23px;
      border-radius: 4px;
      border: 1px solid #a7adbc;
      padding: 0 10px;
      outline: none;
      font-size: 13px;
    }
    .rename-btn {
      position: absolute;
      width: 20px;
      height: 20px;
      padding: 2px;
      top: 10px;
      right: 10px;

      &:first-of-type {
        right: 40px;
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
