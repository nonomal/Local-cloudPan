import request from '@/utils/request';
import type { FileResponseData, ResponseData } from './types';

enum API {
  FILELIST = '/filelist',
  DELETE = '/delete',
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

/** 获取文件列表 */
export const delteFile = (path: string = '', filenameList: string[]) => {
  return request.delete<any, ResponseData>(API.DELETE, {
    params: {
      path,
      filenameList,
    },
  });
};
