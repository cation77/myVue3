import SparkMd5 from 'spark-md5';
interface IWorkerData {
  data: {
    file: Blob;
    chunkSize: number;
  };
}

self.onmessage = (event: IWorkerData) => {
  const { file, chunkSize } = event.data;
  const spark = new SparkMd5.ArrayBuffer();
  const chunks = Math.ceil(file.size / chunkSize);
};
