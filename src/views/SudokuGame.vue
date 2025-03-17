<template>
  <div class="sudoku-container">
    <!-- 顶部导航栏 -->
    <div class="mobile-tabbar">
      <div
        class="tab-item"
        :class="{'active': activeTab === 'game'}"
        @click="activeTab = 'game'"
      >
        <div class="tab-icon">🎮</div>
        <div class="tab-label">游戏</div>
      </div>
      <div
        class="tab-item"
        :class="{'active': activeTab === 'library'}"
        @click="activeTab = 'library'"
      >
        <div class="tab-icon">📚</div>
        <div class="tab-label">题库</div>
      </div>
      <div
        class="tab-item"
        :class="{'active': activeTab === 'techniques'}"
        @click="activeTab = 'techniques'"
      >
        <div class="tab-icon">💡</div>
        <div class="tab-label">技巧</div>
      </div>
    </div>

    <div class="main-content">
      <!-- 游戏区域 -->
      <div class="game-section" v-if="activeTab === 'game'">
        <div class="game-mode-toggle">
          <button
            @click="setGameMode('create')"
            class="mode-btn"
            :class="{'active': gameMode === 'create'}"
          >
            出题模式
          </button>
          <button
            @click="setGameMode('solve')"
            class="mode-btn"
            :class="{'active': gameMode === 'solve'}"
            :disabled="!hasPuzzle"
          >
            作答模式
          </button>
        </div>

        <div class="sudoku-board" :class="{'solved': showSolution && isSolved}">
          <div v-for="(row, rowIndex) in board" :key="'row-' + rowIndex" class="sudoku-row">
            <div
              v-for="(cell, colIndex) in row"
              :key="'cell-' + rowIndex + '-' + colIndex"
              class="sudoku-cell"
              :class="{
                'top-border': rowIndex % 3 === 0,
                'bottom-border': rowIndex % 3 === 2,
                'left-border': colIndex % 3 === 0,
                'right-border': colIndex % 3 === 2,
                'user-input': cell.isUserInput,
                'user-answer': cell.isUserAnswer,
                'solution': cell.isSolution,
                'highlight-row': highlightedCell && highlightedCell.row === rowIndex,
                'highlight-col': highlightedCell && highlightedCell.col === colIndex,
                'highlight-box': highlightedCell && Math.floor(highlightedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(highlightedCell.col / 3) === Math.floor(colIndex / 3),
                'highlight-same': highlightedCell && cell.value && cell.value === board[highlightedCell.row][highlightedCell.col].value,
                'highlight-step': currentStepCells && currentStepCells.some(c => c.row === rowIndex && c.col === colIndex)
              }"
              @mouseenter="highlightCell(rowIndex, colIndex)"
              @mouseleave="clearHighlight"
            >
              <input
                v-if="!showSolution && ((gameMode === 'create' && !cell.isUserAnswer) || (gameMode === 'solve' && !cell.isUserInput))"
                type="text"
                v-model="cell.value"
                @input="validateInput($event, rowIndex, colIndex)"
                @focus="highlightCell(rowIndex, colIndex)"
                maxlength="1"
                :disabled="showSolution || (gameMode === 'solve' && cell.isUserInput) || (gameMode === 'create' && cell.isUserAnswer)"
              >
              <span v-else>{{ cell.value || '' }}</span>
            </div>
          </div>
        </div>

        <div class="celebration" v-if="showSolution && isSolved">
          <div class="confetti-container">
            <div v-for="n in 30" :key="n" class="confetti" :style="getConfettiStyle(n)"></div>
          </div>
          <div class="success-message">恭喜！数独已解决</div>
        </div>

        <div class="controls">
          <button v-if="gameMode === 'create'" @click="clearBoard" class="btn">
            清空全部
          </button>
          <button v-if="gameMode === 'create'" @click="generateRandomPuzzle" class="btn">
            自动出题
          </button>
          <button v-if="gameMode === 'create'" @click="finishCreating" class="btn primary">
            完成出题
          </button>

          <button v-if="gameMode === 'solve'" @click="clearSolution" class="btn">
            清空答案
          </button>
          <button v-if="gameMode === 'solve'" @click="getHint" class="btn">
            提示
          </button>
          <button v-if="gameMode === 'solve'" @click="solveSudoku" class="btn primary">
            求解
          </button>
        </div>

        <!-- 解题步骤区域（与游戏区域同时显示） -->
        <div class="steps-section-inline" v-if="showSolution && solutionSteps.length > 0">
          <h3>解题思路：</h3>

          <div class="step-controls">
            <button @click="prevStep" :disabled="currentStepIndex <= 0" class="step-btn">
              上一步
            </button>
            <span class="step-progress">{{ currentStepIndex + 1 }} / {{ solutionSteps.length }}</span>
            <button @click="nextStep" :disabled="currentStepIndex >= solutionSteps.length - 1" class="step-btn">
              下一步
            </button>
          </div>

          <div class="current-step">
            <span class="step-number">{{ currentStepIndex + 1 }}.</span>
            {{ solutionSteps[currentStepIndex] }}
          </div>

          <div class="steps-container">
            <div
              v-for="(step, index) in solutionSteps"
              :key="index"
              class="step"
              :class="{'active-step': index === currentStepIndex}"
              @click="goToStep(index)"
            >
              <span class="step-number">{{ index + 1 }}.</span> {{ step }}
            </div>
          </div>
        </div>
      </div>

      <!-- 题库区域 -->
      <div class="library-section" v-if="activeTab === 'library'">
        <div class="library-list" v-if="puzzleLibrary.length > 0">
          <button @click="clearLibrary" class="btn-clear-library">
            清空题库
          </button>
          <div
            v-for="(puzzle, index) in puzzleLibrary"
            :key="index"
            class="library-item"
          >
            <div class="library-preview" @click="loadPuzzleFromLibrary(index); activeTab = 'game';">
              <div v-for="(row, rowIndex) in [0, 1, 2, 3, 4, 5, 6, 7, 8]" :key="rowIndex" class="preview-row">
                <div
                  v-for="(col, colIndex) in [0, 1, 2, 3, 4, 5, 6, 7, 8]"
                  :key="colIndex"
                  class="preview-cell"
                  :class="{'preview-cell-filled': puzzle.board[rowIndex][colIndex].value}"
                >
                  {{ puzzle.board[rowIndex][colIndex].value }}
                </div>
              </div>
            </div>
            <div class="library-info">
              <div class="library-difficulty">难度: {{ getDifficultyText(puzzle.difficulty) }}</div>
              <div class="library-date">{{ formatDate(puzzle.timestamp) }}</div>
              <div class="library-actions">
                <button @click="deletePuzzleFromLibrary(index)" class="btn-action btn-delete">删除</button>
              </div>
            </div>
          </div>
        </div>
        <div class="library-empty" v-else>
          题库为空，请添加或生成题目
        </div>
      </div>

      <!-- 技巧区域 -->
      <div class="techniques-section" v-if="activeTab === 'techniques'">
        <div class="technique-tabs">
          <button
            v-for="(technique, index) in techniques"
            :key="index"
            class="technique-tab"
            :class="{'active': currentTechniqueIndex === index}"
            @click="currentTechniqueIndex = index"
          >
            {{ technique.name }}
          </button>
        </div>
        <div class="technique-content">
          <h4>{{ techniques[currentTechniqueIndex].name }}</h4>
          <div class="technique-difficulty">
            难度：
            <span
              class="difficulty-level"
              :class="'level-' + techniques[currentTechniqueIndex].difficulty"
            >
              {{ getDifficultyText(techniques[currentTechniqueIndex].difficulty) }}
            </span>
          </div>
          <div class="technique-description" v-html="techniques[currentTechniqueIndex].description"></div>
          <div class="technique-example" v-html="techniques[currentTechniqueIndex].example"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 数独游戏组件
 * @component SudokuGame
 */
