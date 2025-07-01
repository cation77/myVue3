import { useTemplateRef, type Ref } from 'vue';

type Iaction = 'next' | 'prev';
type IDirection = 'column' | 'row';

const useScroll = (id: string, direction: IDirection = 'column') => {
  const scrollRef = useTemplateRef(id) as Ref<HTMLElement>;

  const scrollX = (cation: Iaction) => {
    const scrollWigdh = scrollRef.value?.scrollWidth;
    const scrollLeft = scrollRef.value?.scrollLeft;
    const client = scrollRef.value?.clientWidth;
    if (cation === 'next') {
      const nextScroll = client + scrollLeft;
      if (nextScroll < scrollWigdh) {
        scrollRef.value?.scrollTo({ top: nextScroll, behavior: 'smooth' });
      }
    } else if (cation === 'prev') {
      const prevScroll = scrollLeft - client;
      if (prevScroll + client > 0) {
        scrollRef.value?.scrollTo({ top: prevScroll, behavior: 'smooth' });
      }
    }
  };

  const scrollY = (cation: Iaction) => {
    const scrollHeight = scrollRef.value?.scrollHeight;
    const scrollTop = scrollRef.value?.scrollTop;
    const clientHeight = scrollRef.value?.clientHeight;
    if (cation === 'next') {
      const nextScrollTop = clientHeight + scrollTop;
      if (nextScrollTop < scrollHeight) {
        scrollRef.value?.scrollTo({ top: nextScrollTop, behavior: 'smooth' });
      }
    } else if (cation === 'prev') {
      const prevScrollTop = scrollTop - clientHeight;
      if (prevScrollTop + clientHeight >= 0) {
        scrollRef.value?.scrollTo({ top: prevScrollTop, behavior: 'smooth' });
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
