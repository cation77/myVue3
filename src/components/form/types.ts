export interface IFormItem {
  key: string;
  label: string;
  type: string;
  span?: number;
  value?: any;
  hide?: boolean;
  prop?: {
    placeholder?: string;
    clearable?: boolean;
    disabled?: boolean;
    options?: Array<any>;
    min?: number;
    max?: number;
    step?: number;
    multiple?: boolean;
    showWordLimit?: boolean;
    rows?: number;
    autosize?: boolean;
  };
}
