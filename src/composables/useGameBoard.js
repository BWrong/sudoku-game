/**
 * 游戏面板管理
 * @file useGameBoard.js
 */
import { ref, reactive } from 'vue';

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
        value: '',
        isUserInput: false,
        isSolution: false,
        isUserAnswer: false
      }))
    );
  };

  // 数独游戏面板
  const board = reactive(createEmptyBoard());

  // 是否已解决
  const isSolved = ref(false);

  // 是否显示解决方案
  const showSolution = ref(false);

  /**
   * 初始化数独面板
   */
  const initializeBoard = () => {
    // 更新每个单元格的值
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        board[i][j].value = '';
        board[i][j].isUserInput = false;
        board[i][j].isSolution = false;
        board[i][j].isUserAnswer = false;
      }
    }

    showSolution.value = false;
    isSolved.value = false;
  };

  /**
   * 验证用户输入
   * @param {Event} event - 输入事件
   * @param {number} row - 行索引
   * @param {number} col - 列索引
   * @param {string} gameMode - 游戏模式
   */
  const validateInput = (event, row, col, gameMode) => {
    const value = event.target.value;

    // 只允许输入1-9的数字
    if (value && !/^[1-9]$/.test(value)) {
      board[row][col].value = '';
      return;
    }

    if (value) {
      if (gameMode === 'create') {
        board[row][col].isUserInput = true;
        board[row][col].isUserAnswer = false;
      } else if (gameMode === 'solve') {
        board[row][col].isUserInput = false;
        board[row][col].isUserAnswer = true;
      }
    } else {
      board[row][col].isUserInput = false;
      board[row][col].isUserAnswer = false;
    }
  };

  /**
   * 清空数独面板（全部清空）
   */
  const clearBoard = () => {
    initializeBoard();
  };

  /**
   * 清空答案（保留题目）
   */
  const clearSolution = () => {
    // 保留用户输入的题目，清除解答
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!board[i][j].isUserInput) {
          board[i][j].value = '';
          board[i][j].isSolution = false;
          board[i][j].isUserAnswer = false;
        }
      }
    }
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