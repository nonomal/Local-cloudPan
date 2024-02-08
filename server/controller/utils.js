const path = require('path');

exports.generateUrl = function (req, filename, basePath = '/upload') {
  return `${req.origin}${basePath}/${filename}`;
};

/** 目录优先 */
exports.sortByName = function (a, b) {
  return b.isDir - a.isDir || (a.name > b.name ? 1 : -1);
};

/** 大文件在前 */
exports.sortBySize = function (a, b) {
  return b.size - a.size;
};

/** 最近更新在前 */
exports.sortByModified = function (a, b) {
  return b.modified - a.modified;
};
