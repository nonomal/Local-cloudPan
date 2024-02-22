<template>
  <div>
    <!-- 上传 -->
    <FileUpload :on-successed="() => getFileList(route.query.path as string)"></FileUpload>

    <!-- 主视图 -->
    <ContextMenu :menu="mainMenu" @select="handleSelect">
      <el-card class="pan-card">
        <!-- tabbar -->
        <div class="tabbar-container">
          <Tabbar @switch-mode="handleSwitch"></Tabbar>
        </div>

        <!-- 列表视图 -->
        <ContextMenu :menu="fileMenu" showarea=".list-view .ep-table__row" @select="handleSelect">
          <el-table
            v-if="curMode === 0"
            ref="tableRef"
            class="list-view"
            :data="fileList"
            :show-overflow-tooltip="true"
            @row-click="toggleCheck"
            @row-contextmenu="(row) => toggleCheck(row, true)"
            @selection-change="handleSelectionChange"
            style="
              max-height: calc(100vh - var(--ep-menu-horizontal-height) - 160px);
              overflow: hidden auto;
            "
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="文件名" min-width="100">
              <template #default="{ row }">
                <img :src="row.iconSrc" alt="" width="25px" height="25px" class="file-pic" />
                <template v-if="row.isRename">
                  <input
                    ref="renameIpt"
                    type="text"
                    name="filename"
                    class="rename-ipt"
                    v-focus
                    :value="row.name"
                    @click.stop="() => {}"
                  />
                  <ElButton
                    type="primary"
                    size="small"
                    class="rename-btn"
                    @click.stop="finishRenameOrCreate(row)"
                  >
                    <ElIcon size="14"><Select /></ElIcon>
                  </ElButton>
                  <ElButton
                    type="primary"
                    size="small"
                    class="rename-btn"
                    @click.stop="cancelRenameOrCreate(row)"
                  >
                    <ElIcon size="14"><CloseBold /></ElIcon>
                  </ElButton>
                </template>
                <span v-else class="filename" @click="handleClick(row)">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" min-width="30"></el-table-column>
            <el-table-column prop="modified" label="修改时间" min-width="70"></el-table-column>
          </el-table>
        </ContextMenu>

        <!-- 网格视图 -->
        <ContextMenu :menu="fileMenu" showarea=".grid-view .file-item" @select="handleSelect">
          <div class="grid-view" v-if="curMode === 1">
            <div class="file-item" v-for="file in fileList" :key="file.id">
              <FileItem
                :file="file"
                @file-click="handleClick"
                @file-choosed="handleChoose"
                @finish="finishRenameOrCreate"
                @cancel="cancelRenameOrCreate"
                :on-success="onSuccess"
              />
            </div>
          </div>
        </ContextMenu>
      </el-card>
    </ContextMenu>

    <!-- 移动目录选择框 -->
    <MoveSelect
      v-if="mvOrCopyShow"
      v-model:mvOrCopyShow="mvOrCopyShow"
      :filenameList="filenameList"
      :popoverType="mvOrCopy"
      :on-success="() => getFileList(route.query.path as string)"
    />

    <!-- 下载 -->
    <div class="download-container">
      <a ref="downloadRef" :href="fileHref"></a>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'sharePan',
  };
