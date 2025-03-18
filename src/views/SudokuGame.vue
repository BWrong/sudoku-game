<template>
  <div class="sudoku-container">
    <!-- 导航栏 -->
    <SudokuNavbar
      :activeTab="activeTab"
      @tabChange="activeTab = $event"
    />

    <!-- 自定义弹窗 -->
    <SudokuAlert
      :show="showAlert"
      :message="alertMessage"
      :type="alertType"
      :hasCallback="alertCallback !== null"
      @confirm="closeAlert"
      @cancel="showAlert = false; alertCallback = null"
    />

    <div class="main-content">
      <!-- 游戏区域 -->
      <div class="game-section" v-if="activeTab === 'game'">
        <!-- 模式切换按钮 -->
        <div class="mode-toggle-container">
          <SudokuControls
            :gameMode="gameMode"
            :hasPuzzle="hasPuzzle"
            :showModeToggleOnly="true"
            @modeChange="setGameMode"
          />
        </div>

        <!-- 数独棋盘 -->
        <SudokuBoard
          :board="board"
          :gameMode="gameMode"
          :isSolved="isSolved"
          :showSolution="showSolution"
          :highlightedCell="highlightedCell"
          :currentStepCells="currentStepCells"
          @cellInput="validateInput"
          @cellHover="highlightCell"
          @cellLeave="clearHighlight"
          @cellClick="highlightCell"
        />

        <!-- 操作按钮 -->
        <div class="action-buttons-container">
          <SudokuControls
            :showModeToggleOnly="false"
            :gameMode="gameMode"
            :hasPuzzle="hasPuzzle"
            :isSolved="isSolved"
            :showSolution="showSolution"
            :solutionSteps="solutionSteps"
            :currentStepIndex="currentStepIndex"
            @modeChange="setGameMode"
            @finishCreating="finishCreating"
            @clearBoard="clearBoard"
            @generateRandomPuzzle="generateRandomPuzzle"
            @checkAnswer="checkAnswer"
            @clearSolution="clearSolution"
            @getHint="getHint"
            @solveSudoku="solveSudoku"
            @prevStep="handlePrevStep"
            @nextStep="handleNextStep"
          />
        </div>

        <!-- 解题步骤区域 -->
        <SudokuSteps
          v-if="showSolution && solutionSteps.length > 0"
          :solutionSteps="solutionSteps"
          :currentStepIndex="currentStepIndex"
          @prevStep="handlePrevStep"
          @nextStep="handleNextStep"
          @goToStep="goToStep"
        />
      </div>

      <!-- 题库区域 -->
      <SudokuLibrary
        v-if="activeTab === 'library'"
        :puzzleLibrary="puzzleLibrary"
        @loadPuzzle="loadPuzzleFromLibraryAndNavigate"
        @deletePuzzle="deletePuzzleWithConfirm"
        @clearLibrary="confirmClearLibrary"
      />

      <!-- 技巧区域 -->
      <SudokuTechniques
        v-if="activeTab === 'techniques'"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * 数独游戏主组件
 * @component SudokuGame
 */
import { ref, onMounted, watch } from 'vue';
import { useGameBoard } from '../composables/useGameBoard';
import { useHighlight } from '../composables/useHighlight';
import { useUI } from '../composables/useUI';
import { useSteps } from '../composables/useSteps';
import { usePuzzleLibrary } from '../composables/usePuzzleLibrary';
import { useSolver } from '../composables/useSolver';

// 引入组件
import SudokuAlert from '../components/SudokuAlert.vue';
import SudokuNavbar from '../components/SudokuNavbar.vue';
import SudokuBoard from '../components/SudokuBoard.vue';
import SudokuControls from '../components/SudokuControls.vue';
import SudokuLibrary from '../components/SudokuLibrary.vue';
import SudokuSteps from '../components/SudokuSteps.vue';
import SudokuTechniques from '../components/SudokuTechniques.vue';

// 当前激活的标签页
const activeTab = ref('game');

// 自定义弹窗状态
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('info'); // 'success', 'error', 'info', 'hint'
const alertCallback = ref(null); // 用于确认弹窗的回调函数

/**
 * 显示自定义弹窗
 * @param {string} message - 弹窗消息
 * @param {string} type - 弹窗类型
 * @param {Function} callback - 确认按钮的回调函数
 */
