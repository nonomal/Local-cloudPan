import { ref } from 'vue';
import { throttle } from '@/utils/tool';

const vw = ref(document.documentElement.clientWidth);
const vh = ref(document.documentElement.clientHeight);
window.addEventListener(
  'resize',
  throttle(() => {
    vw.value = document.documentElement.clientWidth;
    vh.value = document.documentElement.clientHeight;
  }, 200)
);
export default function useViewport() {
  return {
    vw,
    vh,
  };
}
