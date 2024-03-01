import { formatFile } from '@/api/file/types';

export const throttle = (fn, time) => {
  let flag = true;
  return function () {
    if (!flag) return;
    flag = false;
    setTimeout(() => {
      fn.apply(this, arguments);
      flag = true;
    }, time);
  };
};

export const getAssetsFile = (file: formatFile) => {
  const path = file.isDir
    ? `/src/assets/fileType/directory.svg`
    : file.fileType
      ? `/src/assets/fileType/${file.fileType}/${file.ext}.svg`
      : '/src/assets/fileType/others.svg';
  const modules: Record<string, any> = import.meta.glob(`@/assets/fileType/**/*`, {
    eager: true,
  });
  if (modules[path]) return modules[path].default;
  else {
    console.error(path + ',the url is wrong path');
  }
};
