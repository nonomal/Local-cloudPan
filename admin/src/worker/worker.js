import SparkMD5 from 'spark-md5';

/**
 * 创建文件分片
 * @param {File} file
 * @param {Number} index
 * @param {Number} chunksize
 * @returns {Promise<{start: number, end: number, index: number, hash: string, arrayBuffer: ArrayBuffer}>}
 */
function createChunk(file, index, chunksize) {
  return new Promise((resolve) => {
    const start = index * chunksize;
    const end = Math.min(start + chunksize, file.size); // 防止超出文件大小
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const hash = SparkMD5.ArrayBuffer.hash(e.target.result);
      resolve({ index, chunkId: hash, blob });
    };
    const blob = file.slice(start, end);
    fileReader.readAsArrayBuffer(blob);
  });
}

/**
 * 处理文件分块及哈希计算
 * @param {File} file
 * @param {Number} chunksize
 * @param {Number} start
 * @param {Number} end
 * @returns {Promise<Array>}
 */
async function processChunks(file, chunksize, start, end) {
  const chunks = [];
  for (let i = start; i < end; i++) {
    chunks.push(createChunk(file, i, chunksize));
  }
  return await Promise.all(chunks);
}

const BATCH_SIZE = 10;
onmessage = async ({ data }) => {
  const { file, chunksize, start, end } = data;
  let currentIndex = start;
  const result = [];

  while (currentIndex < end) {
    const batchEnd = Math.min(currentIndex + BATCH_SIZE, end);
    const chunks = await processChunks(file, chunksize, currentIndex, batchEnd);
    result.push(...chunks);
    currentIndex = batchEnd;
  }
  postMessage(result);
};
