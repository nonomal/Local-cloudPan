<template>
  <div class="chat-container">
    <!-- 左侧边栏-联系人列表 -->
    <div class="contacts-sidebar">
      <div class="sidebar-header">
        <h2>聊天</h2>
      </div>
      <div class="contacts-list">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="contact-item"
          :class="{ active: contact.id === curContactId }"
          @click="switchContact(contact.id)"
        >
          <div class="contact-avatar">{{ contact.avatar }}</div>
          <div class="contact-info">
            <span class="contact-name">{{ contact.name }}</span>
            <div class="contact-message">{{ contact.lastMessage }}</div>
            <span class="contact-time">{{ contact.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧-消息区域 -->
    <div class="message-area">
      <div class="place-container" v-if="curContactId === undefined">
        <p class="place-title">选择一个联系人开始聊天</p>
      </div>
      <template v-else>
        <div class="messages-container">
          <div
            v-for="message in messages[curContactId - 1].chatContent"
            :key="message.id"
            class="message"
            :class="{ 'message-self': message.isSelf }"
          >
            <div class="message-content">
              <p>{{ message.content }}</p>
              <span class="message-time">{{ message.time }}</span>
            </div>
          </div>
        </div>

        <div class="message-input">
          <el-input
            class="input-field"
            v-model="newMessage"
            placeholder="输入消息..."
            @keyup.enter.native="sendMessage"
          />

          <el-button type="primary" class="message-button" @click="sendMessage">
            <el-icon :size="24"><i-mynaui:send-solid /></el-icon>
          </el-button>
          <el-button plain class="message-button">
            <el-icon :size="24"><i-mynaui:paperclip-solid /></el-icon>
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
defineOptions({ name: "chat" });

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
}

interface Message {
  id: number;
  content: string;
  time: string;
  isSelf: boolean;
}

interface MessageContent {
  id: number;
  chatContent: Message[];
}

// 模拟联系人数据
const contacts = ref<Contact[]>([
  {
    id: 1,
    name: "张三",
    avatar: "张",
    lastMessage: "嗨，你好吗？",
    time: "10:30",
  },
  {
    id: 2,
    name: "李四",
    avatar: "李",
    lastMessage: "你能发送文件给我吗？",
    time: "昨天",
  },
  {
    id: 3,
    name: "团队 Alpha",
    avatar: "团",
    lastMessage: "下午3点开会",
    time: "2天前",
  },
]);

// 模拟消息数据
const messages = ref<MessageContent[]>([
  {
    id: 1,
    chatContent: [
      {
        id: 1,
        content: "嗨，你好吗？",
        time: "10:30",
        isSelf: false,
      },
      {
        id: 2,
        content: "我很好，谢谢！你呢？",
        time: "10:31",
        isSelf: true,
      },
      {
        id: 3,
        content: "我也不错！你完成报告了吗？",
        time: "10:32",
        isSelf: false,
      },
      {
        id: 4,
        content: "是的，我刚刚发给你了。请查看你的邮箱。",
        time: "10:33",
        isSelf: true,
      },
    ],
  },
  {
    id: 2,
    chatContent: [
      {
        id: 1,
        content: "你能发送文件给我吗？",
        time: "10:56",
        isSelf: false,
      },
      {
        id: 2,
        content: "可以的，请上传文件。",
        time: "11:31",
        isSelf: true,
      },
      {
        id: 3,
        content: "请上传文件。",
        time: "12:12",
        isSelf: false,
      },
      {
        id: 4,
        content: "请上传文件。",
        time: "13:33",
        isSelf: true,
      },
    ],
  },
  {
    id: 3,
    chatContent: [
      {
        id: 1,
        content: "Hello,米西米西？",
        time: "10:56",
        isSelf: false,
      },
      {
        id: 2,
        content: "？你在狗叫什么",
        time: "11:31",
        isSelf: true,
      },
      {
        id: 3,
        content: "hhhhh！没事，就看你在不在",
        time: "12:12",
        isSelf: false,
      },
      {
        id: 4,
        content: "你真是闲的。",
        time: "13:33",
        isSelf: true,
      },
    ],
  },
]);

const newMessage = ref("");
const sendMessage = () => {
  if (newMessage.value.trim()) {
    const chatContent = messages.value[curContactId.value - 1].chatContent;
    chatContent.push({
      id: chatContent.length + 1,
      content: newMessage.value,
      time: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isSelf: true,
    });
    newMessage.value = "";
  }
};

const curContactId = ref(undefined);
const switchContact = (id: number) => (curContactId.value = id);
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  padding: 0;
  height: calc(100vh - 4rem);
  text-align: left;
  overflow: hidden;

  .contacts-sidebar {
    width: 16rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--ep-border-color-lighter);

    .sidebar-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ep-text-color-primary);
      margin-bottom: 1rem;
    }
    .contacts-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .contact-item {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: background-color 0.2s;
        cursor: pointer;
        &:hover {
          background-color: var(--ep-file-hover);
        }
        &.active {
          background-color: var(--ep-file-hover);
        }

        .contact-avatar {
          width: 2.5rem;
          height: 2.5rem;
          background-color: #e6e8eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: #606266;
        }
        .contact-info {
          flex: 1 1 0%;
          min-width: 0;
        }

        .contact-name {
          font-weight: 500;
          color: var(--ep-text-color-primary);
        }

        .contact-time {
          font-size: 0.75rem;
          color: var(--ep-text-color-secondary);
        }

        .contact-message {
          font-size: 0.875rem;
          color: var(--ep-text-color-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

.message-area {
  flex: 1;
  display: flex;
  flex-direction: column;

  .place-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    .place-title {
      color: #909399;
    }
  }

  .messages-container {
    flex: 1;
    padding: 1.25rem;
    overflow-y: auto;

    .message {
      margin-bottom: 1.25rem;
      display: flex;

      .message-content {
        max-width: 70%;
        padding: 0.75rem 1rem;
        background-color: var(--ep-fill-color-light);
        border-radius: 0.5rem;
        position: relative;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .message-content p {
        margin: 0;
        color: var(--ep-text-color-primary);
        line-height: 1.5;
      }

      .message-time {
        font-size: 0.75rem;
        color: var(--ep-text-color-secondary);
        margin-top: 4px;
        display: block;
      }
    }

    .message-self {
      flex-direction: row-reverse;
      .message-content {
        background-color: var(--ep-color-primary);
        p {
          color: #fff;
        }
      }
    }
  }

  .message-input {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    border-top: 1px solid var(--ep-border-color-lighter);
    .input-field {
      display: flex;
      border-radius: 0.375rem;
      border-width: 1px;
      width: 100%;
      height: 2.5rem;
      font-size: 1rem;
      line-height: 1.5rem;
      color: var(--ep-text-color-placeholder);
      background-color: var(--ep-fill-color-light);
      margin-right: 0.75rem;
    }
    .message-button {
      width: 3rem;
      height: 2.5rem;
    }
  }
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
