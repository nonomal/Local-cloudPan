<template>
  <div class="upload-container">
    <el-upload
      ref="uploadRef"
      action="http://localhost:9527/upload"
      multiple
      :data="{ path: route.query.path ? route.query.path : '' }"
      :show-file-list="false"
      :on-success="onSuccess"
      :before-upload="beforeUpload"
      :on-progress="showProgress"
    >
      <ElDropdown :teleported="false" @command="handleUpload">
        <el-button
          type="primary"
          plain
          round
          icon="upload"
          style="width: 80px; margin-bottom: 10px"
          @click="handleUpload('file')"
        >
          上传
        </el-button>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="file">上传文件</el-dropdown-item>
            <el-dropdown-item command="directory">上传文件夹</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </ElDropdown>
    </el-upload>
    <el-button type="primary" plain style="width: 100px" @click="togglePanel">
      <el-icon size="16"><Sort /></el-icon>
      <span>传输列表</span>
    </el-button>

    <!-- panel -->
    <el-card v-if="showPanel" class="file-panel">
      <span class="select-text">正在上传（{{ resolveCount }}/{{ uploadFilesList.length }}）</span>
      <el-table :data="uploadFilesList" style="width: 100%">
        <el-table-column prop="name" width="150" :show-overflow-tooltip="true" label="文件名">
          <template #default="{ row }">
            <el-icon style="vertical-align: middle; color: #409eff">
              <Document />
            </el-icon>
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="是否成功" width="200">
          <template #default="{ row }">
            <template v-if="row.status === 'success'">
              <el-icon color="#38cd92" style="vertical-align: middle"><SuccessFilled /></el-icon>
              上传成功
            </template>
            <template v-else-if="row.status === 'error'">
              <el-icon color="#bb4d31" style="vertical-align: middle">
                <CircleCloseFilled />
              </el-icon>
              上传失败!
            </template>
            <el-progress v-else :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column width="120" prop="size" label="大小" />
      </el-table>
    </el-card>
    <div class="panel-cover" v-show="showPanel" @click.self="showPanel = false"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { formatFileSize } from '@/utils/filestatus';
  import { useRoute } from 'vue-router';
  const route = useRoute();

  defineOptions({ name: 'FileUpload' });
  const props = defineProps({
    onSuccessed: { type: Function, default: () => {} },
  });
  const uploadFilesList = ref<any>([]);
  const showPanel = ref(false);

  // 上传 file Or directory
  const handleUpload = (cmd: string, e?: MouseEvent) => {
    const uploadInp = document.querySelector(
      '.upload-container .ep-upload__input'
    ) as HTMLInputElement;
    if (cmd === 'file') {
      uploadInp.removeAttribute('webkitdirectory');
      uploadInp.removeAttribute('mozdirectory');
      uploadInp.removeAttribute('odirectory');
    } else {
      uploadInp.setAttribute('webkitdirectory', '');
      uploadInp.setAttribute('mozdirectory', '');
      uploadInp.setAttribute('odirectory', '');
    }
  };
  // 已上传的文件数量
  const resolveCount = computed(() => {
    return uploadFilesList.value.filter((item) => item.status === 'success').length;
  });

  const togglePanel = () => {
    showPanel.value = !showPanel.value;
  };

  const beforeUpload = (file) => {
    const { uid, name, isDir } = file;
    const size = formatFileSize(isDir, file.size);
    const fileItem = { uid, name, size, status: 'uploading', progress: 0 };
    uploadFilesList.value.push(fileItem);
    showPanel.value = true;
  };

  const onSuccess = (res, file) => {
    const { uid } = file;
    const target = uploadFilesList.value.find((item) => item.uid === uid);
    if (res.code === 200) {
      target.status = 'success';
    } else {
      target.status = 'error';
    }
    if (resolveCount.value === uploadFilesList.value.length) {
      showPanel.value = false;
      props.onSuccessed(res, file);
    }
  };

  const showProgress = (e, rawfile) => {
    const getFile = (rawfile) => {
      let fileList = uploadFilesList.value;
      let target;
      fileList.every((item) => {
        target = rawfile.uid === item.uid ? item : null;
        return !target;
      });
      return target;
    };
    const file = getFile(rawfile);
    file.status = 'uploading';
    file.progress = e.percent.toFixed(2) || 0;
  };
</script>

<style scoped lang="scss">
  .upload-container {
    display: flex;
    justify-content: space-between;
    padding-right: 5px;
    position: relative;
    .panel-cover {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      z-index: 998;
    }
    .file-panel {
      position: absolute;
      right: 50px;
      top: 40px;
      z-index: 999;
      .select-text {
        font-size: 14px;
        font-weight: 600;
        &::after {
          content: '';
          display: block;
          height: 1px;
          background-color: var(--ep-border-color-lighter);
          margin: 10px 0;
        }
      }
    }
  }
</style>
