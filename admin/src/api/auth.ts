import request from '@/utils/request';

/**
 * 验证访问密码
 * @param password 密码
 * @returns Promise<{ success: boolean, token?: string, message?: string }>
 */
export function verifyPassword(
  password: string
): Promise<{ success: boolean; token?: string; message?: string }> {
  return request.post('/auth/verify', { password });
}

/**
 * 检查认证状态
 * @returns Promise
 */
export function checkAuth() {
  return request.get('/auth/check');
}
