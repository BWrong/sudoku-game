/**
 * 单元格高亮管理
 * @file useHighlight.js
 */
import { ref } from 'vue';

/**
 * 单元格高亮管理
 * @returns {Object} 高亮相关状态和方法
 */
export function useHighlight() {
  // 当前高亮的单元格
  const highlightedCell = ref(null);

  /**
   * 高亮单元格
   * @param {number} row - 行索引
   * @param {number} col - 列索引
   */
  const highlightCell = (row, col) => {
    highlightedCell.value = { row, col };
  };

  /**
   * 清除高亮
   */
  const clearHighlight = () => {
    highlightedCell.value = null;
  };

  return {
    highlightedCell,
    highlightCell,
    clearHighlight
  };
}