const showCustomAlert = (message, type = 'info', callback = null) => {
  alertMessage.value = message;
  alertType.value = type;
  alertCallback.value = callback;
  showAlert.value = true;
};

/**
 * 关闭弹窗
 */
const closeAlert = () => {
  if (alertCallback.value) {
    alertCallback.value();
  }
  showAlert.value = false;
  alertCallback.value = null;
};

// 游戏面板相关状态和方法
const {
  board,
  isSolved,
  showSolution,
  initializeBoard,
  validateInput: validateBoardInput,
  clearBoard: clearBoardFromGame,
  clearSolution: clearSolutionFromGame
} = useGameBoard();

// 是否有题目
const hasPuzzle = ref(false);

// 游戏模式（出题/作答）
const gameMode = ref('create');

// 高亮相关状态和方法
const {
  highlightedCell,
  highlightCell,
  clearHighlight
} = useHighlight();

// 当前步骤高亮的单元格
const currentStepCells = ref(null);

// 解题步骤相关状态和方法
const {
  solutionSteps,
  currentStepIndex,
  generateRandomPuzzle: generateRandomPuzzleFromSolver,
  getHint: getSolverHint,
  solveSudoku: solveSudokuFromSolver,
  goToStep,
  prevStep,
  nextStep
} = useSolver({
  board,
  hasPuzzle,
  showSolution,
  isSolved,
  currentStepCells,
  initializeBoard,
  isValid: (board, row, col, num) => {
    // 如果传入的board为undefined或无效，直接返回false
    if (!board || !Array.isArray(board) || !board[row] || !board[row][col]) {
      console.error('无效的棋盘数据:', { board, row, col });
      return false;
    }

    // 确保num是数字类型
    num = Number(num);
    if (isNaN(num) || num < 1 || num > 9) {
      return false;
    }

    // 检查行
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i] && !isNaN(Number(board[row][i].value)) && Number(board[row][i].value) === num) {
        return false;
      }
    }

    // 检查列
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i] && board[i][col] && !isNaN(Number(board[i][col].value)) && Number(board[i][col].value) === num) {
        return false;
      }
    }

    // 检查3x3宫格
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const r = boxRow + i;
        const c = boxCol + j;
        if ((r !== row || c !== col) && board[r] && board[r][c] && !isNaN(Number(board[r][c].value)) && Number(board[r][c].value) === num) {
          return false;
        }
      }
    }

    return true;
  },
  isValidForGeneration: (board, row, col, num) => {
    // 如果传入的board为undefined或无效，直接返回false
    if (!board || !Array.isArray(board) || !board[row]) {
      console.error('无效的临时棋盘数据:', { board, row, col });
      return false;
    }

    // 确保num是数字类型
    num = Number(num);
    if (isNaN(num) || num < 1 || num > 9) {
      return false;
    }

    // 检查行
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i] !== undefined && !isNaN(Number(board[row][i])) && Number(board[row][i]) === num) {
        return false;
      }
    }

    // 检查列
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i] && board[i][col] !== undefined && !isNaN(Number(board[i][col])) && Number(board[i][col]) === num) {
        return false;
      }
    }

    // 检查3x3宫格
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const r = boxRow + i;
        const c = boxCol + j;
        if ((r !== row || c !== col) && board[r] && board[r][c] !== undefined && !isNaN(Number(board[r][c])) && Number(board[r][c]) === num) {
          return false;
        }
      }
    }

    return true;
  }
});

// 步骤相关状态和方法
const {
  updateStepHighlight
} = useSteps(solutionSteps, currentStepCells);



// 题库相关状态和方法
const {
  puzzleLibrary,
  addPuzzleToLibrary,
  loadPuzzleFromLibrary,
  deletePuzzleFromLibrary
} = usePuzzleLibrary(board, hasPuzzle);

/**
 * 设置游戏模式
 * @param {string} mode - 游戏模式
 */
const setGameMode = (mode) => {
  if (mode === 'solve' && !hasPuzzle.value) {
    showCustomAlert('请先创建或加载一个题目！', 'info');
    return;
  }
  gameMode.value = mode;
};

/**
 * 验证用户输入
 * @param {Event} event - 输入事件
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 */
const validateInput = (event, row, col) => {
  // 当用户输入值时，如果之前有高亮提示，则清除
  if (highlightedCell.value) {
    clearHighlight();
  }

  validateBoardInput(event, row, col, gameMode.value);
};

