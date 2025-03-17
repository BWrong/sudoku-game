/**
 * 数独求解器
 * @file useSolver.js
 */
import { ref } from 'vue';

/**
 * 数独求解器
 * @param {Object} boardState - 数独面板状态
 * @returns {Object} 求解相关状态和方法
 */
export function useSolver(boardState) {
  // 解题步骤
  const solutionSteps = ref([]);

  // 当前步骤索引
  const currentStepIndex = ref(0);

  /**
   * 生成候选数表
   * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
   * @returns {Array<Array<Array<string>>>} 候选数表
   */
  const generateCandidates = (board) => {
    // 初始化候选数表，每个单元格包含1-9
    const candidates = Array(9).fill().map(() =>
      Array(9).fill().map(() => ['1', '2', '3', '4', '5', '6', '7', '8', '9'])
    );

    // 根据已填入的数字删减候选数
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col].value) {
          // 该单元格已有数字，清空候选数
          candidates[row][col] = [];

          // 从同行、同列、同宫格的单元格候选数中删除该数字
          eliminateCandidates(candidates, board[row][col].value, row, col);
        }
      }
    }

    return candidates;
  };

  /**
   * 从同行、同列、同宫格的单元格候选数中删除指定数字
   * @param {Array<Array<Array<string>>>} candidates - 候选数表
   * @param {string} num - 要删除的数字
   * @param {number} row - 行索引
   * @param {number} col - 列索引
   */
  const eliminateCandidates = (candidates, num, row, col) => {
    // 从同一行的候选数中删除
    for (let i = 0; i < 9; i++) {
      const index = candidates[row][i].indexOf(num);
      if (index !== -1) {
        candidates[row][i].splice(index, 1);
      }
    }

    // 从同一列的候选数中删除
    for (let i = 0; i < 9; i++) {
      const index = candidates[i][col].indexOf(num);
      if (index !== -1) {
        candidates[i][col].splice(index, 1);
      }
    }

    // 从同一个3x3宫格的候选数中删除
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const index = candidates[boxRow + i][boxCol + j].indexOf(num);
        if (index !== -1) {
          candidates[boxRow + i][boxCol + j].splice(index, 1);
        }
      }
    }
  };

  /**
   * 使用逻辑解法求解数独
   * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
   * @param {Array<Array<Array<string>>>} candidates - 候选数表
   * @returns {boolean} 是否完全解决
   */
  const solveWithLogic = (board, candidates) => {
    let progress = true;
    let solved = false;

    // 重置解题步骤
    solutionSteps.value = [];
    currentStepIndex.value = 0;

    // 循环尝试使用逻辑解法，直到无法继续或完全解决
    while (progress && !solved) {
      progress = false;

      // 检查是否已完全解决
      solved = true;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!board[row][col].value) {
            solved = false;
            break;
          }
        }
        if (!solved) break;
      }

      if (solved) break;

      // 1. 唯一候选数法
      if (applyNakedSingles(board, candidates)) {
        progress = true;
        continue;
      }

      // 2. 隐性唯一候选数法
      if (applyHiddenSingles(board, candidates)) {
        progress = true;
      }
    }

    return solved;
  };

  /**
   * 应用唯一候选数法
   * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
   * @param {Array<Array<Array<string>>>} candidates - 候选数表
   * @returns {boolean} 是否有进展
   */
  const applyNakedSingles = (board, candidates) => {
    let progress = false;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!board[row][col].value && candidates[row][col].length === 1) {
          const num = candidates[row][col][0];
          board[row][col].value = num;
          board[row][col].isSolution = true;

          // 记录解题步骤
          solutionSteps.value.push(`在第${row + 1}行第${col + 1}列填入数字${num}（唯一候选数法）`);

          // 从相关单元格的候选数中删除该数字
          eliminateCandidates(candidates, num, row, col);

          progress = true;
        }
      }
    }

    return progress;
  };

  /**
   * 应用隐性唯一候选数法
   * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
   * @param {Array<Array<Array<string>>>} candidates - 候选数表
   * @returns {boolean} 是否有进展
   */
  const applyHiddenSingles = (board, candidates) => {
    let progress = false;

    // 检查行
    for (let row = 0; row < 9; row++) {
      const numCount = {};
      const numPos = {};

      for (let col = 0; col < 9; col++) {
        if (!board[row][col].value) {
          for (const num of candidates[row][col]) {
            numCount[num] = (numCount[num] || 0) + 1;
            numPos[num] = numPos[num] || [];
            numPos[num].push(col);
          }
        }
      }

      for (const num in numCount) {
        if (numCount[num] === 1) {
          const col = numPos[num][0];
          board[row][col].value = num;
          board[row][col].isSolution = true;

          // 记录解题步骤
          solutionSteps.value.push(`在第${row + 1}行第${col + 1}列填入数字${num}（隐性唯一候选数法）`);

          // 从相关单元格的候选数中删除该数字
          eliminateCandidates(candidates, num, row, col);

          progress = true;
        }
      }
    }

    // 检查列
    for (let col = 0; col < 9; col++) {
      const numCount = {};
      const numPos = {};

      for (let row = 0; row < 9; row++) {
        if (!board[row][col].value) {
          for (const num of candidates[row][col]) {
            numCount[num] = (numCount[num] || 0) + 1;
            numPos[num] = numPos[num] || [];
            numPos[num].push(row);
          }
        }
      }

      for (const num in numCount) {
        if (numCount[num] === 1) {
          const row = numPos[num][0];
          board[row][col].value = num;
          board[row][col].isSolution = true;

          // 记录解题步骤
          solutionSteps.value.push(`在第${row + 1}行第${col + 1}列填入数字${num}（隐性唯一候选数法）`);

          // 从相关单元格的候选数中删除该数字
          eliminateCandidates(candidates, num, row, col);

          progress = true;
        }
      }
    }

    // 检查宫格
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const numCount = {};
        const numPos = {};

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow * 3 + i;
            const col = boxCol * 3 + j;

            if (!board[row][col].value) {
              for (const num of candidates[row][col]) {
                numCount[num] = (numCount[num] || 0) + 1;
                numPos[num] = numPos[num] || [];
                numPos[num].push({ row, col });
              }
            }
          }
        }

        for (const num in numCount) {
          if (numCount[num] === 1) {
            const { row, col } = numPos[num][0];
            board[row][col].value = num;
            board[row][col].isSolution = true;

            // 记录解题步骤
            solutionSteps.value.push(`在第${row + 1}行第${col + 1}列填入数字${num}（隐性唯一候选数法）`);

            // 从相关单元格的候选数中删除该数字
            eliminateCandidates(candidates, num, row, col);

            progress = true;
          }
        }
      }
    }

    return progress;
  };

  /**
   * 使用回溯法求解数独
   * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
   * @param {number} row - 当前行
   * @param {number} col - 当前列
   * @returns {boolean} 是否成功求解
   */
  const solve = (board, row, col) => {
    // 如果已经到了最后一行之后，说明解决完成
    if (row === 9) {
      return true;
    }

    // 计算下一个单元格位置
    const nextRow = col === 8 ? row + 1 : row;
    const nextCol = col === 8 ? 0 : col + 1;

    // 如果当前单元格已有数字，则跳到下一个
    if (board[row][col].value) {
      return solve(board, nextRow, nextCol);
    }

    // 尝试填入1-9
    for (let num = 1; num <= 9; num++) {
      const numStr = num.toString();

      if (boardState.isValid(board, row, col, numStr)) {
        board[row][col].value = numStr;
        board[row][col].isSolution = true;

        // 递归解决下一个单元格
        if (solve(board, nextRow, nextCol)) {
          return true;
        }

        // 如果无法解决，回溯
        board[row][col].value = '';
        board[row][col].isSolution = false;
      }
    }

    return false;
  };

  /**
   * 生成完整的随机数独解（回溯法）
   * @param {Array<Array<string>>} board - 数独面板
   * @param {number} row - 当前行
   * @param {number} col - 当前列
   * @returns {boolean} 是否成功生成
   */
  const generateSolvedSudoku = (board, row, col) => {
    // 如果已经到了最后一行之后，说明解决完成
    if (row === 9) {
      return true;
    }

    // 计算下一个单元格位置
    const nextRow = col === 8 ? row + 1 : row;
    const nextCol = col === 8 ? 0 : col + 1;

    // 如果当前单元格已有数字，则跳到下一个
    if (board[row][col] !== '') {
      return generateSolvedSudoku(board, nextRow, nextCol);
    }

    // 创建1-9的随机排列
    const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    // 尝试填入随机排列的数字
    for (const num of nums) {
      if (boardState.isValidForGeneration(board, row, col, num)) {
        board[row][col] = num;

        // 递归解决下一个单元格
        if (generateSolvedSudoku(board, nextRow, nextCol)) {
          return true;
        }

        // 如果无法解决，回溯
        board[row][col] = '';
      }
    }

    return false;
  };

  /**
   * 生成随机数独题目
   */
  const generateRandomPuzzle = () => {
    // 清空面板
    boardState.initializeBoard();

    // 生成一个完整的随机数独解
    const solvedBoard = Array(9).fill().map(() => Array(9).fill(''));
    generateSolvedSudoku(solvedBoard, 0, 0);

    // 根据难度移除一些数字，留下约25-35个数字作为题目
    const cellsToKeep = Math.floor(Math.random() * 11) + 25; // 25-35个数字
    const totalCells = 81;
    const cellsToRemove = totalCells - cellsToKeep;

    // 创建所有单元格的索引
    const allCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        allCells.push({ row, col });
      }
    }

    // 随机打乱单元格顺序
    for (let i = allCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
    }

    // 移除指定数量的单元格
    for (let i = 0; i < cellsToRemove; i++) {
      const { row, col } = allCells[i];
      solvedBoard[row][col] = '';
    }

    // 将生成的题目填入面板
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (solvedBoard[row][col]) {
          boardState.board[row][col].value = solvedBoard[row][col];
          boardState.board[row][col].isUserInput = true;
        }
      }
    }

    // 设置为有题目状态
    boardState.hasPuzzle.value = true;
  };

  /**
   * 获取提示
   */
  const getHint = () => {
    // 复制当前面板状态
    const boardCopy = boardState.board.map(row =>
      row.map(cell => ({...cell}))
    );

    // 生成候选数表
    const candidates = generateCandidates(boardCopy);

    // 尝试找到一个可以填入的单元格
    let hintFound = false;
    let hintRow = -1;
    let hintCol = -1;
    let hintValue = '';
    let hintReason = '';

    // 1. 尝试唯一候选数法
    for (let row = 0; row < 9 && !hintFound; row++) {
      for (let col = 0; col < 9; col++) {
        if (!boardCopy[row][col].value) {
          if (candidates[row][col].length === 1) {
            hintFound = true;
            hintRow = row;
            hintCol = col;
            hintValue = candidates[row][col][0];
            hintReason = `唯一候选数法：该位置只有一个候选数 ${hintValue}`;
            break;
          }
        }
      }
    }

    // 2. 如果没找到，尝试隐性唯一候选数法
    if (!hintFound) {
      // 检查行
      for (let row = 0; row < 9 && !hintFound; row++) {
        const numCount = {};
        const numPos = {};

        for (let col = 0; col < 9; col++) {
          if (!boardCopy[row][col].value) {
            for (const num of candidates[row][col]) {
              numCount[num] = (numCount[num] || 0) + 1;
              numPos[num] = numPos[num] || [];
              numPos[num].push(col);
            }
          }
        }

        for (const num in numCount) {
          if (numCount[num] === 1) {
            hintFound = true;
            hintRow = row;
            hintCol = numPos[num][0];
            hintValue = num;
            hintReason = `隐性唯一候选数法：数字 ${num} 在第 ${row + 1} 行只能放在这个位置`;
            break;
          }
        }
      }

      // 检查列
      for (let col = 0; col < 9 && !hintFound; col++) {
        const numCount = {};
        const numPos = {};

        for (let row = 0; row < 9; row++) {
          if (!boardCopy[row][col].value) {
            for (const num of candidates[row][col]) {
              numCount[num] = (numCount[num] || 0) + 1;
              numPos[num] = numPos[num] || [];
              numPos[num].push(row);
            }
          }
        }

        for (const num in numCount) {
          if (numCount[num] === 1) {
            hintFound = true;
            hintRow = numPos[num][0];
            hintCol = col;
            hintValue = num;
            hintReason = `隐性唯一候选数法：数字 ${num} 在第 ${col + 1} 列只能放在这个位置`;
            break;
          }
        }
      }
    }

    if (hintFound) {
      // 高亮提示单元格
      boardState.currentStepCells.value = [{ row: hintRow, col: hintCol }];

      // 显示提示信息
      alert(`提示：在第 ${hintRow + 1} 行第 ${hintCol + 1} 列填入数字 ${hintValue}。\n${hintReason}`);
    } else {
      alert('没有找到简单的提示，请尝试使用更高级的解题技巧或使用求解功能。');
    }
  };

  /**
   * 求解数独
   */
  const solveSudoku = () => {
    // 复制当前面板状态
    const boardCopy = boardState.board.map(row =>
      row.map(cell => ({...cell}))
    );

    // 重置解题步骤
    solutionSteps.value = [];
    currentStepIndex.value = 0;
    boardState.currentStepCells.value = null;

    // 生成候选数表
    const candidates = generateCandidates(boardCopy);

    // 使用逻辑解法尝试求解
    if (solveWithLogic(boardCopy, candidates)) {
      // 更新面板显示解决方案
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (!boardState.board[i][j].isUserInput) {
            boardState.board[i][j].value = boardCopy[i][j].value;
            boardState.board[i][j].isSolution = true;
          }
        }
      }
      boardState.showSolution.value = true;
      boardState.isSolved.value = true;

      // 初始化步骤显示
      if (solutionSteps.value.length > 0) {
        updateStepHighlight();
      }
    } else {
      // 如果逻辑解法无法完全解决，使用回溯法
      if (solve(boardCopy, 0, 0)) {
        // 更新面板显示解决方案
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (!boardState.board[i][j].isUserInput) {
              boardState.board[i][j].value = boardCopy[i][j].value;
              boardState.board[i][j].isSolution = true;
            }
          }
        }
        boardState.showSolution.value = true;
        boardState.isSolved.value = true;
        solutionSteps.value.push("使用回溯法完成剩余部分");

        // 初始化步骤显示
        if (solutionSteps.value.length > 0) {
          updateStepHighlight();
        }
      } else {
        alert('无法解决当前数独！请检查输入是否有效。');
        boardState.isSolved.value = false;
      }
    }
  };

  /**
   * 前往指定步骤
   * @param {number} index - 步骤索引
   */
  const goToStep = (index) => {
    if (index < 0 || index >= solutionSteps.value.length) return;

    currentStepIndex.value = index;
    updateStepHighlight();
  };

  /**
   * 前往上一步
   */
  const prevStep = () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
      updateStepHighlight();
    }
  };

  /**
   * 前往下一步
   */
  const nextStep = () => {
    if (currentStepIndex.value < solutionSteps.value.length - 1) {
      currentStepIndex.value++;
      updateStepHighlight();
    }
  };

  /**
   * 更新步骤高亮
   */
  const updateStepHighlight = () => {
    // 解析当前步骤，找出涉及的单元格
    const step = solutionSteps.value[currentStepIndex.value];

    // 重置高亮单元格
    boardState.currentStepCells.value = [];

    // 解析步骤文本，查找行列信息
    // 例如："在第3行第5列填入数字7"
    const rowMatch = step.match(/第(\d+)行/);
    const colMatch = step.match(/第(\d+)列/);

    if (rowMatch && colMatch) {
      const row = parseInt(rowMatch[1]) - 1;
      const col = parseInt(colMatch[1]) - 1;

      if (row >= 0 && row < 9 && col >= 0 && col < 9) {
        boardState.currentStepCells.value.push({ row, col });
      }
    }
  };

  return {
    solutionSteps,
    currentStepIndex,
    generateRandomPuzzle,
    getHint,
    solveSudoku,
    goToStep,
    prevStep,
    nextStep
  };
}