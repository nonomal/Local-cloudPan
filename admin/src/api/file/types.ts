export interface ResponseData {
  code: number;
  msg?: string;
}

export interface File {
  id: number;
  name: string;
  isDir: boolean;
  size: number | string;
  ext: string;
  modified: number | string;
  filePath: string;
  thumbnailPath: string | undefined;
}
export type formatFile = File & {
  fileType: string;
  isRename: boolean;
  isCreate?: boolean;
};

export interface FileResponseData extends ResponseData {
  data: {
    fileList: Array<File>;
    total: number;
  };
}
