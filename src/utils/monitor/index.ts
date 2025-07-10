type IConfig = {
  appId: string;
  reportUrl: string;
  maxCache: number;
  reportInterval: number;
  captureError: boolean;
  capturePerformance: boolean;
  captureBehavior: boolean;
};

interface IErrorData {
  type: string;
  timestamp: number;
  appId?: string;
  userAgent?: string;
  pageUrl?: string;
  message?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  reason?: string;
  tagName?: string;
  src?: string;
  // [x: string]: any;
}

type ILevel = 'info' | 'warn' | 'error';

type APIURL = string | URL;

class FrontendMonitor {
  config: IConfig;
  cache: IErrorData[] = [];
  initialized = false;
  defaultConfig: IConfig = {
    appId: 'default-app',
    reportUrl: 'https://api.monitor.example.com/report',
    maxCache: 20,
    reportInterval: 10000,
    captureError: true,
    capturePerformance: true,
    captureBehavior: true
  };
  constructor(config: Partial<IConfig>) {
    this.config = Object.assign(this.defaultConfig, config);
    this.cache = [];
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    // 初始化日志
    this.log('SDK初始化完成');

    if (this.config.captureError) {
      this.setupCaptureError();
    }

    // 设置定时上报
    setInterval(() => this.report(), this.config.reportInterval);

    // 页面关闭前上报
    window.addEventListener('beforeunload', () => {
      this.report(true);
    });
  }

