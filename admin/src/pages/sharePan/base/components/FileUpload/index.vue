<template>
  <!-- 上传文件 -->
  <el-upload
    ref="uploadRef"
    action="/api/upload"
    multiple
    :data="{ path: route.query.path ? route.query.path : '' }"
    :show-file-list="false"
    :before-upload="beforeUpload"
    :on-progress="showProgress"
    :on-success="onSuccess">
    <ElDropdown :teleported="false" @command="handleUpload">
      <el-button type="primary" @click="handleUpload('file')">
        <ElIcon :size="18">
          <i-mynaui:upload />
        </ElIcon>
        <span>上传</span>
      </el-button>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="file">上传文件</el-dropdown-item>
          <el-dropdown-item command="directory">上传文件夹</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </ElDropdown>
  </el-upload>

  <!-- 传输列表 -->
  <div class="upload-panel">
    <el-button plain @click="togglePanel">
      <el-icon :size="16"><Sort /></el-icon>
      <span>传输列表</span>
    </el-button>

    <!-- panel -->
    <el-card v-show="showPanel" class="file-panel">
      <span class="select-text">正在上传（{{ resolvedCount }}/{{ uploadFilesList.length }}）</span>
      <el-table :data="uploadFilesList" style="width: 100%">
        <el-table-column prop="name" width="150" show-overflow-tooltip label="文件名">
          <template #default="{ row }">
            <el-icon style="vertical-align: -10%">
              <i-mynaui:file />
            </el-icon>
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="是否成功" width="200">
          <template #default="{ row }">
            <template v-if="row.status === 'success'">
              <el-icon style="vertical-align: middle">
                <i-mynaui:check-circle />
              </el-icon>
              上传成功
            </template>
            <template v-else-if="row.status === 'error'">
              <el-icon style="vertical-align: middle">
                <i-mynaui:daze-circle />
              </el-icon>
              上传失败!
            </template>
            <el-progress v-else :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column width="120" prop="size" label="大小" />
      </el-table>
    </el-card>
  </div>

  <div class="panel-cover" v-show="showPanel" @click.self="showPanel = false"></div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { formatFileSize } from '@/utils/filestatus';
  import type {
    UploadFile,
    UploadRawFile,
  } from 'element-plus/lib/components/upload/src/upload.d.ts';
  import { useRoute } from 'vue-router';

  defineOptions({ name: 'FileUpload' });
  const props = defineProps({ onSuccessed: { type: Function, default: () => {} } });

  type UploadFileItem = Pick<UploadRawFile, 'uid' | 'name'> & {
    size: string;
    status: string;
    progress: number;
  };
  const route = useRoute();
  const uploadFilesList = ref<UploadFileItem[]>([]);

  // 上传文件or文件夹
  const handleUpload = (cmd: string, e?: MouseEvent) => {
    const uploadInp = document.querySelector('input.ep-upload__input') as HTMLInputElement;
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
  const resolvedCount = computed(
    () => uploadFilesList.value.filter((item) => item.status === 'success').length
  );

  // 控制上传列表的显示
  const showPanel = ref(false);
  const togglePanel = () => (showPanel.value = !showPanel.value);

  // 传输面板
  // 上传之前收集文件信息
  const beforeUpload = (file: UploadRawFile) => {
    const { uid, name } = file;
    const size = formatFileSize(false, file.size);
    const fileItem = { uid, name, size, status: 'uploading', progress: 0 };
    uploadFilesList.value.push(fileItem);
    if (!showPanel.value) {
      showPanel.value = true;
    }
  };
  // 上传中收集上传进度
  const showProgress = (e, rawfile: UploadFile) => {
    const getFile = (rawfile: UploadFile) => {
      let fileList = uploadFilesList.value;
      let target = null;
      fileList.every((item) => {
        target = rawfile.uid === item.uid ? item : null;
        return !target;
      });
      return target;
    };
    const file = getFile(rawfile);
    file.status = 'uploading';
    file.progress = +e.percent.toFixed(2) || 0;
  };
  // 上传成功修改状态
  const onSuccess = (res, file: UploadFile) => {
    const { uid } = file;
    const target = uploadFilesList.value.find((item) => item.uid === uid);
    target.status = res.code === 200 ? 'success' : 'fail';
    if (resolvedCount.value === uploadFilesList.value.length) {
      showPanel.value = false;
      props.onSuccessed();
    }
  };
</script>

<style scoped lang="scss">
  .upload-panel {
    position: relative;
    .file-panel {
      position: absolute;
      right: 0;
      top: 2.3rem;
      z-index: 999;
      text-align: left;
      .select-text {
        font-size: 1rem;
        font-weight: 600;
        &::after {
          content: '';
          display: block;
          height: 1px;
          background-color: var(--ep-border-color-lighter);
          margin: 0.3rem 0;
        }
      }
    }
  }
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
</style>
