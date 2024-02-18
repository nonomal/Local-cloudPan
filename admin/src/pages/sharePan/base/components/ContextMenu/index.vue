<template>
  <div ref="containerRef">
    <slot></slot>
    <Teleport to="body">
      <div v-show="showMenu" class="context-menu" :style="{ left: x + 'px', top: y + 'px' }">
        <div
          v-for="item in menu"
          :key="item.label"
          class="menu-item"
          :class="{ 'has-submenu': item.subMenu }"
          @click="handleClick(item)"
        >
          <p>
            <el-icon v-if="item.icon" size="1em" style="margin-right: 7px; vertical-align: middle">
              <component :is="item.icon"></component>
            </el-icon>
            <span style="vertical-align: middle">{{ item.label }}</span>
          </p>
          <!-- 子菜单 -->
          <template v-if="item.subMenu">
            <div class="context-menu submenu-list">
              <div
                @click="handleSubClick(item, subItem)"
                class="menu-item"
                v-for="subItem in item.subMenu"
                :key="subItem.label"
              >
                <p>
                  <el-icon
                    v-if="subItem.icon"
                    size="1em"
                    style="margin-right: 7px; vertical-align: middle"
                  >
                    <component :is="subItem.icon"></component>
                  </el-icon>
                  <span style="vertical-align: middle">{{ subItem.label }}</span>
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
  export default { name: 'ContextMenu' };
</script>
<script setup lang="ts">
  import { ref } from 'vue';
  import useContextMenu from '@/composables/useContextMenu';

  type MenuItem = {
    label: string;
    icon?: string;
    subMenu?: Array<{ label: string; icon?: string }>;
  };
  const props = defineProps<{
    menu: Array<MenuItem>;
    showarea?: string;
  }>();

  const emit = defineEmits(['select']);
  const containerRef = ref(null);
  const { x, y, showMenu } = useContextMenu(containerRef, props.showarea || undefined);

  // 菜单的点击事件
  function handleClick(item: MenuItem) {
    showMenu.value = false;
    // 存在子菜单时，此item的点击无效
    if (item.subMenu && item.subMenu.length > 0) {
      return;
    }
    emit('select', item);
  }

  // 副菜单的点击事件
  function handleSubClick(item: MenuItem, subItem: MenuItem) {
    showMenu.value = false;
    emit('select', { label: `${item.label}-${subItem.label}` });
  }
</script>

<style scoped lang="scss">
  .context-menu {
    position: fixed;
    font-size: 14px;
    color: var(--ep-contextmenu-text-color);
    background-color: var(--ep-contextmenu-bc);
    border: 1px solid #ccc;
    padding: 10px 0 10px 10px;
    border-radius: 6px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
    z-index: 9999;

    .menu-item {
      height: 30px;
      line-height: 30px;
      min-width: 100px;
      padding-left: 12px;
      cursor: pointer;
      position: relative;
      /* 最后一栏没有下划线 */
      &:not(:last-child) {
        border-bottom: 1px solid #d2d3d8;
      }
      &:hover {
        background-color: #f0f0f0;
        .submenu-list {
          visibility: visible;
        }
      }
      .submenu-list {
        position: absolute;
        top: 0;
        right: 0;
        transform: translateX(100%);
        visibility: hidden;
      }
    }
    .has-submenu {
      position: relative;
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        right: 10px;
        width: 0;
        height: 0;
        border: 5px solid transparent;
        border-left-color: #000;
        transform: translateY(-50%);
      }
    }
  }
</style>