import { ref, onMounted, computed } from 'vue';
import { useGameBoard } from '../composables/useGameBoard';
import { useHighlight } from '../composables/useHighlight';
import { useUI } from '../composables/useUI';
import { useSteps } from '../composables/useSteps';
import { useTechniques } from '../composables/useTechniques';
import { usePuzzleLibrary } from '../composables/usePuzzleLibrary';
import { useSolver } from '../composables/useSolver';

// 当前激活的标签页
const activeTab = ref('game');

// 游戏面板相关状态和方法
const {
  board,
  isSolved,
  showSolution,
  initializeBoard,
  validateInput: validateBoardInput,
  clearBoard,
  clearSolution
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
  generateRandomPuzzle,
  getHint,
  solveSudoku,
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
    // 检查行
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i].value === num) {
        return false;
      }
    }

    // 检查列
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i][col].value === num) {
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
        if (r !== row && c !== col && board[r][c].value === num) {
          return false;
        }
      }
    }

    return true;
  },
  isValidForGeneration: (board, row, col, num) => {
    // 检查行
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i] === num) {
        return false;
      }
    }

    // 检查列
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i][col] === num) {
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
        if (r !== row && c !== col && board[r][c] === num) {
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

// UI相关方法
const {
  addTouchSupport,
  getConfettiStyle,
  formatDate
} = useUI();

// 题库相关状态和方法
const {
  puzzleLibrary,
  addPuzzleToLibrary,
  loadPuzzleFromLibrary,
  deletePuzzleFromLibrary,
  getDifficultyText
} = usePuzzleLibrary(board, hasPuzzle);

// 技巧相关状态和方法
const {
  currentTechniqueIndex,
  techniques
} = useTechniques();

/**
 * 设置游戏模式
 * @param {string} mode - 游戏模式
 */
const setGameMode = (mode) => {
  if (mode === 'solve' && !hasPuzzle.value) {
    alert('请先创建或加载一个题目！');
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
      if (board[i][j].isUserInput) {
        hasInput = true;
        break;
      }
    }
    if (hasInput) break;
  }

  if (!hasInput) {
    alert('请先输入题目！');
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
 * 清空题库
 */
const clearLibrary = () => {
  if (confirm('确定要清空题库吗？此操作不可恢复！')) {
    puzzleLibrary.value = [];
    localStorage.removeItem('sudoku-puzzles');

    // 如果当前在解题模式，切换回出题模式
    if (gameMode.value === 'solve') {
      gameMode.value = 'create';
      hasPuzzle.value = false;
    }
  }
};

// 初始化
onMounted(() => {
  // 添加移动端触摸支持
  addTouchSupport();

  // 加载题库
  loadPuzzleFromLibrary();
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

@media (max-width: 767px) {
  .main-content {
    padding-bottom: 80px; /* 移动端增加底部内边距 */
  }

  .mobile-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .sudoku-container {
    margin-bottom: 80px; /* 为底部导航栏留出空间 */
  }
}

.game-section,
.library-section,
.techniques-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 15px 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12), 0 5px 15px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 100%;
  transition: box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}
.game-section{
  padding: 15px 20px;
}
.game-section::before,
.library-section::before,
.techniques-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335);
}

.sudoku-board {
  display: grid;
  grid-template-rows: repeat(9, 1fr);
  border: 2px solid #333;
  margin: 10px 0 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  aspect-ratio: 1 / 1; /* 确保整个棋盘是正方形 */
}

.sudoku-row {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  width: 100%;
}

.sudoku-cell {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  position: relative;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.sudoku-cell input,
.sudoku-cell span {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.sudoku-cell input {
  border: none;
  text-align: center;
  background: transparent;
  outline: none;
  color: #2c3e50;
  transition: all 0.3s ease;
  font-family: 'Arial', sans-serif;
}

.sudoku-cell span {
  font-family: 'Arial', sans-serif;
}

.sudoku-cell:hover {
  background-color: #f0f7ff;
  z-index: 1;
}

.highlight-row {
  background-color: rgba(66, 133, 244, 0.08);
}

.highlight-col {
  background-color: rgba(66, 133, 244, 0.08);
}

.highlight-box {
  background-color: rgba(66, 133, 244, 0.12);
}

.highlight-same {
  background-color: rgba(66, 133, 244, 0.25);
}

.top-border {
  border-top-width: 2px;
  border-top-color: #333;
}

.bottom-border {
  border-bottom-width: 2px;
  border-bottom-color: #333;
}

.left-border {
  border-left-width: 2px;
  border-left-color: #333;
}

.right-border {
  border-right-width: 2px;
  border-right-color: #333;
}

.sudoku-board.solved {
  animation: solvedPulse 1.5s ease-in-out;
}

@keyframes solvedPulse {
  0% { transform: scale(1); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
  50% { transform: scale(1.03); box-shadow: 0 15px 35px rgba(52, 168, 83, 0.3); }
  100% { transform: scale(1.01); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15); }
}

.celebration {
  position: relative;
  width: 100%;
  height: 80px;
  margin-bottom: 20px;
  overflow: hidden;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.confetti {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background-color: var(--color);
  top: -20px;
  left: var(--left);
  opacity: 0;
  animation: confettiFall var(--animation-duration) ease-in-out var(--animation-delay) infinite;
  border-radius: 2px;
  transform: rotate(45deg);
}

@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(40px) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100px) rotate(360deg);
    opacity: 0;
  }
}

.success-message {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #34a853;
  margin: 20px 0;
  animation: successPulse 2s infinite;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.controls {
  display: flex;
  gap: 10px; /* 减小间距 */
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 450px;
}

.btn {
  padding: 12px 16px; /* 调整按钮大小 */
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px; /* 调整字体大小 */
  background-color: #f5f5f5;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #444;
  flex: 1;
  min-width: 0; /* 移除最小宽度限制 */
  max-width: none; /* 移除最大宽度限制 */
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  white-space: nowrap; /* 防止文字换行 */
}

.btn:hover {
  background-color: #ececec;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.12);
}

.btn:active {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.btn.primary {
  background-color: #4285f4;
  color: white;
  box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3);
}

.btn.primary:hover {
  background-color: #3b78e7;
  box-shadow: 0 5px 12px rgba(66, 133, 244, 0.4);
}

.solution-steps {
  width: 100%;
  max-width: 600px;
  margin-top: 35px;
  text-align: left;
  border-radius: 12px;
  padding: 25px;
  background-color: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.solution-steps::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(to bottom, #4285f4, #34a853);
}

.solution-steps:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.solution-steps h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.3rem;
  border-bottom: 2px solid #f1f1f1;
  padding-bottom: 12px;
  position: relative;
}

.solution-steps h3::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 80px;
  height: 2px;
  background-color: #4285f4;
}

.steps-container {
  max-height: 350px;
  overflow-y: auto;
  padding-right: 15px;
}

.steps-container::-webkit-scrollbar {
  width: 6px;
}

.steps-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.steps-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.steps-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.step {
  margin-bottom: 15px;
  line-height: 1.6;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.step:hover {
  background-color: #f0f0f0;
  border-left-color: #4285f4;
  transform: translateX(3px);
}

.step-number {
  font-weight: bold;
  margin-right: 10px;
  color: #4285f4;
  display: inline-block;
  min-width: 25px;
}

/* 题库样式 */
.library-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 15px 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12), 0 5px 15px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 100%;
  transition: box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  padding-bottom: 20px; /* 增加底部内边距 */
}

