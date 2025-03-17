/**
 * 数独题库管理
 * @file usePuzzleLibrary.js
 */
import { ref } from 'vue';
import { useUI } from './useUI';

/**
 * 数独题库管理
 * @param {Object} boardRef - 数独面板的reactive对象
 * @param {Object} hasPuzzleRef - 是否有题目的ref
 * @returns {Object} 题库相关状态和方法
 */
export function usePuzzleLibrary(boardRef, hasPuzzleRef) {
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
   * 将当前题目添加到题库
   * @param {string} name - 题目名称，可选
   * @returns {boolean} 是否成功添加
   */
  const addPuzzleToLibrary = (name = '') => {
    // 检查是否有题目输入
    let hasInput = false;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (boardRef[i][j].isUserInput) {
          hasInput = true;
          break;
        }
      }
      if (hasInput) break;
    }

    if (!hasInput) {
      alert('请先输入题目再保存！');
      return false;
    }

    // 检查是否是重复题目，如果重复则静默不添加
    if (isDuplicatePuzzle(boardRef)) {
      return false;
    }

    // 创建题目的副本（只保存用户输入的部分）
    const puzzleCopy = {
      board: boardRef.map(row =>
        row.map(cell => ({
          value: cell.isUserInput ? cell.value : '',
          isUserInput: cell.isUserInput,
          isSolution: false,
          isUserAnswer: false
        }))
      ),
      timestamp: Date.now(),
      name: name || `题目 ${puzzleLibrary.value.length + 1}`,
      difficulty: calculateDifficulty(boardRef)
    };

    // 添加到题库列表
    puzzleLibrary.value.unshift(puzzleCopy);

    // 限制保存数量，最多保存30个
    if (puzzleLibrary.value.length > 30) {
      puzzleLibrary.value.pop();
    }

    // 保存到localStorage
    savePuzzlesToStorage();

    return true;
  };

  /**
   * 计算题目难度（基于已填入数字的数量）
   * @param {Array<Array<Object>>} board - 数独面板
   * @returns {number} 难度等级 1-5
   */
  const calculateDifficulty = (board) => {
    let filledCount = 0;

    // 计算已填入的数字数量
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j].isUserInput && board[i][j].value) {
          filledCount++;
        }
      }
    }

    // 根据已填入数字数量确定难度
    if (filledCount >= 40) return 1; // 简单
    if (filledCount >= 35) return 2; // 中等
    if (filledCount >= 30) return 3; // 困难
    if (filledCount >= 25) return 4; // 专家
    return 5; // 大师
  };

  /**
   * 获取难度文本
   * @param {number} level - 难度级别
   * @returns {string} 难度文本
   */
  const getDifficultyText = (level) => {
    const difficultyTexts = {
      1: '简单',
      2: '中等',
      3: '困难',
      4: '专家',
      5: '大师'
    };
    return difficultyTexts[level] || '未知';
  };

  /**
   * 从题库加载指定的题目
   * @param {number} index - 题目索引，不传则只加载题库
   */
  const loadPuzzleFromLibrary = (index) => {
    // 如果没有传入索引，只加载题库
    if (index === undefined) {
      loadPuzzlesFromStorage();
      return;
    }

    const puzzle = puzzleLibrary.value[index];
    if (puzzle) {
      // 深拷贝题目数据到当前面板
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          boardRef[i][j].value = puzzle.board[i][j].value;
          boardRef[i][j].isUserInput = puzzle.board[i][j].isUserInput;
          boardRef[i][j].isSolution = false;
          boardRef[i][j].isUserAnswer = false;
        }
      }

      // 设置为有题目状态
      hasPuzzleRef.value = true;
    }
  };

  /**
   * 从题库删除指定的题目
   * @param {number} index - 题目索引
   */
  const deletePuzzleFromLibrary = (index) => {
    if (confirm('确定要删除这个题目吗？')) {
      puzzleLibrary.value.splice(index, 1);
      savePuzzlesToStorage();
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
  loadPuzzlesFromStorage();

  return {
    puzzleLibrary,
    addPuzzleToLibrary,
    loadPuzzleFromLibrary,
    deletePuzzleFromLibrary,
    renamePuzzle,
    getDifficultyText
  };
}