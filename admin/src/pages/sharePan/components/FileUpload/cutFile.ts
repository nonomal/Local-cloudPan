import SparkMD5 from 'spark-md5';

const THREAD_COUNT = navigator.hardwareConcurrency || 4; // worker数
export async function cutFile(file, chunksize = 1024 * 1024 * 10) {
  return new Promise((resolve) => {
    const chunkCount = Math.ceil(file.size / chunksize);
    const threadchunkCount = Math.ceil(chunkCount / THREAD_COUNT); // 每个线程处理的chunk数量
    const result = [];
    let finishCount = 0;
    const workerCount = Math.min(THREAD_COUNT, chunkCount);
    for (let i = 0; i < workerCount; i++) {
      //分配线程任务
      const worker = new Worker(new URL('@/worker/worker.js', import.meta.url), {
        type: 'module',
      });
      const start = i * threadchunkCount;
      let end = (i + 1) * threadchunkCount;
      if (end > chunkCount) {
        end = chunkCount;
      }
      worker.postMessage({ file, start, end, chunksize });
      worker.onmessage = ({ data }) => {
        result[i] = data;
        worker.terminate();
        finishCount++;
        if (finishCount === workerCount) {
          const chunks = result.flat();
          const spark = new SparkMD5();
          chunks.forEach((chunk) => {
            spark.append(chunk.chunkId);
          });
          const hash = spark.end();
          resolve({ fileName: file.name, fileId: hash, chunks });
        }
      };
    }
  });
}
