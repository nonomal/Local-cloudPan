<template>
  <div ref="containerRef">
    <slot></slot>
    <Teleport to="body">
      <div
        v-show="showMenu"
        class="context-menu"
        :style="{ left: pos.posX + 'px', top: pos.posY + 'px' }"
        v-resize="handleSizeChange">
        <div
          v-for="item in menu"
          :key="item.label"
          :class="{ 'has-submenu': item.subMenu }"
          class="menu-item"
          @click="handleClick(item)">
          <p>
            <el-icon v-if="item.icon" size="1em" style="margin-right: 7px; vertical-align: middle">
              <component :is="item.icon"></component>
            </el-icon>
            <span style="vertical-align: middle">{{ item.label }}</span>
          </p>
          <!-- 子菜单 -->
          <template v-if="item.subMenu">
            <div class="context-menu submenu-list" :style="submenuStyles">
              <div
                class="menu-item"
                :key="subItem.label"
                v-for="subItem in item.subMenu"
                @click="handleSubClick(item, subItem)">
                <p>
                  <el-icon
                    v-if="subItem.icon"
                    size="1rem"
                    style="margin-right: 7px; vertical-align: middle">
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

<script setup lang="ts">
  import { ref, computed, CSSProperties } from 'vue';
  import useContextMenu from '@/composables/useContextMenu';
  import useViewPort from '@/composables/useViewport';

  defineOptions({ name: 'ContextMenu' });
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

  // 获取菜单窗口位置
  const containerRef = ref(null);
  const w = ref(0);
  const h = ref(0);
  const { x, y, showMenu } = useContextMenu(containerRef, props.showarea || undefined);
  const { vw, vh } = useViewPort(); // 视口宽高
  const pos = computed(() => {
    let posX = x.value;
    let posY = y.value;
    // 横向边界
    if (x.value > vw.value - w.value) {
      posX = x.value - w.value;
    }
    // 纵向边界
    if (y.value > vh.value - h.value) {
      posY = vh.value - h.value;
    }
    return { posX, posY };
  });
  // 响应菜单窗口size变化
  const handleSizeChange = (e) => {
    w.value = e.width;
    h.value = e.height;
  };

  // 响应菜单的点击事件
  const closeContextMenu = () => (showMenu.value = false);
  // 主菜单
  function handleClick(item: MenuItem) {
    // 存在子菜单时，此item的点击无效
    if (item.subMenu && item.subMenu.length > 0) {
      return;
    }
    closeContextMenu();
    emit('select', item);
  }
  // 副菜单
  function handleSubClick(item: MenuItem, subItem: MenuItem) {
    emit('select', { label: `${item.label}-${subItem.label}` });
    closeContextMenu();
  }

  // 子菜单的样式
  const submenuStyles = computed<CSSProperties>(() => {
    const isRowReverse = x.value > vw.value - w.value;
    const isColReverse = y.value > vh.value - h.value;
    return {
      [isRowReverse ? 'left' : 'right']: 0,
      [isColReverse ? 'bottom' : 'top']: 0,
      transform: `translateX(${isRowReverse ? '-' : ''}100%)`,
    };
  });
</script>

<style scoped lang="scss">
  .context-menu {
    position: fixed;
    font-size: 14px;
    color: var(--ep-contextmenu-text-color);
    background-color: var(--ep-contextmenu-bc);
    border: 1px solid var(--ep-border-color-light);
    padding: 10px 0 10px 10px;
    border-radius: 6px;
    box-shadow: var(--ep-box-shadow-light);
    z-index: 9999;

    .menu-item {
      position: relative;
      height: 30px;
      line-height: 30px;
      min-width: 100px;
      padding-left: 12px;
      cursor: pointer;
      /* 最后一栏没有下划线 */
      &:not(:last-child) {
        border-bottom: 1px solid var(--ep-border-color-lighter);
      }
      &:hover {
        background-color: var(--ep-file-hover);
        .submenu-list {
          visibility: visible;
        }
      }
      .submenu-list {
        position: absolute;
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
        border-left-color: var(--ep-contextmenu-text-color);
        transform: translateY(-50%);
      }
    }
  }
</style>
