import { Ref, onMounted, onUnmounted, ref } from 'vue';
export default function (containerRef: Ref, showarea?: string) {
  const showMenu = ref(false);
  const x = ref(0);
  const y = ref(0);
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    // 如果有showarea，且点击的元素不在showarea内，
    // 则不显示右键菜单,事件传播触发祖先元素事件
    if (showarea && !e.target['closest'](showarea)) {
      return;
    }
    e.stopPropagation();
    showMenu.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  };
  function closeMenu() {
    showMenu.value = false;
  }
  onMounted(() => {
    const div = containerRef.value;
    div.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', closeMenu, true);
    window.addEventListener('contextmenu', closeMenu, true);
  });
  onUnmounted(() => {
    const div = containerRef.value;
    div.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('click', closeMenu, true);
    window.removeEventListener('contextmenu', closeMenu, true);
  });
  return {
    showMenu,
    x,
    y,
  };
}