/**
 * 完成出题
 */
const finishCreating = () => {
  // 检查是否有题目输入
  let hasInput = false;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board.value[i][j].isUserInput) {
        hasInput = true;
        break;
      }
    }
    if (hasInput) break;
  }

  if (!hasInput) {
    showCustomAlert('请先输入题目！', 'error');
    return;
  }

  // 设置为有题目状态
  hasPuzzle.value = true;

  // 切换到作答模式
  gameMode.value = 'solve';

  // 添加到题库
  addPuzzleToLibrary();
};

/**
 * 确认清空题库
 */
const confirmClearLibrary = () => {
  showCustomAlert('确定要清空题库吗？此操作不可恢复！', 'error', () => {
    clearLibrary();
  });
};

/**
 * 清空题库
 */
const clearLibrary = () => {
    puzzleLibrary.value = [];
    localStorage.removeItem('sudoku-puzzles');

    // 如果当前在解题模式，切换回出题模式
    if (gameMode.value === 'solve') {
      gameMode.value = 'create';
      hasPuzzle.value = false;
    }

  showCustomAlert('题库已清空！', 'info');
};

/**
 * 删除确认
 * @param {number} index - 要删除的题目索引
 */
const deletePuzzleWithConfirm = (index) => {
  showCustomAlert('确定要删除此题目吗？', 'error', () => {
    deletePuzzleFromLibrary(index);
  });
};

/**
 * 加载题目并导航到游戏页面
 * @param {number} index - 题目索引
 */
const loadPuzzleFromLibraryAndNavigate = (index) => {
  // 清除已有的提示高亮
  clearHighlight();

  // 清除解题步骤显示
  currentStepCells.value = null;

  // 清除解题答案显示
  showSolution.value = false;

  // 重置解题步骤
  if (solutionSteps.value && solutionSteps.value.length > 0) {
    solutionSteps.value = [];
  }
  if (currentStepIndex.value !== 0) {
    currentStepIndex.value = 0;
  }

  // 加载题目
  loadPuzzleFromLibrary(index);

  // 切换到游戏标签页
  activeTab.value = 'game';
};

/**
 * 验证用户答案是否正确
 */
const checkAnswer = () => {
  // 检查棋盘是否填满
  let isFilled = true;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (!board.value[i][j].value) {
        isFilled = false;
        break;
      }
    }
    if (!isFilled) break;
  }

  if (!isFilled) {
    showCustomAlert('请先完成所有空格！', 'error');
    return;
  }

  // 验证答案是否正确
  let isCorrect = true;
  for (let i = 0; i < 9; i++) {
    // 检查每一行
    const rowSet = new Set();
    for (let j = 0; j < 9; j++) {
      const value = board.value[i][j].value;
      if (rowSet.has(value)) {
        isCorrect = false;
        break;
      }
      rowSet.add(value);
    }

    if (!isCorrect) break;

    // 检查每一列
    const colSet = new Set();
    for (let j = 0; j < 9; j++) {
      const value = board.value[j][i].value;
      if (colSet.has(value)) {
        isCorrect = false;
        break;
      }
      colSet.add(value);
    }

    if (!isCorrect) break;
  }

  // 检查每个3x3宫格
  if (isCorrect) {
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxSet = new Set();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const r = boxRow * 3 + i;
            const c = boxCol * 3 + j;
            const value = board.value[r][c].value;
            if (boxSet.has(value)) {
              isCorrect = false;
              break;
            }
            boxSet.add(value);
          }
          if (!isCorrect) break;
        }
        if (!isCorrect) break;
      }
      if (!isCorrect) break;
    }
  }

  if (isCorrect) {
    // 如果答案正确，显示成功动画
    isSolved.value = true;
    showSolution.value = true;
    showCustomAlert('恭喜！你的答案完全正确！', 'success');
  } else {
    // 如果答案错误，显示错误提示
    showCustomAlert('答案不正确，请检查后重试！', 'error');
  }
};

/**
 * 获取提示
 */
