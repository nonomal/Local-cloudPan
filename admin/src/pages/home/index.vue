<script setup lang="ts">
const announcements = [
  {
    title: "系统维护通知",
    date: "2023-06-10",
    content: "我们将于本周六进行系统维护，届时系统可能会短暂不可用。",
  },
  {
    title: "新功能上线",
    date: "2023-06-08",
    content: "我们很高兴地宣布，文件共享功能现已上线！",
  },
];

const pinnedMessages = [
  {
    content: "请记得及时备份您的重要文件。",
    author: "系统管理员",
  },
  {
    content: "下周一将举行全体会议，请准时参加。",
    author: "人力资源部",
  },
];
</script>

<template>
  <div>
    <el-card class="section">
      <template #header>
        <h2 class="section-title">公告</h2>
      </template>
      <div class="announcements">
        <div
          v-for="(announcement, index) in announcements"
          :key="index"
          class="announcement-item"
        >
          <div class="announcement-header">
            <h3>{{ announcement.title }}</h3>
            <span class="date">{{ announcement.date }}</span>
          </div>
          <p class="announcement-content">{{ announcement.content }}</p>
        </div>
      </div>
    </el-card>

    <el-card class="section">
      <template #header>
        <div class="section-title">置顶消息</div>
      </template>
      <div class="pinned-messages">
        <div
          v-for="(message, index) in pinnedMessages"
          :key="index"
          class="message-item"
        >
          <p class="message-content">{{ message.content }}</p>
          <span class="author">- {{ message.author }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.section {
  text-align: left;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;

  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--ep-text-color-primary);
  }

  .announcement-item {
    padding: 1rem 0;
    border-bottom: 1px solid var(--ep-border-color-lighter);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    &:first-child {
      padding-top: 0;
    }

    .announcement-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ep-text-color-primary);
      }
      .date {
        color: var(--ep-text-color-secondary);
        font-size: 0.8rem;
      }
    }
    .announcement-content {
      color: var(--ep-text-color-regular);
      line-height: 1.5;
      margin: 0;
    }
  }

  .message-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--ep-border-color-lighter);
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    &:first-child {
      padding-top: 0;
    }
    .message-content {
      margin: 0 0 0.5rem 0;
      color: var(--ep-text-color-regular);
      line-height: 1.5;
    }

    .author {
      color: var(--ep-text-color-secondary);
      font-size: 0.8rem;
    }
  }
}
</style>
