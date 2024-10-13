import { ref, ComputedRef, Ref, watch, computed } from 'vue';
import { useScroll, useElementSize } from '@vueuse/core';

type Options = {
  itemHeight: ComputedRef;
  flexItemWidth: number;
  scrollContainerRef: Ref<HTMLElement | null>;
  wrapper: Ref<HTMLElement | null>;
  curMode: Ref<0 | 1>;
  overscan?: number;
};

export default function (data: Ref, options: Options) {
  const { itemHeight, scrollContainerRef, flexItemWidth, curMode, overscan = 2, wrapper } = options;

  const start = ref(0);
  const end = ref(10);
  const { width, height } = useElementSize(scrollContainerRef);
  // 每一行的最大容量
  const rowCount = computed(() =>
    curMode.value === 0 ? 1 : Math.floor(width.value / flexItemWidth)
  );
  const currentList = ref([]);
  const totalHeight = computed(
    () => Math.ceil(data.value.length / rowCount.value) * itemHeight.value
  );
  const offsetTop = computed(() => Math.floor(start.value / rowCount.value) * itemHeight.value);

  // 计算开始结束索引及当前应该渲染的列表
  function calculateRange() {
    const element = scrollContainerRef.value;
    if (element) {
      const offset = Math.floor(element.scrollTop / itemHeight.value) * rowCount.value;
      const viewCapacity = Math.ceil(height.value / itemHeight.value) * rowCount.value;

      const from = offset - overscan * rowCount.value;
      const to = offset + viewCapacity + overscan * rowCount.value;
      start.value = from < 0 ? 0 : from;
      end.value = to > data.value.length ? data.value.length : to;
      currentList.value = data.value.slice(start.value, end.value);
      // 处理数据为空时的情况
      const curHeight = data.value.length === 0 ? 350 : totalHeight.value - offsetTop.value;
      Object.assign(wrapper.value.style, {
        width: '100%',
        height: `${curHeight}px`,
        marginTop: `${offsetTop.value}px`,
      });
    }
  }

  useScroll(scrollContainerRef, { throttle: 200, onScroll: calculateRange });
  watch([width, height, data, () => data.value.length], calculateRange, { flush: 'post' });

  return {
    list: currentList,
  };
}
