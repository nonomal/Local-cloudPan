<template>
  <div class="tabbar-container">
    <Tabbar @switch-mode="handleSwitch"></Tabbar>
  </div>

  <ContextMenu :menu="mainMenu" @select="handleSelect">
    <el-card class="pan-card">
      <!-- 列表视图 -->
      <el-table
        :data="fileList"
        @cell-click="handleClick"
        @row-contextmenu="menuShow == true"
        v-if="curMode === 0"
        style="
          max-height: calc(100vh - var(--ep-menu-horizontal-height) - 112px);
          overflow: hidden auto;
        "
      >
        <el-table-column prop="name" label="文件名" min-width="100">
          <template #default="{ row }">
            <img :src="row.iconSrc" alt="" width="25px" height="25px" class="file-pic" />
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" min-width="30"></el-table-column>
        <el-table-column prop="modified" label="修改时间" min-width="70"></el-table-column>
      </el-table>

      <!-- 网格视图 -->
      <ContextMenu :menu="fileMenu" showarea=".grid-view .file-item" @select="handleSelect">
        <div class="grid-view" v-if="curMode === 1">
          <div class="file-item" v-for="file in fileList" :key="file.id">
            <FileItem :file="file" @file-click="handleClick" @file-choosed="handleChoose" />
          </div>
        </div>
      </ContextMenu>
    </el-card>
  </ContextMenu>
  <!-- 下载 -->
  <div class="download-container">
    <a ref="downloadRef" :href="fileHref"></a>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'sharePan',
  };
</script>
<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue';
  import { reqFileList, delteFile } from '@/api/file/fileList';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { useRouter, useRoute } from 'vue-router';

  import { getFileType, formatFileSize, formatDateTime } from '@/utils/filestatus';
  import { formatFile } from '@/api/file/types';
  import Tabbar from './components/Tabbar/index.vue';
  import FileItem from './components/FileItem/index.vue';
  import ContextMenu from './components/ContextMenu/index.vue';

  const router = useRouter();
  const route = useRoute();

  const fileList = ref([]);
  const selectedFiles = ref([]);
  const curMode = ref(0);
  const menuShow = ref(false); // table右键菜单是否显示
  const downloadRef = ref(null);

  // 右键菜单项
  const mainMenu = [
    {
      label: '排序方式',
      subMenu: [{ label: '名称' }, { label: '大小' }, { label: '修改日期' }],
    },
    { label: '刷新' },
  ];
  const fileMenu = [
    { label: '下载', icon: 'Download' },
    { label: '移动', icon: 'Rank' },
    { label: '重命名', icon: 'EditPen' },
    { label: '删除', icon: 'Delete' },
  ];

  // 获取文件数据
  const getFileList = async (path: string, sortMode?: 'name' | 'size' | 'modified') => {
    const result = await reqFileList(path, sortMode);
    if (result.code === 200) {
      const formatRes: formatFile[] = result.data.fileList.reduce((newList, file) => {
        const fileType = getFileType(file.ext);
        const size = formatFileSize(file.size);
        const modified = formatDateTime(file.modified);
        const iconPath = file.isDir ? 'directory' : fileType ? `${fileType}/${file.ext}` : 'others';
        const iconSrc = `/src/assets/fileType/${iconPath}.svg`;
        newList.push({ ...file, size, modified, fileType, iconSrc });
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
  };

  // 右键菜单选择
  const handleSelect = (MenuItem) => {
    const path = route.query.path as string;
    const openration = {
      刷新: () => getFileList(path),
      '排序方式-名称': () => getFileList(path, 'name'),
      '排序方式-大小': () => getFileList(path, 'size'),
      '排序方式-修改日期': () => getFileList(path, 'modified'),
      下载: () => downloadRef.value.click(),
      移动: () => 1,
      重命名: () => 1,
      删除: () => {
        ElMessageBox.confirm('文件一经删除，无法恢复，确定删除所选的文件吗？', '确定删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            delteFile(path, filenameList.value);
            getFileList(path);
            ElMessage({
              type: 'success',
              message: '删除成功！',
            });
          })
          .catch(() => {
            ElMessage({
              type: 'info',
              message: '删除失败',
            });
          });
      },
    };
    openration[MenuItem.label]();
  };

  // 文件勾选
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

  const filenameList = computed(() => {
    return selectedFiles.value.map((file) => file.name);
  });

  const fileHref = computed(() => {
    return `http://localhost:9527/download?filenameList=[${filenameList.value}]&path=${route.query.path ? route.query.path : ''}`;
  });
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
  .pan-card {
    border-radius: 10px;
    max-height: calc(100% - 40px);
    max-width: calc(100% - 10px);
  }
  :deep(.ep-table__body tr:hover > td.ep-table__cell) {
    transform: scale(1.01);
  }
  :deep(.ep-table__body tr > td.ep-table__cell) {
    transition: all 0.3s ease;
  }
  .file-pic {
    vertical-align: bottom;
    margin-right: 5px;
  }
  .tabbar-container {
    margin-bottom: 1rem;
  }
  .grid-view {
    display: flex;
    flex-wrap: wrap;
    padding: 0 25px;
    height: fit-content;
    max-height: calc(100vh - var(--ep-menu-horizontal-height) - 112px);
    overflow: hidden auto;
  }
  .file-item {
    font-size: 14px;
    text-align: center;
    margin: 0 20px 20px 0;
    width: 168px;
    vertical-align: top;
  }

  .download-container {
    position: absolute;
    left: -9999px;
  }
</style>