.library-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335);
}

.library-controls {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  width: 100%;
  justify-content: center;
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 恢复原来的间距 */
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
  padding-bottom: 30px; /* 恢复原来的底部内边距 */
}

.library-item {
  display: flex;
  background-color: #fff;
  border-radius: 10px; /* 恢复原来的圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 恢复原来的阴影 */
  overflow: hidden;
  transition: all 0.3s ease;
  flex-wrap: wrap; /* 允许在小屏幕上换行 */
  align-items: center; /* 垂直居中 */
  gap: 10px; /* 恢复原来的元素间距 */
}

.library-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.library-preview {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  margin: 10px 15px 10px 10px; /* 恢复原来的外边距 */
  border-radius: 6px; /* 恢复原来的圆角 */
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* 恢复原来的阴影 */
  background-color: #f9f9f9;
  cursor: pointer;
  padding: 8px; /* 恢复原来的内边距 */
  min-width: 120px; /* 恢复原来的最小宽度 */
  align-self: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

.preview-row {
  display: flex;
  justify-content: center;
}

.preview-cell {
  width: 12px; /* 恢复原来的单元格尺寸 */
  height: 12px; /* 恢复原来的单元格尺寸 */
  border: 1px solid #ddd; /* 恢复原来的边框 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px; /* 恢复原来的字体大小 */
  color: #333;
}

.library-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  justify-content: space-between;
  min-width: 200px; /* 设置最小宽度 */
}

