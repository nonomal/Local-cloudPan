const fileTypes = {
  picture: ['jpeg', 'jpg', 'jfif', 'png', 'bmp', 'svg', 'gif', 'webp'],
  document: ['pdf', 'txt', 'ppt', 'docx', 'doc', 'xlsx', 'xls', 'md'],
  audio: ['mpeg', 'rm', 'ram', 'swf', 'mp3', 'wma'],
  video: ['mp4', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v', 'mpg'],
  compression: ['7z', 'gzip', 'tar', 'zip', 'rar'],
};

export const formatDateTime = (datetime: number) => {
  const date = new Date(datetime);
  let year = date.getFullYear();
  let month: number | string = date.getMonth() + 1;
  month = month >= 10 ? month : '0' + month;
  let day: number | string = date.getDate();
  day = day >= 10 ? day : '0' + day;
  let hour: number | string = date.getHours();
  hour = hour >= 10 ? hour : '0' + hour;
  let minute: number | string = date.getMinutes();
  minute = minute >= 10 ? minute : '0' + minute;
  let second: number | string = date.getSeconds();
  second = second >= 10 ? second : '0' + second;
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/** 文件大小换算 */
export const formatFileSize = (isDir: boolean, size: number) => {
  if (isDir) return '-';
  const value = Number(size);
  if (size && !isNaN(value)) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
    let index = 0;
    let k = value;
    if (value >= 1024) {
      while (k > 1024) {
        k = k / 1024;
        index++;
      }
    }
    return `${k.toFixed(2)}${units[index]}`;
  }
  return '0B';
};

export const getFileType = (ext: string) => {
  return Object.keys(fileTypes).find((ft) => fileTypes[ft].includes(ext.toLowerCase()));
};

export const getAssetsFile = (url: string) => {
  return new URL(`@/assets/fileType/${url}`, import.meta.url).href;
};