  // 设置错误监控
  setupCaptureError() {
    // 捕获JS运行时错误
    window.addEventListener(
      'error',
      (event) => {
        const { message, filename, lineno, colno, error } = event;
        this.captureError({
          type: 'js_error',
          message,
          filename,
          lineno,
          colno,
          stack: error?.stack || '',
          timestamp: Date.now()
        });
      },
      true
    );

    // 捕获资源加载错误
    window.addEventListener(
      'error',
      (event) => {
        const target = event.target as
          | HTMLImageElement
          | HTMLScriptElement
          | HTMLLinkElement;
        if (
          (target && target.tagName === 'IMG') ||
          target.tagName === 'SCRIPT' ||
          target.tagName === 'LINK'
        ) {
          this.captureError({
            type: 'resource_error',
            tagName: target.tagName,
            src:
              (target as HTMLImageElement | HTMLScriptElement).src ||
              (target as HTMLLinkElement).href,
            timestamp: Date.now()
          });
        }
      },
      true
    );

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      this.captureError({
        type: 'promise_error',
        reason: reason?.message || String(reason),
        stack: reason?.stack || '',
        timestamp: Date.now()
      });
    });

    this.log('错误监控已启用');
  }

  //  获取 FCP
  getFirstContentfulPaint() {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? Math.round(fcpEntry.startTime) : 0;
  }
  // 获取LCP
  getLargestContentfulPaint() {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0
      ? Math.round(lcpEntries[lcpEntries.length - 1].startTime)
      : 0;
  }
  // 获取FID
  getFirstInputDelay() {
    const fidEntries = performance.getEntriesByType('first-input');
    return fidEntries.length > 0
      ? Math.round(
          (
            fidEntries[0] as unknown as {
              processingStart: number;
              startTime: number;
            }
          ).processingStart -
            (
              fidEntries[0] as unknown as {
                processingStart: number;
                startTime: number;
              }
            ).startTime
        )
      : 0;
  }

  // 性能监控
  capturePerformance() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = new PerformanceNavigationTiming();
        const perfData = {
          type: 'performance',
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          request: timing.responseEnd - timing.requestStart,
          response: timing.responseEnd - timing.responseStart,
          dom:
            timing.domComplete -
            timing.domInteractive -
            timing.domContentLoadedEventEnd,
          whiteScreen: timing.domContentLoadedEventStart - timing.fetchStart,
          fcp: this.getFirstContentfulPaint(),
          lcp: this.getLargestContentfulPaint(),
          fid: this.getFirstInputDelay(),
          timestamp: Date.now()
        };

        this.cacheData(perfData);
        this.log(`性能数据收集完成: ${JSON.stringify(perfData)}`);
      }, 0);

      // API请求性能监控
      this.setupAPIMonitoring();
    });
    this.log('性能监控已启用');
  }

  // API请求监控
  setupAPIMonitoring() {
    const originalFetch = window.fetch;
    const that = this;

    window.fetch = function (...args) {
      const startTime = performance.now();
      return originalFetch
        .apply(this, args)
        .then((response) => {
          const endTime = Date.now();
          that.captureAPIPerformance(
            args[0] as APIURL,
            'fetch',
            startTime,
            endTime,
            response.status
          );
          return response;
        })
        .catch((error) => {
          const endTime = Date.now();
          that.captureAPIPerformance(
            args[0] as APIURL,
            'fetch',
            startTime,
            endTime,
            0
          );
          throw error;
        });
    };

    // 重写XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // 扩展XMLHttpRequest以添加自定义属性
    interface CustomXMLHttpRequest extends XMLHttpRequest {
      _startTime?: number;
      _xmlUrl?: APIURL;
      status: number;
      captureAPIPerformance?: (
        url: APIURL,
        type: string,
        startTime: number,
        endTime: number,
        status: number
      ) => void;
    }

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async: boolean = true,
      username: string | null = null,
      password: string | null = null
    ): void {
      const xhr = this as CustomXMLHttpRequest;
      xhr._startTime = Date.now();
      xhr._xmlUrl = url;

      // 保存原始open方法的上下文
      return originalXHROpen.apply(xhr, [
        method,
        url,
        async,
        username,
        password
      ]);
    };

    XMLHttpRequest.prototype.send = function (
      this: CustomXMLHttpRequest,
      ...args
    ): void {
      const xhr = this as CustomXMLHttpRequest;
      const startTime = xhr._startTime || Date.now();
      const originalSend = originalXHRSend;

      // 监听加载事件
      xhr.addEventListener('load', function () {
        const endTime = Date.now();
        const url =
          typeof xhr._xmlUrl === 'string'
            ? xhr._xmlUrl
            : xhr._xmlUrl?.href || '';

        // 调用捕获API性能的方法
        that.captureAPIPerformance(url, 'xhr', startTime, endTime, xhr.status);
      });

      // 保存原始send方法的上下文
      return originalSend.apply(xhr, args);
    };
  }

  // 捕获API性能
  captureAPIPerformance(
    url: APIURL,
    type: string,
    startTime: number,
    endTime: number,
    status: number
  ) {
    const apiData = {
      type: 'api_performance',
      url: typeof url === 'string' ? url : url.href,
      method: type,
      duration: endTime - startTime,
      status,
      timestamp: Date.now()
    };
    this.cacheData(apiData);
  }

  // 捕获错误
  captureError(errorData: Partial<IErrorData>) {
    errorData.appId = this.config.appId;
    errorData.userAgent = navigator.userAgent;
    errorData.pageUrl = window.location.href;

    this.cacheData(errorData as IErrorData);
    this.log(
      `错误捕获: ${errorData.type} - ${errorData.message || errorData.reason}`
    );
  }

  captureEvent(eventType: string, eventData: Partial<IErrorData>) {
    const evnet = {
      type: 'custom_event',
      eventType,
      ...eventData,
      timestamp: Date.now(),
      appId: this.config.appId,
      userAgent: navigator.userAgent,
      pageUrl: window.location.href
    };

    this.cacheData(evnet as IErrorData);
    this.log(`自定义事件: ${eventType} - ${JSON.stringify(eventData)}`);
  }
  // 缓存数据
  cacheData(data: IErrorData) {
    this.cache.push(data);

    if (this.cache.length > this.config.maxCache) {
      this.report();
    }
  }
  // 数据上报
  report(isPageExit = false) {
    if (this.cache.length === 0) return;
    const reportData = [...this.cache];
    this.cache = [];

    // 使用navigator.sendBeacon或XMLHttpRequest上报
    if (isPageExit) {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(reportData)], {
          type: 'application/json'
        });
        navigator.sendBeacon(this.config.reportUrl, blob);
      } else {
        // 回退方案
        this.asyncReport(reportData);
      }
    } else {
      // 非退出时使用异步上报
      this.asyncReport(reportData);
    }
  }

  asyncReport(reportData: IErrorData[]) {
    fetch(this.config.reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });
  }

  log(message: string, level: ILevel = 'info') {
    console[level](message);
  }
}

export default FrontendMonitor;
