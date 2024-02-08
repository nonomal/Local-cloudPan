import axios from 'axios';
import { ElMessage } from 'element-plus';
// import useUserStore from '@/store/modules/user'

let request = axios.create({
  baseURL: './api',
  timeout: 5000,
});
// 请求拦截器
request.interceptors.request.use((config) => {
  // 仓库中存在token时，发请求时设置token字段的请求头
  // const userStore = useUserStore()
  // if (userStore.token) {
  //   config.headers.token = userStore.token
  // }
  return config;
});
// 响应拦截器
request.interceptors.response.use(
  (response) => {
    //成功回调
    return response.data;
  },
  (error) => {
    let msg = '';
    let status = error.response.status;
    switch (status) {
      case 401:
        msg = 'TOKEN过期';
        break;
      case 403:
        msg = '无权访问';
        break;
      case 404:
        msg = '请求地址错误';
        break;
      case 500:
        msg = '服务器出现问题';
        break;
      default:
        msg = '网络出现问题';
        break;
    }
    ElMessage({
      type: 'error',
      message: msg,
    });
    return Promise.reject(error);
  }
);

export default request;