.library-name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.library-difficulty {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.library-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.library-actions {
  display: flex;
  gap: 10px; /* 恢复原来的按钮间距 */
  margin-top: 10px; /* 恢复原来的顶部外边距 */
  margin-bottom: 5px; /* 恢复原来的底部外边距 */
}

.btn-action {
  padding: 8px 12px; /* 恢复原来的按钮内边距 */
  border: none;
  border-radius: 4px;
  font-size: 12px; /* 恢复原来的字体大小 */
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap; /* 防止文字换行 */
}

.btn-rename {
  background-color: #e3f2fd;
  color: #2196f3;
}

.btn-rename:hover {
  background-color: #bbdefb;
}

.btn-delete {
  background-color: #ffebee;
  color: #f44336;
}

.btn-delete:hover {
  background-color: #ffcdd2;
}

.library-empty {
  padding: 30px;
  text-align: center;
  color: #999;
  font-style: italic;
}

/* 内联步骤区域样式 */
.steps-section-inline {
  width: 100%;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.steps-section-inline h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.2rem;
}

.steps-section-inline .steps-container {
  max-height: 200px;
}

/* 移动端底部导航栏样式优化 */
.mobile-tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
  padding: 8px 0;
  border-top: 1px solid #ddd;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  z-index: 1000;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
  transition: all 0.3s ease;
  padding: 5px 0;
  width: 33.33%; /* 三个选项平均分配 */
}

