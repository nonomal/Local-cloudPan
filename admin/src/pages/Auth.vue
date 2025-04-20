<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <template #header>
        <div class="auth-header">
          <h2>访问验证</h2>
          <p class="auth-desc">此共享需要密码访问</p>
        </div>
      </template>

      <el-form @submit.prevent="handleSubmit">
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入访问密码"
            :prefix-icon="Lock"
            @keyup.enter="handleSubmit" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading" class="submit-btn">
            验证访问
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Lock } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { verifyPassword } from '@/api/auth';

  const router = useRouter();
  const password = ref('');
  const loading = ref(false);

  const handleSubmit = async () => {
    if (!password.value) {
      ElMessage.warning('请输入访问密码');
      return;
    }

    loading.value = true;
    try {
      const result = await verifyPassword(password.value);
      if (result.success && result.token) {
        localStorage.setItem('access_token', result.token);
        ElMessage.success('验证成功');
        router.push('/');
      } else {
        ElMessage.error(result.message || '验证失败');
      }
    } catch (error) {
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  .auth-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
  }

  .auth-header {
    text-align: center;
  }

  .auth-header h2 {
    margin: 0;
    font-size: 24px;
    color: #303133;
  }

  .auth-desc {
    margin: 8px 0 0;
    font-size: 14px;
    color: #909399;
  }

  .submit-btn {
    width: 100%;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
  }

  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #c0c4cc inset;
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #409eff inset;
  }
</style>
