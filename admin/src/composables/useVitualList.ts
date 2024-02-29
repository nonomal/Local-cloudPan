import { ref, ComputedRef, Ref, watch } from 'vue';
import { useResizeObserver, useScroll } from '@vueuse/core';
import { throttle } from '@/utils/tool';

type Options = {
  renderCount: number;
  offset: ComputedRef;
  itemHeight: ComputedRef;
  flexItemWidth?: number;
  scrollContainerRef: Ref<HTMLElement>;
  flexContainerRef: Ref<HTMLElement>;
  curMode: Ref<0 | 1>;
};

export default function (options: Options) {
  const {
    renderCount,
    offset,
    itemHeight,
    scrollContainerRef = null,
    flexContainerRef = null,
    flexItemWidth,
    curMode,
  } = options;

  const start = ref(0);
  const end = ref(renderCount);
  const rowCount = ref(1);

  // 计算flex容器行的最大容量
  const computeRowCount = (eleRef) => {
    if (eleRef === null || eleRef.value !== null) return;
    const { stop: stopFn } = useResizeObserver(
      eleRef,
      throttle((entries) => {
        const entry = entries[0];
        const { width } = entry.contentRect;
        rowCount.value = Math.floor(width / flexItemWidth);
      }, 100)
    );
    return stopFn;
  };

  // 要渲染数据的索引
  useScroll(scrollContainerRef, {
    throttle: 100,
    onScroll: (e: Event) => {
      const scollTop = (e.target as HTMLElement).scrollTop;
      const y = scollTop - offset.value >= 0 ? scollTop - offset.value : 0;
      start.value = Math.floor(y / itemHeight.value) * rowCount.value;
      end.value = start.value + renderCount;
    },
  });

  let stopFn = null;
  watch(
    () => curMode.value,
    (mode) => {
      start.value = 0;
      end.value = renderCount;
      if (mode === 1) {
        stopFn = computeRowCount(flexContainerRef);
      } else {
        rowCount.value = 1;
        stopFn && stopFn();
      }
    },
    { immediate: true }
  );

  return {
    start,
    end,
    rowCount,
  };
}
