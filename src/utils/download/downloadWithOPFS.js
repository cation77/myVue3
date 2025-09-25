async function downloadWithOPFS(url, filename, chunkSize = 16 * 1024 * 1024) {
  // 1. 检查文件是否支持 Range 请求
  const head = await fetch(url, { method: 'HEAD' });
  const total = head.headers.get('content-length');
  const acceptRanges = head.headers.get('accept-ranges');
  if (!total) throw new Error('missing content-length');
  if (acceptRanges !== 'bytes') throw new Error('no Range support');

  // 2. 准备 OPFS 临时目录
  const root = await navigator.storage.getDirectory();
  const dirName = `tmp-chunks-${Date.now()}`;
  const dir = await root.getDirectoryHandle(dirName, { create: true });

  // 3.  分块下载到 OPFS
  let start = 0,
    part = 0;
  while (start < total) {
    const end = Math.min(start + chunkSize - 1, total - 1);
    const partName = `part-${part}`;
    await retry(async () => {
      const resp = await fetch(url, {
        headers: { Range: `bytes=${start}-${end}` }
      });
      if (resp.status !== 206) {
        throw new Error(`分段响应状态异常: ${resp.status}`);
      }
      const handle = await dir.getFileHandle(partName, { create: true });
      const w = await handle.createWritable({ keepExistingData: false });
      await resp.body.pipeTo(w);
      await w.close();
    }, 3);
    start = end + 1;
    part++;
    console.log(
      `downloaded parts: ${part}, progress: ${((start / total) * 100).toFixed(2)}%`
    );
  }

  // 4. 构造单一 ReadableStream 从 OPFS 分块读取并合并
  let currentIndex = 0;
  const stream = new ReadableStream({
    async pull(controller) {
      if (currentIndex >= part) {
        controller.close();
        return;
      }
      const h = await dir.getFileHandle(`part-${currentIndex}`);
      const file = await h.getFile();
      // 将分块的可读流推进 controller
      // 这里用小工具吧 file.stream() 的 reader 读到 controller
      await pumpStream(file.stream(), controller);
      currentIndex++;
    }
  });

  // 5. 选择保存位置（File System Access）,并将 ReadableStream 写入
  const outHandle = await window.showSaveFilePicker({
    suggestedName: filename
  });

  const out = await outHandle.createWritable();
  await stream.pipeTo(out);
  await out.close();

  // 6. 清理分块
  await cleanupDir(root, dirName);
}
// 工具函数，失败重连
async function retry(fn, times) {
  let lastErr;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
  }
  throw lastErr;
}

// 工具函数，把一个 ReadableStream 的内容送入 controller
async function pumpStream(stream, controller) {
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    controller.enqueue(value);
  }
}

// 工具函数：递归清理临时目录
async function cleanupDir(root, name) {
  try {
    await root.removeEntry(name, { recursive: true });
  } catch (e) {
    console.warn('清理临时目录失败：', e);
  }
}
