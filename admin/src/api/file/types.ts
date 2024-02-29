export interface ResponseData {
  code: number;
  msg?: string;
}

export interface File {
  id: number;
  name: string;
  isDir: boolean;
  size: number;
  ext: string;
  modified: number;
  fileUrl: string;
  thumbnailUrl: string | undefined;
}
export type formatFile = File & {
  fileType: string;
  iconSrc: string;
  isRename: boolean;
  isCreate?: boolean;
};

export interface FileResponseData extends ResponseData {
  data: {
    fileList: Array<File>;
    total: number;
  };
}
