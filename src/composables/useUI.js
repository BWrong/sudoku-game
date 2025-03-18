/**
 * UI相关逻辑
 * @module useUI
 */
import { onMounted } from 'vue';

/**
 * UI逻辑Hook
 * @returns {Object} 返回UI相关方法
 */
export function useUI() {
  /**
   * 为数独棋盘添加触摸支持
   */
  const addTouchSupport = () => {
    const onTouchStart = (e) => {
      // 阻止长按弹出上下文菜单
      e.preventDefault();
    };

    // 添加触摸事件监听器
    document.addEventListener('touchstart', onTouchStart, { passive: false });

    // 返回清理函数
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
    };
  };

  /**
   * 格式化日期显示
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的日期字符串
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 今天
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // 七天内
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // 更早
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  /**
   * 生成庆祝动画的样式
   * @param {number} index - 粒子索引
   * @returns {Object} CSS样式对象
   */
  const getConfettiStyle = (index) => {
    const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];
    const size = 5 + Math.random() * 10 + 'px';

    return {
      '--size': size,
      '--left': Math.random() * 100 + '%',
      '--color': colors[Math.floor(Math.random() * colors.length)],
      '--animation-duration': (3 + Math.random() * 2) + 's',
      '--animation-delay': (Math.random() * 0.5) + 's',
    };
  };

  return {
    addTouchSupport,
    formatDate,
    getConfettiStyle
  };
}