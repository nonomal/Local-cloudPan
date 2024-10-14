import request from '@/utils/request';
import type { FileResponseData, ResponseData } from './types';

enum API {
  FILELIST = '/filelist',
  RENAME = '/rename',
  CREATEDIR = '/createDir',
  MOVEORCOPY = '/fileMoveOrCopy',
  DELETE = '/delete',
  CHECKFILE = '/checkFileList',
}

/** 获取文件列表 */
export const reqFileList = (path: string = '', sortMode: 'name' | 'size' | 'modified' = 'name') => {
  return request.get<any, FileResponseData>(API.FILELIST, {
    params: {
      path,
      sortMode,
    },
  });
};

/** 重命名选中文件 */
export const renameFile = (path: string = '', oldName: string, newName: string) => {
  return request.post<any, ResponseData>(API.RENAME, {
    path,
    oldName,
    newName,
  });
};

/** 创建文件夹 */
export const createDir = (path: string = '', dirName: string) => {
  return request.post<any, ResponseData>(API.CREATEDIR, {
    path,
    dirName,
  });
};

/** 移动或者复制选中文件 */
export const moveOrCopyFile = (
  path: string = '',
  fileList: string[],
  destination: string,
  dtype: 'move' | 'copy'
) => {
  return request.post<any, ResponseData>(API.MOVEORCOPY, {
    path,
    fileList,
    destination,
    dtype,
  });
};

/** 删除选中文件 */
export const delteFile = (path: string = '', filenameList: string[]) => {
  return request.delete<any, ResponseData>(API.DELETE, {
    params: {
      path,
      filenameList,
    },
  });
};

export const checkFile = (path: string = '', filenameList: string[]) => {
  return request.get<any, ResponseData>(API.CHECKFILE, {
    params: {
      path,
      filenameList,
    },
  });
};