</script>
<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue';
  import { reqFileList, delteFile, renameFile, createDir } from '@/api/file/fileList';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { useRouter, useRoute } from 'vue-router';

  import { getFileType, formatFileSize, formatDateTime } from '@/utils/filestatus';
  import { formatFile } from '@/api/file/types';
  import ContextMenu from '@/components/ContextMenu/index.vue';
  import Tabbar from './components/Tabbar/index.vue';
  import FileItem from './components/FileItem/index.vue';
  import FileUpload from './components/FileUpload/index.vue';
  import MoveSelect from './components/MoveSelect/index.vue';

  const router = useRouter();
  const route = useRoute();

  const fileList = ref([]);
  const selectedFiles = ref([]); // 已勾选的文件
  const curMode = ref(0); // 0: 列表视图 1: 网格视图
  const downloadRef = ref(null);
  const tableRef = ref(null);
  const renameIpt = ref(null);
  const mvOrCopyShow = ref(false);
  const mvOrCopy = ref<'move' | 'copy'>('move');

  // 右键菜单项
  const mainMenu = [
    {
      label: '排序方式',
      subMenu: [{ label: '名称' }, { label: '大小' }, { label: '修改日期' }],
    },
    { label: '新建文件夹' },
    { label: '刷新' },
  ];
  const fileMenu = computed(() => {
    return selectedFiles.value.length > 1
      ? [
          { label: '下载', icon: 'Download' },
          { label: '复制', icon: 'CopyDocument' },
          { label: '移动', icon: 'Rank' },
          { label: '删除', icon: 'Delete' },
        ]
      : [
          { label: '下载', icon: 'Download' },
          { label: '复制', icon: 'CopyDocument' },
          { label: '移动', icon: 'Rank' },
          { label: '重命名', icon: 'EditPen' },
          { label: '删除', icon: 'Delete' },
        ];
  });
  // 已勾选的文件名列表
  const filenameList = computed(() => {
    return selectedFiles.value.map((file) => file.name);
  });
  // 文件的下载链接
  const fileHref = computed(() => {
    return `http://localhost:9527/download?filenameList=[${filenameList.value}]&path=${route.query.path ? route.query.path : ''}`;
  });

  // 获取文件数据
  const getFileList = async (path: string, sortMode?: 'name' | 'size' | 'modified') => {
    const result = await reqFileList(path, sortMode);
    if (result.code === 200) {
      const formatRes: formatFile[] = result.data.fileList.reduce((newList, file) => {
        const fileType = getFileType(file.ext);
        const size = formatFileSize(file.isDir, file.size);
        const modified = formatDateTime(file.modified);
        const iconPath = file.isDir ? 'directory' : fileType ? `${fileType}/${file.ext}` : 'others';
        const iconSrc = `/src/assets/fileType/${iconPath}.svg`;
        newList.push({ ...file, size, modified, fileType, iconSrc, isRename: false });
        return newList;
      }, []);
      fileList.value = formatRes;
    }
  };

  // 文件点击
  const handleClick = (row: formatFile) => {
    const queryParam = route.query.path === '' ? '' : route.query.path + '/';
    if (row.isDir) {
      router.push({ query: { path: `${queryParam}${row.name}` } });
      selectedFiles.value = [];
    } else {
      ElMessage({
        type: 'info',
        message: '点击了文件',
      });
    }
  };

  // 视图切换
  const handleSwitch = (mode: number) => {
    curMode.value = mode;
    selectedFiles.value = [];
  };

  // 右键菜单选择
  const handleSelect = (MenuItem) => {
    const path = route.query.path as string;
    const handleDownload = () => {
      downloadRef.value.click();
      selectedFiles.value = [];
    };
    const handleDelete = () => {
      ElMessageBox.confirm('文件一经删除，无法恢复，确定删除所选的文件吗？', '确定删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const result = await delteFile(path, filenameList.value);
          if (result.code !== 200) {
            ElMessage({
              type: 'warning',
              message: result.msg,
            });
          } else {
            ElMessage({
              type: 'success',
              message: '删除成功！',
            });
          }
          selectedFiles.value = [];
          getFileList(path);
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: '删除失败',
          });
        });
    };
    const handleRename = () => {
      fileList.value.forEach((file) => {
        file.isRename = false;
      });
      selectedFiles.value[0].isRename = true;
    };
    const handleMove = () => {
      mvOrCopy.value = 'move';
      mvOrCopyShow.value = true;
    };
    const handleCopy = () => {
      mvOrCopy.value = 'copy';
      mvOrCopyShow.value = true;
    };
    const handleCreateDir = () => {
      fileList.value.unshift({
        name: '新建文件夹',
        size: '-',
        isRename: true,
        isCreate: true,
        modified: formatDateTime(Date.now()),
        iconSrc: '/src/assets/fileType/directory.svg',
      });
    };
    const openration = {
      '排序方式-名称': () => getFileList(path, 'name'),
      '排序方式-大小': () => getFileList(path, 'size'),
      '排序方式-修改日期': () => getFileList(path, 'modified'),
      刷新: () => getFileList(path),
      新建文件夹: handleCreateDir,
      下载: handleDownload,
      移动: handleMove,
      复制: handleCopy,
      重命名: handleRename,
      删除: handleDelete,
    };
    openration[MenuItem.label]();
  };

  // 文件勾选（网格模式）
  const handleChoose = (isChecked: boolean, file) => {
    if (isChecked) {
      selectedFiles.value.push(file);
    } else {
      const index = selectedFiles.value.findIndex((f) => f.id === file.id);
      if (index !== -1) {
        selectedFiles.value.splice(index, 1);
      }
    }
  };
  // 文件勾选（列表模式）
  const handleSelectionChange = (select) => {
    selectedFiles.value = select;
  };
  const toggleCheck = (row, isSingle?) => {
    if (isSingle === true) {
      if (selectedFiles.value.findIndex((file) => file.id === row.id) !== -1) {
        return;
      }
      tableRef.value.clearSelection();
      tableRef.value.setCurrentRow(row);
    }
    tableRef.value.toggleRowSelection(row);
  };

  // 文件重命名或创建
  const finishRenameOrCreate = async (row, name?) => {
    const newName = renameIpt.value?.value || name;
    const operateText = row.isCreate ? '新建文件夹' : '重命名';
    // 文件名不为空
    if (!newName) {
      ElMessage({
        type: 'warning',
        message: '文件名不能为空！',
      });
      return;
    }
    // 新旧文件名不能相同
    if (!row.isCreate && newName === row.name) {
      row.isRename = false;
      ElMessage({
        type: 'warning',
        message: '新文件名不能与旧文件名相同！',
      });
      return;
    }
    if (row.isCreate) {
      await createDir(route.query.path as string, newName);
      delete row.isCreate;
    } else {
      await renameFile(route.query.path as string, row.name, newName);
    }
    ElMessage({
      type: 'success',
      message: `${operateText}成功！`,
    });
    await getFileList(route.query.path as string);
    row.isRename = false;
  };
  // 取消重命名或创建
  const cancelRenameOrCreate = (row) => {
    if (row.isCreate) {
      fileList.value.shift();
    }
    row.isRename = false;
    tableRef.value?.toggleRowSelection(row, false);
  };

  const onSuccess = async (file, newName) => {
    const operateText = file.isCreate ? '新建文件夹' : '重命名';
    if (file.isCreate) {
      await createDir(route.query.path as string, newName);
      delete file.isCreate;
    } else {
      await renameFile(route.query.path as string, file.name, newName);
    }
    ElMessage({
      type: 'success',
      message: `${operateText}成功！`,
    });
    await getFileList(route.query.path as string);
  };

  watch(
    () => route.query.path,
    (newPath) => {
      getFileList(newPath as string);
    }
  );
  onMounted(() => {
    getFileList(route.query.path as string);
  });
