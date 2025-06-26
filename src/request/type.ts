import type { AxiosResponse } from 'axios';
export type RequestResolve = (
  value: AxiosResponse<any, any> | PromiseLike<AxiosResponse<any, any>>
) => void;

export interface ResponseResult {
  code: number;
  result: any;
  message: any;
  [x: string | symbol]: any;
}
