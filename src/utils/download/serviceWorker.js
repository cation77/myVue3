/**
 * 下载超大文件：分段获取 + 流式写入 + 流式保存
 * 方案二：Service Worker 拦截 + StreamSaver.js（兼容更广，无需 File System Access）
 * 利用 WritableStream 把响应管道到一个下载流，让浏览器原生下载管理器接管，不需要把所有数据合成一个 Blob
 */

async function downloadViaOPFSStreaming(
  url,
  filename,
  chunkSize = 16 * 1024 * 1024
) {
  // 把每个分块单独写入 OPFS 文件，然后再顺序读出，pipe 到下载流
  const head = await fetch(url, { method: 'HEAD' });
  const total = head.headers.get('content-length');
  if (!total) throw new Error('missing content-length');
  if (head.headers.get('accept-ranges') !== 'bytes')
    throw new Error('no Range support');

  // 临时目录
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle('tmp-chunks', { create: true });
  // 分块下载到 OPFS
  let start = 0;
  let part = 0;
  while (start < total) {
    const end = Math.min(start + chunkSize - 1, total - 1);
    const resp = await fetch(url, {
      headers: { Range: `bytes=${start}-${end}` }
    });
    if (!resp.ok && resp.status !== 206) {
      throw new Error(`分段响应状态异常: ${resp.status}`);
    }
    const handle = await dir.getFileHandle(`part-${part}`, { create: true });
    const w = await handle.createWritable({ keepExistingData: false });
    // 直接流式落盘
    await resp.body.pipeTo(w);
    await w.close();
    start = end + 1;
    part++;
  }
  // 将所有分块按顺序读出并流式触发下载（无需拼成巨大 Blob）
  // 使用 StreamSaver 或 File System Access 保存
  // 例：使用 File System Access
  const outHandle = await window.showSaveFilePicker({
    suggestedName: filename
  });
  const out = await outHandle.createWritable();
  for (let i = 0; i < part; i++) {
    const h = await dir.getFileHandle(`part-${i}`);
    const file = await h.getFile();
    // 以流方式复制
    await file.stream().pipeTo(out, { preventClose: true });
  }
  await out.close();

  // 清理分块
  for (let i = 0; i < part; i++) {
    await dir.removeEntry(`part-${i}`);
  }
}
