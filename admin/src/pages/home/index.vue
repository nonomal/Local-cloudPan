<template>
  <el-table class="list-view" :data="fileList">
    <el-table-column type="selection" width="55" />
    <el-table-column prop="name" label="文件名" min-width="100" :show-overflow-tooltip="true">
      <template #default="{ row }">
        <img :src="row.iconSrc" alt="" width="25px" height="25px" class="file-pic" />
        {{ row.name }}
      </template>
    </el-table-column>
    <el-table-column prop="size" label="大小" min-width="30"></el-table-column>
    <el-table-column prop="modified" label="修改时间" min-width="70"></el-table-column>
  </el-table>
  <el-button type="primary" @click="handleClick">消息框</el-button>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage } from 'element-plus';
  import { ref } from 'vue';
  const fileList = ref([
    {
      id: 281474976710695,
      name: '$RECYCLE.BIN',
      isDir: true,
      ext: 'BIN',
      size: '-',
      modified: '2022-09-15 04:31:26',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 844424930149216,
      name: '.pnpm-store',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2023-06-01 12:49:10',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 844424930152344,
      name: '360Downloads',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2022-07-02 17:12:56',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 1970324837104753,
      name: 'CloudMusic',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2023-12-05 14:58:33',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 17169973579485568,
      name: 'LYS',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2023-07-12 18:53:28',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 12947848929187182,
      name: 'SSY',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2022-11-15 11:30:30',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 1688849860755076,
      name: 'Tdea',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2023-04-26 09:06:27',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 1970324837013968,
      name: 'VS_pro',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2022-07-10 22:02:00',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 562949954134513,
      name: 'WCR',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2023-12-12 20:00:48',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 281474977344703,
      name: 'WYC',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2024-02-07 22:01:49',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
    {
      id: 1970324837014033,
      name: 'YJ',
      isDir: true,
      ext: '',
      size: '-',
      modified: '2023-01-30 18:48:36',
      iconSrc: '/src/assets/fileType/directory.svg',
    },
  ]);
  const handleClick = () => {
    ElMessageBox.confirm('文件一经删除，无法恢复，确定删除所选的文件吗？', '确定删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      ElMessage({
        type: 'success',
        message: '删除成功！',
      });
    });
  };
</script>

<style scoped></style>