</script>

<style scoped lang="scss">
  .upload-container {
    text-align: left;
  }
  .pan-card {
    border-radius: 10px;
    max-width: calc(100% - 5px);
    min-width: 700px;
    .tabbar-container {
      margin-bottom: 1rem;
    }
    .filename {
      transition: all 0.3s ease;
      cursor: pointer;
      &:hover {
        color: var(--ep-menu-active-color);
      }
    }
    .list-view {
      .file-pic {
        vertical-align: bottom;
        margin-right: 5px;
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
        width: 20px;
        height: 20px;
        padding: 2px;
      }
    }

    .grid-view {
      display: flex;
      flex-wrap: wrap;
      padding: 0 25px;
      height: fit-content;
      max-height: calc(100vh - var(--ep-menu-horizontal-height) - 160px);
      overflow: hidden auto;
      .file-item {
        font-size: 14px;
        text-align: center;
        margin: 0 20px 20px 0;
        width: 168px;
        vertical-align: top;
      }
    }
  }
  :deep(.ep-table__body tr:hover > td.ep-table__cell) {
    transform: scale(1.01);
  }
  :deep(.ep-table__body tr > td.ep-table__cell) {
    transition: all 0.3s ease;
  }

  .download-container {
    position: absolute;
    left: -9999px;
  }
</style>
