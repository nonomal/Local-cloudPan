<template>
  <!-- 移动目录选择框 -->
  <ElCard shadow="always" class="move-card">
    <template #header>
      <div class="card-header">
        <span class="card-header-text">{{ popoverType === 'move' ? '移动到' : '复制到' }}</span>
        <ElIcon :size="15" class="close-btn" @click="hanleClose"><CloseBold /></ElIcon>
      </div>
    </template>

    <template #default>
      <!-- 面包屑 -->
      <div class="breadcrumb-wrapper">
        <el-breadcrumb separator-icon="ArrowRight">
          <el-breadcrumb-item
            v-for="(path, index) in pathArr"
            :key="index"
            @click="handleClick(path)">
            <span>{{ path }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- table -->
      <div class="table-wrapper">
        <table class="dic-table" v-if="dictoryArr.length > 1">
          <colgroup>
            <col width="100%" />
          </colgroup>
          <tbody>
            <tr
              v-for="(item, index) in dictoryArr"
              :key="index"
              class="dic-table-row"
              @click="getDictoryList(item)">
              <td>
                <img
                  src="/src/assets/fileType/directory.svg"
                  alt=""
                  width="25px"
                  height="25px"
                  class="file-pic" />
                <span class="filename">{{ item }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <el-empty v-else :description="`移动到 ${pathArr.at(-1)} 文件夹`" />
      </div>

      <!-- 按钮组 -->
      <div class="card-footer">
        <ElButton plain @click="hanleClose">取消</ElButton>
        <ElButton type="primary" @click="handleMoveOrCopy">
          {{ popoverType === 'move' ? '移动到此' : '复制到此' }}
        </ElButton>
      </div>
    </template>
  </ElCard>
  <div class="panel-cover" v-show="mvOrCopyShow" @click.self="hanleClose"></div>
</template>

<script setup lang="ts">
  import { ref, shallowRef } from 'vue';
  import { useRoute } from 'vue-router';
  import { reqFileList, moveOrCopyFile } from '@/api/file/fileList';

  defineOptions({ name: 'MoveSelect' });
  const props = defineProps<{
    mvOrCopyShow: boolean;
    filenameList: string[];
    popoverType: 'move' | 'copy';
    onSuccess: () => void;
  }>();
  const emit = defineEmits(['update:mvOrCopyShow']);
  const route = useRoute();

  // #region 获取可选目录
  const pathArr = ref<string[]>(['全部文件']); // 面包屑路径数组
  const dictoryArr = shallowRef([]); // 目录列表
  const getDictoryList = async (item: string) => {
    const curPath = [...pathArr.value.slice(1), item].join('/');
    const result = await reqFileList(curPath);
    if (result.code === 200) {
      const formatRes = result.data.fileList.filter((f) => f.isDir).map((f) => f.name);
      dictoryArr.value = formatRes;
    }
    if (item) pathArr.value.push(item);
  };
  getDictoryList('');
  // #endregion

  // 点击面包屑导航事件
  const handleClick = (path: string) => {
    const index = pathArr.value.indexOf(path);
    if (index > -1) {
      pathArr.value = pathArr.value.slice(0, index + 1);
    }
    getDictoryList('');
  };

  // 移动文件
  const handleMoveOrCopy = async () => {
    const destination = pathArr.value.slice(1).join('/');
    try {
      const result = await moveOrCopyFile(
        route.query.path as string,
        props.filenameList,
        destination,
        props.popoverType
      );
      if (result.code === 200) {
        ElMessage({
          type: 'success',
          message: result.msg,
        });
      }
    } catch (err) {
    } finally {
      hanleClose();
      props.onSuccess();
    }
  };

  // 关闭弹窗
  const hanleClose = () => emit('update:mvOrCopyShow', false);
</script>

<style scoped lang="scss">
  .move-card {
    width: 720px;
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .card-header-text {
        font-size: 15px;
        font-weight: bold;
      }
      .close-btn {
        color: var(--ep-contextmenu-text-color);
        cursor: pointer;
        &:hover {
          color: var(--ep-menu-active-color);
        }
      }
    }
    :deep(.ep-card__body) {
      padding: 0 0 10px;
    }
    .breadcrumb-wrapper {
      padding: 15px 20px;
      background-color: var(--ep-file-hover);
    }
    .table-wrapper {
      height: 340px;
      overflow-y: auto;
      .dic-table {
        width: 100%;
        table-layout: fixed;
        text-align: left;
        border-collapse: collapse;
        .dic-table-row {
          height: 50px;
          line-height: 1;
          font-size: 15px;
          border-bottom: 1px solid var(--ep-border-color-lighter);
          cursor: pointer;
          &:hover {
            background-color: var(--ep-file-hover);
          }
          td {
            vertical-align: middle;
            padding-left: 20px;
            .file-pic {
              vertical-align: middle;
              margin-right: 5px;
            }
            .filename {
              transition: all 0.3s ease;
              cursor: pointer;
              &:hover {
                color: var(--ep-menu-active-color);
              }
            }
          }
        }
      }
    }
    .card-footer {
      padding: 10px 20px;
      display: flex;
      justify-content: flex-end;
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
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
