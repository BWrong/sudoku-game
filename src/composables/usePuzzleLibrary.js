/**
 * 数独题库管理
 * @file usePuzzleLibrary.js
 */
import { ref, onMounted } from 'vue';
import { useUI } from './useUI';

/**
 * 数独题库管理
 * @param {Ref<Array>} board - 数独面板的ref
 * @param {Ref<boolean>} hasPuzzle - 是否有题目的ref
 * @returns {Object} 题库相关状态和方法
 */
export function usePuzzleLibrary(board, hasPuzzle) {
  // 题库中的数独题目列表
  const puzzleLibrary = ref([]);

  // 导入UI工具
  const { formatDate } = useUI();

  /**
   * 将题库列表存储到localStorage
   */
  const savePuzzlesToStorage = () => {
    try {
      localStorage.setItem('sudoku-puzzles', JSON.stringify(puzzleLibrary.value));
    } catch (e) {
      console.error('保存题目到localStorage失败:', e);
    }
  };

  /**
   * 从localStorage加载题库列表
   */
  const loadPuzzlesFromStorage = () => {
    try {
      const savedData = localStorage.getItem('sudoku-puzzles');
      if (savedData) {
        puzzleLibrary.value = JSON.parse(savedData);
      }
    } catch (e) {
      console.error('从localStorage加载题目失败:', e);
      puzzleLibrary.value = [];
    }
  };

  /**
   * 检查题目是否重复
   * @param {Array<Array<Object>>} newBoard - 新题目的数独面板
   * @returns {boolean} 是否重复
   */
  const isDuplicatePuzzle = (newBoard) => {
    // 遍历题库中的所有题目
    for (const puzzle of puzzleLibrary.value) {
      let isDuplicate = true;

      // 比较每个单元格的值和位置
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const existingValue = puzzle.board[row][col].value;
          const newValue = newBoard[row][col].isUserInput ? newBoard[row][col].value : '';

          // 如果任何单元格不同，则不是重复题目
          if (existingValue !== newValue) {
            isDuplicate = false;
            break;
          }
        }
        if (!isDuplicate) break;
      }

      // 如果所有单元格都相同，则是重复题目
      if (isDuplicate) {
        return true;
      }
    }

    return false;
  };

  /**
   * 获取难度文本
   * @param {number} difficulty - 难度等级
   * @returns {string} 难度文本
   */
  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 1: return '简单';
      case 2: return '中等';
      case 3: return '困难';
      case 4: return '专家';
      default: return '未知';
    }
  };

  /**
   * 将当前题目添加到题库
   * @param {number} difficulty - 题目难度
   */
  const addPuzzleToLibrary = (difficulty = 2) => {
    // 深拷贝当前棋盘
    const puzzleCopy = JSON.parse(JSON.stringify(board.value));

    // 添加题目到题库
    const puzzle = {
      board: puzzleCopy,
      difficulty: difficulty,
      timestamp: Date.now()
    };

    puzzleLibrary.value.push(puzzle);

    // 保存到本地存储
    localStorage.setItem('sudoku-puzzles', JSON.stringify(puzzleLibrary.value));
  };

  /**
   * 从题库加载指定的题目
   * @param {number} index - 题目索引，不传则只加载题库
   */
  const loadPuzzleFromLibrary = (index = -1) => {
    // 如果是加载默认题库
    if (index === -1) {
      // 从本地存储加载题库
      const storedPuzzles = localStorage.getItem('sudoku-puzzles');
      if (storedPuzzles) {
        puzzleLibrary.value = JSON.parse(storedPuzzles);
      }

      // 仅加载题库数据，不自动加载最新题目
      return;
    }

    // 验证索引
    if (index < 0 || index >= puzzleLibrary.value.length) {
      return;
    }

    // 加载选定的题目
    const puzzle = puzzleLibrary.value[index];

    // 更新棋盘
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        board.value[i][j] = { ...puzzle.board[i][j] };
      }
    }

    // 设置为有题目状态
    hasPuzzle.value = true;
  };

  /**
   * 从题库删除指定的题目
   * @param {number} index - 题目索引
   * @param {Function} showCustomAlert - 显示自定义弹窗的函数
   */
  const deletePuzzleFromLibrary = (index, showCustomAlert) => {
    if (showCustomAlert) {
      showCustomAlert('确定要删除这个题目吗？', 'error', () => {
        puzzleLibrary.value.splice(index, 1);
        savePuzzlesToStorage();
      });
    } else {
      // 兼容处理，如果没有传入showCustomAlert函数，则使用原来的confirm
      if (confirm('确定要删除这个题目吗？')) {
        puzzleLibrary.value.splice(index, 1);
        savePuzzlesToStorage();
      }
    }
  };

  /**
   * 重命名题目
   * @param {number} index - 题目索引
   */
  const renamePuzzle = (index) => {
    if (index >= 0 && index < puzzleLibrary.value.length) {
      const newName = prompt('请输入新的题目名称:', puzzleLibrary.value[index].name);
      if (newName !== null && newName.trim() !== '') {
        puzzleLibrary.value[index].name = newName.trim();
        savePuzzlesToStorage();
      }
    }
  };

  // 初始化时加载题库
  onMounted(() => {
    loadPuzzleFromLibrary();
  });

  return {
    puzzleLibrary,
    addPuzzleToLibrary,
    loadPuzzleFromLibrary,
    deletePuzzleFromLibrary,
    renamePuzzle,
    getDifficultyText
  };
}