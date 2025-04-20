const os = require('os');
const { networkInterfaces } = os;

/**
 * 获取本机所有网络接口的IP地址
 * 跳过虚拟网卡和内部接口
 * @returns {Object} 包含IPv4和IPv6地址的对象
 */
function getLocalIPs() {
  const interfaces = networkInterfaces();
  const result = {
    ipv4: [],
    ipv6: [],
  };

  for (const name of Object.keys(interfaces)) {
    // 跳过虚拟网卡和内部接口
    if (name.startsWith('docker') || name.startsWith('veth') || name.startsWith('br-')) {
      continue;
    }

    for (const iface of interfaces[name]) {
      // 跳过回环地址和无效地址
      if (iface.internal || !iface.address) continue;

      // 根据地址族分类
      if (iface.family === 'IPv4' || iface.family === 4) {
        result.ipv4.push({
          address: iface.address,
          interface: name,
        });
      } else if (iface.family === 'IPv6' || iface.family === 6) {
        result.ipv6.push({
          address: iface.address,
          interface: name,
        });
      }
    }
  }

  return result;
}

/**
 * 获取首选IP地址
 * @param {string} [preferredInterface] - 首选网络接口名称
 * @returns {Object} 包含首选IPv4和IPv6地址的对象
 */
function getPreferredIP(preferredInterface) {
  const ips = getLocalIPs();
  const result = {
    ipv4: null,
    ipv6: null,
  };

  // 如果有指定首选接口，优先使用该接口的IP
  if (preferredInterface) {
    const preferredIPv4 = ips.ipv4.find((ip) => ip.interface === preferredInterface);
    const preferredIPv6 = ips.ipv6.find((ip) => ip.interface === preferredInterface);

    if (preferredIPv4) result.ipv4 = preferredIPv4.address;
    if (preferredIPv6) result.ipv6 = preferredIPv6.address;
  }

  // 如果没有找到指定接口的IP或未指定接口，使用第一个可用的IP
  if (!result.ipv4 && ips.ipv4.length > 0) {
    result.ipv4 = ips.ipv4[0].address;
  }
  if (!result.ipv6 && ips.ipv6.length > 0) {
    result.ipv6 = ips.ipv6[0].address;
  }

  return result;
}

/**
 * 获取当前可用的网络接口列表
 * @returns {Array} 网络接口列表
 */
function getNetworkInterfaces() {
  const interfaces = networkInterfaces();
  const result = [];

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    // 跳过没有IP地址的接口
    if (iface.some((addr) => !addr.internal)) {
      result.push(name);
    }
  }

  return result;
}

// 导出相关函数
module.exports = {
  getLocalIPs,
  getPreferredIP,
  getNetworkInterfaces,
};