.tab-item.active {
  color: #4285f4;
  transform: translateY(-2px);
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
}

@media (min-width: 768px) {
  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 20px;
  }

  .btn {
    padding: 14px 20px;
    font-size: 15px;
  }

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

  .library-section,
  .techniques-section {
    flex: 1;
    min-width: 300px;
    display: block !important;
  }

  /* 平板和桌面端显示顶部导航栏 */
  .mobile-tabbar {
    display: flex;
    position: static;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-top: none;
    border-bottom: none;
    margin-bottom: 20px;
    padding: 3px;
    background-color: #ffffff;
    border-radius: 12px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .tab-item {
    padding: 8px 15px;
    margin: 3px;
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .tab-item:hover:not(.active) {
    background-color: #f5f5f5;
    transform: translateY(-2px);
  }

  .tab-item.active {
    background-color: #4285f4;
    color: white;
    box-shadow: 0 4px 8px rgba(66, 133, 244, 0.25);
  }

  .tab-item.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
    z-index: 1;
  }

  .tab-icon {
    font-size: 18px;
    margin-bottom: 4px;
    position: relative;
    z-index: 2;
  }

  .tab-label {
    font-size: 13px;
    font-weight: 500;
    position: relative;
    z-index: 2;
  }
}

/* 预览单元格样式 */
.preview-row {
  display: flex;
  justify-content: center; /* 水平居中 */
}

.preview-cell {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  font-size: 7px;
  color: #aaa;
  background-color: #f9f9f9;
}

.preview-cell-filled {
  background-color: #e8f0fe;
  color: #4285f4 !important;
  font-weight: bold;
}

/* 技巧部分样式 */
.technique-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 10px;
  background-color: #f9f9f9;
  width: 100%;
  margin-bottom: 15px;
}