const getHint = () => {
  const hint = getSolverHint();

  if (hint) {
    console.log("提示文本:", hint);

    // 使用更宽松的正则表达式匹配提示中的坐标
    const positionMatch = hint.match(/\((\d+),?\s*(\d+)\)/);
    console.log("正则匹配结果:", positionMatch);

    if (positionMatch && positionMatch.length === 3) {
      const row = parseInt(positionMatch[1]) - 1; // 提示中是从1开始的，转为从0开始
      const col = parseInt(positionMatch[2]) - 1;

      console.log("提取的坐标 - 行:", row, "列:", col);

      // 设置高亮单元格
      highlightedCell.value = { row, col };

      // 显示提示弹窗
      showCustomAlert(hint, 'hint');

      // 确保弹窗关闭后仍保持高亮
      setTimeout(() => {
        highlightedCell.value = { row, col };
      }, 1000);

      return true;
    } else {
      // 尝试查找更一般的坐标格式
      const generalMatch = hint.match(/位置\s*\(?(\d+)\s*[,，行]\s*(\d+)/);
      if (generalMatch && generalMatch.length === 3) {
        const row = parseInt(generalMatch[1]) - 1;
        const col = parseInt(generalMatch[2]) - 1;

        console.log("广义匹配提取的坐标 - 行:", row, "列:", col);

        // 设置高亮单元格
        highlightedCell.value = { row, col };

        // 显示提示弹窗
        showCustomAlert(hint, 'hint');

        // 确保弹窗关闭后仍保持高亮
        setTimeout(() => {
          highlightedCell.value = { row, col };
        }, 1000);

        return true;
      } else {
        console.warn("无法从提示文本中提取坐标");
        showCustomAlert(hint, 'hint');
      }
    }
  } else {
    showCustomAlert('无法提供更多提示，请尝试其他策略。', 'info');
  }

  return false;
};

/**
 * 生成随机题目
 */
const generateRandomPuzzle = () => {
  // 清除已有的提示高亮
  clearHighlight();

  // 调用原始生成函数
  generateRandomPuzzleFromSolver();
};

/**
 * 查看解题步骤
 */
const solveSudoku = () => {
  // 清除已有的提示高亮
  clearHighlight();

  // 调用原始求解函数
  const success = solveSudokuFromSolver();
  if (success) {
    showSolution.value = true;
    showCustomAlert('已生成解题步骤，您可以逐步查看解题过程。', 'success');
  } else {
    showCustomAlert('该数独无解，请检查您设置的题目是否正确。', 'error');
  }
};

/**
 * 清除解答
 */
const clearSolution = () => {
  // 清除已有的提示高亮
  clearHighlight();

  // 调用原始清除函数
  clearSolutionFromGame();
};

/**
 * 清除棋盘
 */
const clearBoard = () => {
  // 清除已有的提示高亮
  clearHighlight();

  // 调用原始清除函数
  clearBoardFromGame();
};

/**
 * 切换到下一步解题步骤
 */
const handleNextStep = () => {
  // 不再清除高亮，直接调用nextStep
  nextStep();
};

/**
 * 切换到上一步解题步骤
 */
const handlePrevStep = () => {
  // 不再清除高亮，直接调用prevStep
  prevStep();
};

// 监视highlightedCell变化
watch(highlightedCell, (newVal) => {
  console.log('highlightedCell变化：', newVal);
}, { deep: true });

// 初始化
onMounted(() => {

  // 加载题库数据，但不自动加载题目
  loadPuzzleFromLibrary();

  // 初始化一个空白棋盘用于出题
  initializeBoard();

  // 确保游戏模式为出题模式
  gameMode.value = 'create';
  hasPuzzle.value = false;
});
</script>

<style scoped>
.sudoku-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
}

.main-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  gap: 20px;
}

.game-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 15px 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12), 0 5px 15px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 100%;
  transition: box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.game-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335);
}

.mode-toggle-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 10px;
}

.action-buttons-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
}

@media (max-width: 767px) {
  .main-content {
    padding-bottom: 80px; /* 移动端增加底部内边距 */
  }

  .sudoku-container {
    margin-bottom: 80px; /* 为底部导航栏留出空间 */
  }
}

@media (min-width: 768px) {
  /* 平板和桌面端布局优化 */
  .main-content {
    flex-direction: row;
    flex-wrap: wrap;
    padding-bottom: 0;
  }

  .game-section {
    flex: 2;
    max-width: 600px;
  }
}
</style>