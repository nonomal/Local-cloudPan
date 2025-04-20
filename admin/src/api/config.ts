import request from '@/utils/request';

/**
 * 获取服务器配置
 * @returns Promise<{ allowAnonymous: boolean, [key: string]: any }>
 */
export function getConfig(): Promise<{ allowAnonymous: boolean; [key: string]: any }> {
  return request.get('/config');
}
