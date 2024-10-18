export interface UploadFileItem {
  name: string;
  size: string;
  status: number;
  percent: number;
  fileId: string;
}
interface chunk {
  index: number;
  chunkId: string;
  blob: Blob;
}
export interface workerResult {
  fileName: string;
  fileId: string;
  chunks: chunk[];
}
