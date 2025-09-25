// 下载超大文件 StreamSaver.js（兼容更广，无需 File System Access）
async function downloadLargeFile(
  url,
  filename,
  chunkSize = 16 * 1024 * 1024,
  dbName = 'largeDb',
  storeName = 'chunks'
) {
  // 检测服务器支持 Range
  const head = await fetch(url, { method: 'HEAD' });
  const total = head.headers.get('content-length');
  if (!total) throw new Error('missing content-length');
  if (head.headers.get('accept-ranges') !== 'bytes')
    throw new Error('no Range support');

  // 打开、初始化 IndexedDB
  const db = await openDB(dbName, storeName);
  await clearStore(db, storeName);

  // 分块下载（fetch + Range），每块写入 IndexedDB
  let start = 0,
    part = 0;
  while (start < total) {
    const end = Math.min(start + chunkSize - 1, total - 1);
    await retry(async () => {
      const resp = await fetch(url, {
        headers: { Range: `bytes=${start}-${end}` }
      });
      if (!resp.ok && resp.status !== 206) {
        throw new Error(`分段响应状态异常: ${resp.status}`);
      }
      // 仅为该块分配内存
      const buf = await resp.arrayBuffer();
      await putChunk(db, storeName, part, buf);
    }, 3);
    start = end + 1;
    part++;
    console.log(`downloaded parts: ${part}/${Math.ceil(total / chunkSize)}`);
  }

  // 构造单一 ReadableStream：顺序从 IndexedDB 读块并 enqueue
  let index = 0;
  const stream = new ReadableStream({
    async pull(controller) {
      if (index >= part) {
        controller.close();
        return;
      }
      const buf = await getChunk(db, storeName, index);
      controller.enqueue(new ArrayBuffer(buf));
      // 读完可删，释放空间
      await deleteChunk(db, storeName, index);
      index++;
    }
  });

  // 用 StreamSaver 创建写流，pipeTo 完成浏览器原生下载
  const fileStream = streamSaver.createWriteStream(filename, { size: total });
  // pipeTo 返回 Promise，直到写入完成
  await stream.pipeTo(fileStream);

  // 清理数据库连接
  db.close();
  console.log('下载完成');
}

// 工具函数
function openDB(name, store) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (db.objectStoreNames.contains(store)) {
        db.deleteObjectStore(store);
      }
      db.createObjectStore(store);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function clearStore(db, store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function putChunk(db, store, key, buf) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(buf, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function getChunk(db, store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function deleteChunk(db, store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function retry(fn, times) {
  let lastErr;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
    }
    await new Promise((resolve) => setTimeout(resolve, (i + 1) * 1000));
  }
  throw lastErr;
}
