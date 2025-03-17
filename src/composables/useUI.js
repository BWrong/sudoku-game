/**
 * UI相关功能
 * @file useUI.js
 */

/**
 * UI相关功能
 * @returns {Object} UI相关方法
 */
export function useUI() {
  /**
   * 添加移动端触摸事件支持
   */
  const addTouchSupport = () => {
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // 调整视口
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      }
    }
  };

  /**
   * 获取随机的五彩纸屑样式
   * @param {number} index - 索引
   * @returns {Object} 样式对象
   */
  const getConfettiStyle = (index) => {
    const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#673ab7'];
    const size = Math.floor(Math.random() * 10) + 5;
    const left = Math.floor(Math.random() * 100);
    const animationDuration = Math.floor(Math.random() * 3) + 2;
    const animationDelay = Math.random() * 2;

    return {
      '--size': `${size}px`,
      '--left': `${left}%`,
      '--color': colors[index % colors.length],
      '--animation-duration': `${animationDuration}s`,
      '--animation-delay': `${animationDelay}s`
    };
  };

  /**
   * 格式化日期
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的日期字符串
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return {
    addTouchSupport,
    getConfettiStyle,
    formatDate
  };
}