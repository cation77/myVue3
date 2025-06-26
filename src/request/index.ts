import axios, { AxiosError } from 'axios';
import { useDebounceFn } from '@vueuse/core';
import { message } from 'ant-design-vue';
import { storage } from '@/utils/storage';
import { addRequest, refreshToken } from './refresh';
import type {
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig
} from 'axios';
import type { RequestResolve, ResponseResult } from './type';

const errorMsg = '服务异常，请稍后再试';

const debounceMessage = useDebounceFn((msg: string) => {
  message.error(msg);
}, 100);

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 3000, // 超时
  timeoutErrorMessage: '请求超时，请稍后再试',
  withCredentials: true, // 异步请求携带cookie
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
});

const requestToken = (
  resolve: RequestResolve,
  config: InternalAxiosRequestConfig<any>
) => {
  storage.remove('accessToken');
  addRequest(() => {
    resolve(request(config));
  });
  refreshToken();
};

// 请求拦截
request.interceptors.request.use(
  async (config) => {
    const token = storage.get('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截
request.interceptors.response.use(
  (response) => {
    return new Promise((resolve, reject) => {
      const { data, config } = response;
      if (!data) {
        debounceMessage(errorMsg);
        return reject(errorMsg);
      }
      const contentType = response.headers['content-type'];
      // 处理二进制数据
      if (contentType) {
        // 判断是否为二进制数据
        if (
          contentType.includes(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) ||
          contentType.includes('application/octet-stream') ||
          contentType.includes('image/') ||
          contentType.includes('video/') ||
          contentType.includes('audio/')
        ) {
          // 返回原始数据
          return resolve(data);
        }
      }
      if (data.code === 401) {
        // 状态为 401 需刷新 token 重新请求
        requestToken(resolve, config);
      } else if (data.code !== 200) {
        // 接口异常，错误提示
        debounceMessage(data?.message || errorMsg);
        return resolve(data);
      } else {
        return resolve(data);
      }
    });
  },
  (error) => {
    const { message, response } = error;
    if (response?.status === 401) {
      // 状态为 401 需刷新 token 重新请求
      storage.remove('accessToken');
      if (response.config.url !== '/refreshToken') {
        return requestToken(Promise.resolve, response.config);
      } else {
        // 跳转登录页
        window.location.href = '/login';
      }
    }
    debounceMessage(message || errorMsg);
    return Promise.reject(message);
  }
);

export function post<T = ResponseResult>(
  url: string,
  data?: any,
  options?: AxiosRequestConfig
): Promise<T> {
  return request.post(url, data, options);
}

export function get<T = ResponseResult>(
  url: string,
  params?: any,
  headers?: AxiosHeaders
): Promise<T> {
  return request.get(url, { params, headers });
}

export default request;
