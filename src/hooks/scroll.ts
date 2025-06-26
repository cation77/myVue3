import type { Ref } from 'vue';

type Iaction = 'next' | 'prev';
type IDirection = 'column' | 'row';

const useScroll = (el: Ref, direction: IDirection = 'column') => {
  const scrollX = (cation: Iaction) => {
    const scrollWigdh = el.value?.scrollWidth;
    const scrollLeft = el.value?.scrollLeft;
    const client = el.value?.clientWidth;
    if (cation === 'next') {
      const nextScroll = client + scrollLeft;
      if (nextScroll < scrollWigdh) {
        el.value?.scrollTo({ top: nextScroll, behavior: 'smooth' });
      }
    } else if (cation === 'prev') {
      const prevScroll = scrollLeft - client;
      if (prevScroll + client > 0) {
        el.value?.scrollTo({ top: prevScroll, behavior: 'smooth' });
      }
    }
  };

  const scrollY = (cation: Iaction) => {
    const scrollHeight = el.value?.scrollHeight;
    const scrollTop = el.value?.scrollTop;
    const clientHeight = el.value?.clientHeight;
    if (cation === 'next') {
      const nextScrollTop = clientHeight + scrollTop;
      if (nextScrollTop < scrollHeight) {
        el.value?.scrollTo({ top: nextScrollTop, behavior: 'smooth' });
      }
    } else if (cation === 'prev') {
      const prevScrollTop = scrollTop - clientHeight;
      if (prevScrollTop + clientHeight >= 0) {
        el.value?.scrollTo({ top: prevScrollTop, behavior: 'smooth' });
      }
    }
  };

  const next = () => {
    direction === 'column' ? scrollY('next') : scrollX('next');
  };

  const prev = () => {
    direction === 'column' ? scrollY('prev') : scrollX('prev');
  };

  return { next, prev };
};

export default useScroll;
