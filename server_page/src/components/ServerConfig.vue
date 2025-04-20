<template>
  <div class="server-config">
    <el-card class="status-card mb-6">
      <template #header>
        <div class="card-header">
          <div>
            <h3 class="card-title">服务状态</h3>
            <p class="card-desc">控制服务运行状态</p>
          </div>
          <div class="network-select">
            <el-select v-model="selectedInterface" placeholder="选择网口" size="large">
              <el-option
                v-for="iface in networkInterfaceList"
                :key="iface"
                :label="iface"
                :value="iface" />
            </el-select>
            <el-select
              v-model="selectedIP"
              placeholder="选择IP"
              size="large"
              :disabled="!selectedInterface"
              placement="bottom-end">
              <el-option v-if="ipList.ipv4" :key="ipList.ipv4" label="IPv4" :value="ipList.ipv4" />
              <el-option
                v-if="ipList.ipv6"
                :key="ipList.ipv6"
                label="IPv6"
                :value="`[${ipList.ipv6}]`" />
            </el-select>
          </div>
        </div>
      </template>

      <!-- 服务状态 -->
      <div class="status-content">
        <div class="status-info">
          <div class="status-meta">
            <div class="status-label">服务状态</div>
            <div class="status-text">{{ serverStatus ? '运行中' : '已停止' }}</div>
          </div>
          <el-tag :type="serverStatus ? '' : 'danger'" size="default" effect="dark" :round="true">
            {{ serverStatus ? '在线' : '离线' }}
          </el-tag>
        </div>
        <el-button
          size="large"
          :type="serverStatus ? 'danger' : 'primary'"
          @click="handleStatusChange(!serverStatus)"
          class="action-button">
          {{ serverStatus ? '停止服务' : '启动服务' }}
        </el-button>
      </div>

      <!-- 显示托管网址 -->
      <div v-if="serverStatus" class="url-display">
        <div class="url-label">托管网址:</div>
        <div class="url-content">
          <code class="url-code">http://{{ selectedIP }}:{{ config.port }}</code>
          <el-button type="default" size="small" @click="copyUrl">复制</el-button>
        </div>
      </div>
    </el-card>

    <el-tabs v-model="activeTab" class="config-tabs">
      <el-tab-pane label="基本设置" name="basic">
        <el-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3 class="card-title">基本配置</h3>
                <p class="card-desc">设置服务的基本参数</p>
              </div>
              <el-button type="primary" size="large" @click="saveConfig">保存配置</el-button>
            </div>
          </template>
          <div class="card-content">
            <div class="config-grid">
              <div class="config-item">
                <div class="config-label">
                  <el-icon><Monitor /></el-icon>
                  <span>端口号</span>
                </div>
                <el-input v-model.number="config.port"></el-input>
                <p class="help-text">服务将在此端口上监听连接</p>
              </div>

              <div class="config-item">
                <div class="config-label">
                  <el-icon><Folder /></el-icon>
                  <span>托管路径</span>
                </div>
                <div class="path-input">
                  <el-input v-model="config.publicPath"></el-input>
                  <el-button @click="selectFolder">
                    <el-icon><FolderOpened /></el-icon>
                  </el-button>
                </div>
                <p class="help-text">要共享的本地文件夹路径</p>
              </div>
            </div>

            <div class="config-item mt-4">
              <div class="config-label">
                <span>最大连接数 ({{ config.maxConnections }})</span>
              </div>
              <el-slider
                v-model.number="config.maxConnections"
                :min="1"
                :max="50"
                :step="1"
                show-stops></el-slider>
              <p class="help-text">允许同时连接的最大用户数</p>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="访问控制" name="access">
        <el-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3 class="card-title">访问控制</h3>
                <p class="card-desc">设置谁可以访问您的共享文件</p>
              </div>
              <el-button type="primary" size="large" @click="saveConfig">保存配置</el-button>
            </div>
          </template>
          <div class="card-content">
            <div class="switch-item">
              <div class="switch-info">
                <div class="config-label">
                  <el-icon><Lock /></el-icon>
                  <span>允许匿名访问</span>
                </div>
                <p class="help-text">允许无需密码即可访问共享文件</p>
              </div>
              <el-switch v-model="config.allowAnonymous" />
            </div>

            <!-- 访问密码输入框 -->
            <div v-if="!config.allowAnonymous" class="password-section">
              <div class="config-label">
                <el-icon><Lock /></el-icon>
                <span>访问密码</span>
              </div>
              <div class="password-input">
                <el-input
                  v-model="config.accessPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="设置访问密码">
                  <template #suffix>
                    <el-icon class="password-toggle" @click="showPassword = !showPassword">
                      <View v-if="showPassword" />
                      <Hide v-else />
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <p class="help-text">设置访问共享文件所需的密码，访问者需要输入此密码才能查看文件</p>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="日志" name="logs">
        <el-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3 class="card-title">服务日志</h3>
                <p class="card-desc">查看服务运行日志</p>
              </div>
              <el-button type="primary" size="large" @click="clearLogs">清空日志</el-button>
            </div>
          </template>
          <div class="logs-content">
            <div class="log-container">
              <div class="log-content" ref="logContent">
                <div
                  v-for="(log, index) in logs"
                  :key="index"
                  :class="['log-item', log.level.toLowerCase()]">
                  <span class="log-time">[{{ log.timestamp }}]</span>
                  <span class="log-level">[{{ log.level }}]</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
  import { ref, onMounted, toRaw, watch, onBeforeUnmount, nextTick } from 'vue';
  import { ElMessage } from 'element-plus';
  import { Monitor, Folder, FolderOpened, Lock, View, Hide } from '@element-plus/icons-vue';

  const serverStatus = ref(false);
  const activeTab = ref('basic');
  const networkInterfaceList = ref([]);
  const selectedInterface = ref('');
  const ipList = ref({ ipv4: '', ipv6: '' });
  const selectedIP = ref('');

  const showPassword = ref(false);

  const config = ref({
    port: 8080,
    publicPath: 'D://',
    maxConnections: 10,
    allowAnonymous: true,
    accessPassword: '',
  });
  config.value = window.customApis.getConfig();

  const logs = ref([]);
  const lastLogId = ref(0);
  const logUpdateTimer = ref(null);

  // 获取网络接口列表
  const getNetworkInterfaces = async () => {
    const interfaces = await window.customApis.getNetworkInterfaces();
    networkInterfaceList.value = interfaces;

    // 默认选择第一个接口
    if (interfaces.length > 0) {
      selectedInterface.value = interfaces[0];
      // 获取默认接口的IP列表
      await updateIPList(interfaces[0]);
    }
  };

  // 更新IP列表
  const updateIPList = async (interfaceName) => {
    const ips = await window.customApis.getPreferredIP(interfaceName);
    ipList.value = ips || { ipv4: '', ipv6: '' };
    // 默认选择 IPv4，如果没有则选择 IPv6
    selectedIP.value = ipList.value.ipv4 || ipList.value.ipv6 || '';
  };

  // 监听网络接口变化
  watch(
    () => selectedInterface.value,
    async (newValue) => {
      if (newValue) {
        await updateIPList(newValue);
      }
    }
  );

  // 复制链接到剪贴板
  const copyUrl = async () => {
    const url = `http://${selectedIP.value}:${config.value.port}`;
    await navigator.clipboard.writeText(url);
    ElMessage.success('网址已复制到剪贴板');
  };

  onMounted(() => getNetworkInterfaces());

  const handleStatusChange = async (status) => {
    const { startServer, stopServer } = window.customApis;
    const operation = status ? startServer : stopServer;
    const result = await operation();

    if (result) {
      serverStatus.value = status;
      ElMessage.success(`服务已${status ? '启动' : '停止'}`);
    } else {
      ElMessage.error(`服务${status ? '启动' : '停止'}失败`);
    }
  };

  const selectFolder = async () => {
    const result = await window.utools.showOpenDialog({
      title: '选择要共享的文件夹',
      properties: ['openDirectory'],
    });

    if (result && result.length > 0) {
      console.log('result', result);
      config.value.publicPath = result[0];
    }
  };

  const saveConfig = async () => {
    const result = await window.customApis.updateConfig(toRaw(config.value));
    if (result.success) {
      ElMessage.success('配置已保存');
    } else {
      ElMessage.error(result.error || '保存配置失败');
    }
  };

  // 获取日志
  const fetchLogs = async () => {
    try {
      const data = await window.customApis.getLatestLogs(lastLogId.value);
      if (data && data.length > 0) {
        logs.value.push(...data);
        lastLogId.value = data[data.length - 1].id;
        // 保持日志数量在合理范围内
        if (logs.value.length > 1000) {
          logs.value = logs.value.slice(-1000);
        }
        // 滚动到底部
        nextTick(() => {
          const logContent = logContent.value;
          if (logContent) {
            logContent.scrollTop = logContent.scrollHeight;
          }
        });
      }
    } catch (error) {
      console.error('获取日志失败:', error);
    }
  };

  // 清空日志
  const clearLogs = async () => {
    try {
      window.customApis.clearLogs();
      logs.value = [];
      lastLogId.value = 0;
      ElMessage.success('日志已清空');
    } catch (error) {
      console.error('清空日志失败:', error);
      ElMessage.error('清空日志失败');
    }
  };

  // 开始定时更新日志
  const startLogUpdate = () => {
    logUpdateTimer.value = setInterval(() => {
      if (serverStatus.value) {
        fetchLogs();
      }
    }, 1000); // 每秒更新一次
  };

  // 停止定时更新日志
  const stopLogUpdate = () => {
    if (logUpdateTimer.value) {
      clearInterval(logUpdateTimer.value);
      logUpdateTimer.value = null;
    }
  };

  watch(serverStatus, (newStatus) => {
    if (newStatus) {
      fetchLogs();
      startLogUpdate();
    } else {
      stopLogUpdate();
      logs.value = [];
      lastLogId.value = 0;
    }
  });

  onBeforeUnmount(() => {
    stopLogUpdate();
  });
