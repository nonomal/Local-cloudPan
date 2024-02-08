export interface ResponseData {
  code: number;
  message?: string;
}

export interface File {
  id: number;
  name: string;
  isDir: boolean;
  size: number;
  ext: string;
  modified: number;
}
export type formatFile = File & { fileType: string; iconSrc: string };

export interface FileResponseData extends ResponseData {
  data: {
    fileList: Array<File>;
    total: number;
  };
}
