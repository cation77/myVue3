/**
 * 下载超大文件：分段获取 + 流式写入 + 流式保存
 * 方案一：ReadableStream + File System Access API（OPFS 持久存储）+ 分块 Range 请求
 * 用 Range 请求分块拉取（例如每块 8MB~64MB，按网络和内存调整）
 * 将每个响应的 body 作为 ReadableStream，直接写入 OPFS 的可写句柄（或原生文件句柄）
 * 全部写完后，使用文件句柄触发保存到用户磁盘（或直接保存在 OPFS 中让用户手动导出）
 *
 * 需要支持 Range 的服务器
 */

async function downloadLargeFile(url, filename, chunkSize = 16 * 1024 * 1024) {
  // 1. 获取文件总长度（通过 HEAD 或第一次请求）
  const head = await fetch(url, { method: 'HEAD' });
  const total = Number(head.headers.get('Content-Length'));
  const acceptRanges = head.headers.get('accept-ranges') === 'bytes';

  if (!total || !acceptRanges) {
    throw new Error('服务器未提供 content-length 或不支持 Range 分段下载');
  }

  // 2. 让用户选择保存位置（File System Access API）
  // [实验性方法 showSaveFilePicker() 方法](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/showSaveFilePicker)
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: filename,
    types: [{ description: 'Any', accept: { '*/*': ['.*'] } }]
  });
  const writable = await fileHandle.createWritable();

  try {
    let start = 0;
    while (start < total) {
      const end = Math.min(start + chunkSize - 1, total - 1);
      const resp = fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
      if (!resp.ok && resp.status !== 206) {
        throw new Error(`分段响应状态异常: ${resp.status}`);
      }
      // 3. 把二进制流写入文件，不进入内存缓存
      // resp.body 是 ReadableStream<Uint8Array>
      const reader = (await resp).body.getReader();
      let received = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        received += value.byteLength;
        await writable.write(value);
      }
      start = end + 1;
      // 可选：进度回调
      console.log(`progress: ${((start / total) * 100).toFixed(2)}%`);
    }
  } catch (err) {
    console.error('下载失败', err);
    throw err;
  } finally {
    await writable.close();
  }
  console.log('下载完成');
}
