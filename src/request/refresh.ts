import { storage } from '@/utils/storage';
let isRefresh = false;
let reRequestQueue: any[] = [];

export const getToken = () => {
  return Promise.resolve('');
};

/*把过期请求添加在数组中*/
export const addRequest = (request: any) => {
  reRequestQueue.push(request);
};

/*调用过期请求*/
export const refreshToken = () => {
  console.log('获取 token 并重新请求上次中断的数据');
  if (!isRefresh) {
    isRefresh = true;
    getToken()
      .then((token) => {
        if (token) {
          storage.set('accessToken', token);
          reRequestQueue.forEach((request) => request());
          reRequestQueue = [];
        }
      })
      .finally(() => {
        isRefresh = false;
      });
  }
};
