import type { CSSProperties } from 'vue';

export interface IFlowCard {
  id: number | string;
  width: number;
  height: number;
  [x: string]: any;
}

export interface IRenderItem {
  item: IFlowCard;
  y: number;
  h: number;
  style: CSSProperties;
}

export interface IColumnQueue {
  list: IRenderItem[];
  height: number;
}

export interface IItemRect {
  width: number;
  height: number;
}

export interface ICardRect {
  width: number;
  height: number;
  imageHeight: number;
}

export interface IRenderCard {
  item: IFlowCard;
  y: number;
  h: number;
  imageHeight: number;
  style: CSSProperties;
}

export interface IColumnQueue {
  list: IRenderCard[];
  height: number;
}
