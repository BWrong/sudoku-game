/**
 * 单元格高亮逻辑
 * @module useHighlight
 */
import { ref } from 'vue';

/**
 * 高亮逻辑Hook
 * @returns {Object} 返回高亮状态和方法
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
    console.log('清除高亮');
    highlightedCell.value = null;
  };

  return {
    highlightedCell,
    highlightCell,
    clearHighlight
  };
}