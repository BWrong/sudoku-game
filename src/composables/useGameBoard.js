/**
 * 游戏面板管理
 * @file useGameBoard.js
 */
import { ref, computed } from 'vue';

/**
 * 游戏面板管理
 * @returns {Object} 游戏面板相关状态和方法
 */
export function useGameBoard() {
  /**
   * 创建初始数独面板
   * @returns {Array<Array<Object>>} 9x9数独面板
   */
  const createEmptyBoard = () => {
    return Array(9).fill().map(() =>
      Array(9).fill().map(() => ({
        value: null,
        isUserInput: false,
        isSolution: false,
        isUserAnswer: false
      }))
    );
  };

  // 数独游戏面板
  const board = ref(createEmptyBoard());

  // 是否已解决
  const isSolved = ref(false);

  // 是否显示解决方案
  const showSolution = ref(false);

  /**
   * 初始化数独面板
   */
  const initializeBoard = (initialBoard = null) => {
    if (initialBoard) {
      // 使用给定的初始棋盘数据
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          board.value[i][j] = { ...initialBoard[i][j] };
        }
      }
    } else {
      // 重置棋盘
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          board.value[i][j] = {
            value: null,
            isUserInput: false,
            isUserAnswer: false,
            isSolution: false
          };
        }
      }
    }

    // 重置解题状态
    isSolved.value = false;
    showSolution.value = false;
  };

  /**
   * 验证用户输入
   * @param {Event} event - 输入事件
   * @param {number} row - 行索引
   * @param {number} col - 列索引
   * @param {string} gameMode - 游戏模式
   */
  const validateInput = (event, row, col, gameMode) => {
    const cell = board.value[row][col];
    const value = event.target.value;

    // 如果输入为空，清除当前单元格
    if (!value) {
      cell.value = null;
      return;
    }

    // 只允许输入1-9
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 9) {
      event.target.value = cell.value || '';
      return;
    }

    cell.value = num;

    // 设置单元格状态
    if (gameMode === 'create') {
      cell.isUserInput = true;
      cell.isUserAnswer = false;
    } else if (gameMode === 'solve') {
      cell.isUserAnswer = true;
      cell.isUserInput = false;
    }
  };

  /**
   * 清空数独面板（全部清空）
   */
  const clearBoard = () => {
    initializeBoard();
  };

  /**
   * 清除解答
   */
  const clearSolution = () => {
    // 将isSolution标记为true的单元格值清空，同时清除用户输入的答案
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board.value[i][j].isSolution || board.value[i][j].isUserAnswer) {
          board.value[i][j].value = null;
          board.value[i][j].isSolution = false;
          board.value[i][j].isUserAnswer = false;
        }
      }
    }

    // 重置状态
    showSolution.value = false;
    isSolved.value = false;
  };

  return {
    board,
    isSolved,
    showSolution,
    initializeBoard,
    validateInput,
    clearBoard,
    clearSolution
  };
}