.technique-tab {
  padding: 12px 15px;
  border: none;
  background: none;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.technique-tab.active {
  color: #4285f4;
  border-bottom-color: #4285f4;
  font-weight: 500;
}

.technique-content {
  padding: 15px;
  overflow-y: auto;
  max-height: 70vh;
}

.technique-content h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.4rem;
}

.technique-difficulty {
  margin-bottom: 20px;
  font-weight: 500;
  color: #666;
}

.difficulty-level {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
}

.level-1 {
  background-color: #e8f5e9;
  color: #4caf50;
}

.level-2 {
  background-color: #e3f2fd;
  color: #2196f3;
}

.level-3 {
  background-color: #fff8e1;
  color: #ffc107;
}

.level-4 {
  background-color: #fff3e0;
  color: #ff9800;
}

.level-5 {
  background-color: #ffebee;
  color: #f44336;
}

.level-6 {
  background-color: #f3e5f5;
  color: #9c27b0;
}

.technique-description {
  margin-bottom: 25px;
  line-height: 1.6;
}

.technique-example {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  border-left: 4px solid #4285f4;
}

/* 用户输入样式 */
.user-input input, .user-input span {
  font-weight: bold;
  color: #2c3e50;
}

.user-answer input, .user-answer span {
  font-weight: bold;
  color: #4285f4;
}

.solution span {
  color: #34a853;
  font-weight: bold;
  animation: fadeIn 0.5s ease-in-out;
}

.highlight-step {
  background-color: rgba(251, 188, 5, 0.2);
  animation: highlightPulse 1.5s infinite;
}

@keyframes highlightPulse {
  0% { background-color: rgba(251, 188, 5, 0.2); }
  50% { background-color: rgba(251, 188, 5, 0.4); }
  100% { background-color: rgba(251, 188, 5, 0.2); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.sudoku-cell input:focus {
  background-color: #e8f0fe;
  box-shadow: inset 0 0 0 2px #4285f4;
  font-size: 22px;
}

/* 游戏模式切换样式 */
.game-mode-toggle {
  display: flex;
  margin-bottom: 15px;
  width: 100%;
  max-width: 450px;
  border-radius: 50px;
  overflow: hidden;
  background-color: #f5f5f5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.game-mode-toggle .mode-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.game-mode-toggle .mode-btn.active {
  background-color: #4285f4;
  color: white;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
}

.game-mode-toggle .mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 步骤控制样式 */
.step-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.step-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 20px;
  background-color: #f5f5f5;
  color: #444;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.step-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.step-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-progress {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.current-step {
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
  border-left: 3px solid #4285f4;
  border-radius: 5px;
  font-weight: 500;
  line-height: 1.6;
}

.active-step {
  background-color: #e8f0fe;
  border-left-color: #4285f4;
  transform: translateX(3px);
}

/* 响应式布局优化 */
@media (min-width: 361px) and (max-width: 374px) {
  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 16px;
  }
}

@media (min-width: 375px) and (max-width: 413px) {
  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 16px;
  }
}

@media (min-width: 414px) and (max-width: 767px) {
  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 14px;
  }

  .btn {
    padding: 10px 14px;
    font-size: 13px;
  }

  .game-section {
    padding: 15px 10px;
  }

  .library-item {
    flex-direction: row;
    justify-content: space-between;
    text-align: center;
    padding: 10px;
  }

  .library-preview {
    margin: 0;
    flex: 0 0 auto;
  }

  .library-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: auto;
    flex: 1;
    padding: 0 10px;
    text-align: left;
  }

  .library-actions {
    justify-content: flex-end;
    margin-top: 5px;
  }

  .btn-action {
    flex: 1;
    min-width: 80px;
  }
}

@media (max-width: 360px) {
  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 14px;
  }
}

.btn-clear-library {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: none;
  border-radius: 8px;
  background-color: #ffebee;
  color: #f44336;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-clear-library:hover {
  background-color: #ffcdd2;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>