</script>

<style scoped>
  .mb-6 {
    margin-bottom: 24px;
  }

  .mt-4 {
    margin-top: 16px;
  }

  .w-full {
    width: 100%;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .card-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    color: #1a1a1a;
  }

  .card-desc {
    font-size: 14px;
    color: #666;
    margin: 4px 0 0;
  }

  .status-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .status-label {
    font-weight: 500;
    font-size: 16px;
    color: #1a1a1a;
  }

  .status-text {
    font-size: 14px;
    color: #666;
  }

  .action-button {
    width: 120px;
  }

  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .config-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .config-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #1a1a1a;
  }

  .path-input {
    display: flex;
    gap: 8px;
  }

  .help-text {
    font-size: 12px;
    color: #666;
    margin: 0;
  }

  .switch-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
  }

  .switch-item:last-child {
    border-bottom: none;
  }

  .switch-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .log-container {
    margin-top: 0;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    height: 200px;
    overflow: hidden;
  }

  .log-content {
    height: 100%;
    overflow-y: auto;
    padding: 10px;
    background-color: #1e1e1e;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.5;
  }

  /* 自定义滚动条样式 */
  .log-content::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .log-content::-webkit-scrollbar-thumb {
    background: #4c4c4c;
    border-radius: 3px;
  }

  .log-content::-webkit-scrollbar-thumb:hover {
    background: #666;
  }

  .log-content::-webkit-scrollbar-track {
    background: #2c2c2c;
    border-radius: 3px;
  }

  /* 确保在hover时滚动条样式保持一致 */
  .log-content:hover::-webkit-scrollbar-thumb {
    background: #4c4c4c;
  }

  .log-content:hover::-webkit-scrollbar-track {
    background: #2c2c2c;
  }

  .log-item {
    color: #d4d4d4;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 2px 0;
  }

  .log-time {
    color: #6a9955;
    margin-right: 8px;
  }

  .log-level {
    margin-right: 8px;
  }

  .log-item.error {
    color: #f56c6c;
  }

  .log-item.warn {
    color: #e6a23c;
  }

  .log-item.info {
    color: #409eff;
  }

  .log-item.debug {
    color: #909399;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: #eee;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
  }

  :deep(.el-tabs__item.is-active) {
    font-weight: 500;
  }

  :deep(.el-card) {
    border-radius: 8px;
    border: 1px solid #eee;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  :deep(.el-button) {
    font-weight: 500;
  }

  /* 覆盖按钮hover效果 */
  :deep(.el-button--primary) {
    --el-button-hover-bg-color: var(--el-color-primary);
    --el-button-hover-border-color: var(--el-color-primary);
  }

  :deep(.el-button--danger) {
    --el-button-hover-bg-color: var(--el-color-danger);
    --el-button-hover-border-color: var(--el-color-danger);
  }

  /* 确保其他按钮样式保持不变 */
  :deep(.el-button) {
    transition: none;
  }

  .network-select {
    display: flex;
    align-items: center;
    gap: 8px;
    width: auto;
  }

  .network-select :deep(.el-select) {
    width: 120px;
  }

  .url-display {
    margin-top: 16px;
    padding: 12px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .url-label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .url-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .url-code {
    flex: 1;
    padding: 8px 12px;
    background-color: var(--el-bg-color);
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
  }

  .password-section {
    margin-top: 16px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    border: 1px solid var(--el-border-color-light);
  }

  .password-input {
    margin: 8px 0;
  }

  .password-toggle {
    cursor: pointer;
    color: var(--el-text-color-secondary);
  }

  .password-toggle:hover {
    color: var(--el-text-color-primary);
  }
</style>
