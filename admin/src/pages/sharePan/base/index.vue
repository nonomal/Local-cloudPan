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
        <ContextMenu
          class="list-view"
          ref="scrollContainerRef"
          showarea=".list-view .ep-table__row"
          :menu="fileMenu"
          @select="handleSelect"
        >
          <el-table
            v-if="curMode === 0"
            ref="tableRef"
            :data="fileList"
            :show-overflow-tooltip="true"
            :row-style="{ height: '50px' }"
            :style="{
              height: allDate.length * itemHeight + offset + 'px',
              paddingTop: `${start * itemHeight}px`,
              overflow: 'hidden',
            }"
            v-loading="loading"
            @row-click="toggleCheck"
            @row-contextmenu="(row) => toggleCheck(row, true)"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="文件名" min-width="100">
              <template #default="{ row }">
                <template v-if="row.fileType === 'picture'">
                  <el-image
                    class="file-pic"
                    fit="cover"
                    :src="row.thumbnailPath || row.filePath"
                    :lazy="true"
                    :preview-src-list="[row.filePath]"
                    preview-teleported
                    @click.stop="() => {}"
                  />
                </template>
                <img v-else :src="getAssetsFile(row)" class="file-pic" />
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
                <span v-else class="filename" @click.stop="handleClick(row)">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" min-width="30"></el-table-column>
            <el-table-column prop="modified" label="修改时间" min-width="70"></el-table-column>
          </el-table>
        </ContextMenu>

        <!-- 网格视图 -->
        <ContextMenu :menu="fileMenu" showarea=".grid-view .file-item" @select="handleSelect">
          <div
            v-if="curMode === 1"
            v-loading="loading"
            ref="scrollContainerRef"
            style="
              max-height: calc(100vh - var(--ep-menu-horizontal-height) - 190px);
              overflow: hidden auto;
            "
          >
            <div
              class="grid-view"
              ref="flexContainerRef"
              :style="{
                height: Math.ceil(allDate.length / rowCount) * itemHeight + offset + 'px',
                paddingTop: `${(start / rowCount) * itemHeight}px`,
              }"
            >
              <div class="file-item" v-for="file in fileList" :key="file.id">
                <FileItem
                  :file="file"
                  @file-click="handleClick"
                  @file-choosed="handleChoose"
                  @finish="finishRenameOrCreate"
                  @cancel="cancelRenameOrCreate"
                />
              </div>
            </div>
          </div>
        </ContextMenu>
        <!-- 数量信息 -->
        <p class="pan-card-footer">{{ allDate.length }}个项目</p>
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

    <!-- 详情展示页 -->
    <PlayPage v-if="playPageShow" v-model:playPageShow="playPageShow" :playInfo="playInfo" />

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
  import { ref, Ref, onMounted, watch, computed, nextTick } from 'vue';
  import { reqFileList, delteFile, renameFile, createDir } from '@/api/file/fileList';
  import { getAssetsFile } from '@/utils/tool';
  import { formatFile } from '@/api/file/types';
  import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
  import { useRouter, useRoute } from 'vue-router';

  import { getFileType, formatFileSize, formatDateTime } from '@/utils/filestatus';
  import useVitualList from '@/composables/useVitualList';

  import ContextMenu from '@/components/ContextMenu/index.vue';
  import Tabbar from './components/Tabbar/index.vue';
  import FileItem from './components/FileItem/index.vue';
  import FileUpload from './components/FileUpload/index.vue';
  import MoveSelect from './components/MoveSelect/index.vue';
  import PlayPage from './components/PlayPage/index.vue';

  const router = useRouter();
  const route = useRoute();

  // 虚拟列表
  const offset = computed(() => (curMode.value === 0 ? 40 : 0));
  const itemHeight = computed(() => (curMode.value === 0 ? 50 : 245));
  const flexContainerRef = ref<HTMLElement>(null);
  const scrollContainerRef = ref<HTMLElement>(null);
  const curMode = ref<0 | 1>(0); // 0: 列表视图 1: 网格视图
  const { start, end, rowCount } = useVitualList({
    renderCount: 30, // 渲染数量
    offset, // 顶部偏移量
    itemHeight, // 单个元素高度
    scrollContainerRef, // 滚动容器
    flexContainerRef, // 网格视图容器
    flexItemWidth: 188, // 网格视图单个元素宽度
    curMode, // 当前视图模式
  });

  const allDate = ref([]);
  const selectedFiles = ref<formatFile[]>([]); // 已勾选的文件
  const downloadRef = ref<HTMLElement>(null);
  const tableRef = ref<InstanceType<typeof ElTable>>(null);
  const renameIpt = ref<HTMLInputElement>(null);
  const mvOrCopyShow = ref(false);
  const playPageShow = ref(false);
  const loading = ref(false);
  const mvOrCopy = ref<'move' | 'copy'>('move');
  const playInfo = ref({ url: '', type: '' });
  const isCheckMap = new Map();

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
  // 要渲染的列表
  const fileList = computed(() => {
    return allDate.value.slice(start.value, end.value);
  });
  // 已勾选的文件名列表
  const filenameList = computed(() => {
    return selectedFiles.value.map((file) => file.name);
  });
  // 文件的下载链接
  const fileHref = computed(() => {
    const href = new URL(
      `api/download?filenameList=[${filenameList.value}]&path=${route.query.path ? route.query.path : ''}`,
      window.location.origin
    ).href;
    return href;
  });

  // 获取文件数据
  const getFileList = async (path: string, sortMode?: 'name' | 'size' | 'modified') => {
    loading.value = true;
    const result = await reqFileList(path, sortMode);
    if (result.code === 200) {
      const origin = window.location.origin;
      const formatRes: formatFile[] = result.data.fileList.reduce((newList, file) => {
        let { ext, isDir, size, modified, filePath, thumbnailPath } = file;
        const fileType = getFileType(ext);
        size = formatFileSize(isDir, size as number);
        modified = formatDateTime(modified as number);
        filePath = new URL(filePath, origin).href;
        thumbnailPath = new URL(thumbnailPath, origin).href;
        newList.push({
          ...file,
          size,
          modified,
          fileType,
          filePath,
          thumbnailPath,
          isRename: false,
        });
        return newList;
      }, []);
      allDate.value = formatRes;
      selectedFiles.value = [];
      clearSelection();
      nextTick(() => {
        loading.value = false;
      });
    }
  };

  // 文件项点击
  const handleClick = (row: formatFile) => {
    const queryParam = route.query.path === '' ? '' : route.query.path + '/';
    // 目录
    if (row.isDir) {
      router.push({ query: { path: `${queryParam}${row.name}` } });
    }
    // 音视频、pdf、txt、md
    else if (row.fileType === 'video' || row.fileType === 'audio') {
      const { fileType: type, filePath: url } = row;
      playPageShow.value = true;
      playInfo.value = { url, type };
    } else if (row.fileType === 'document' && ['pdf', 'txt', 'md'].includes(row.ext)) {
      const { ext: type, filePath: url } = row;
      playPageShow.value = true;
      playInfo.value = { url, type };
    } else if (row.fileType === 'picture') {
      ElMessage({
        type: 'info',
        message: '请点击图片查看原图！',
      });
    } else {
      ElMessage({
        type: 'warning',
        message: '此类文件无法预览，请下载后查看！',
      });
    }
  };

  // 视图切换
  const handleSwitch = (mode: 0 | 1) => {
    curMode.value = mode;
    selectedFiles.value = [];
  };

  // 右键菜单选择
  const handleSelect = (MenuItem) => {
    const path = route.query.path as string;
    const handleDownload = () => {
      downloadRef.value.click();
      clearSelection();
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
      allDate.value.forEach((file) => {
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
      allDate.value.unshift({
        name: '新建文件夹',
        size: '-',
        isRename: true,
        isCreate: true,
        modified: formatDateTime(Date.now()),
        iconSrc: new URL('@/assets/fileType/directory.svg', import.meta.url).href,
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
  const handleChoose = (isChecked: Ref, file: formatFile) => {
    if (isChecked.value) {
      selectedFiles.value.push(file);
      isCheckMap.set(file.id, isChecked);
    } else {
      const index = selectedFiles.value.findIndex((f) => f.id === file.id);
      if (index !== -1) {
        selectedFiles.value.splice(index, 1);
        isCheckMap.delete(file.id);
      }
    }
  };
  // 清除所有选中状态
  const clearSelection = () => {
    isCheckMap.forEach((isCheck) => {
      isCheck.value = false;
    });
    isCheckMap.clear();
    tableRef?.value?.clearSelection();
  };
  // 文件勾选（列表模式）
  const handleSelectionChange = (select) => {
    selectedFiles.value = select;
  };
  const toggleCheck = (row, isSingle?: boolean) => {
    // 单选（鼠标右键）
    if (isSingle === true) {
      if (selectedFiles.value.findIndex((file) => file.id === row.id) !== -1) {
        return;
      }
      tableRef.value.clearSelection();
      tableRef.value.setCurrentRow(row);
    }
    // 切换勾选状态（鼠标左键）
    // @ts-ignore
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
      allDate.value.shift();
    }
    row.isRename = false;
    tableRef.value?.toggleRowSelection(row, false);
  };

  watch(
    () => route.query.path,
    (newPath) => {
      getFileList(newPath as string);
      // 防止面包屑跳转时的滚动条位置不正确
      start.value = 0;
      end.value = 30;
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
    // max-height: calc(100vh - var(--ep-menu-horizontal-height) - 160px);
    // overflow-y: auto;
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
      max-height: calc(100vh - var(--ep-menu-horizontal-height) - 190px);
      overflow: hidden auto;
      .file-pic {
        width: 25px;
        height: 25px;
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
      align-content: start;
      .file-item {
        font-size: 14px;
        text-align: center;
        margin: 0 20px 20px 0;
        width: 168px;
        vertical-align: top;
      }
    }
    .pan-card-footer {
      font-size: 15px;
      line-height: 15px;
      text-align: left;
      margin-top: 15px;
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
