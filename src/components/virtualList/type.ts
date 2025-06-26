export type IVirtual = {
  id: number;
  [x: string]: any;
};

export interface IPosInfo {
  // 当前pos对应的元素索引
  index: number;
  // top 和 bottom 数值的参照物是 list
  // 元素顶部所处位置
  top: number;
  // 元素底部所处位置
  bottom: number;
  // 元素高度
  height: number;
  // 自身对比高度差：判断是否需要更新
  dHeight: number;
}
