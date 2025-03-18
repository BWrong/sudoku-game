<template>
  <div class="sudoku-board" :class="{'solved': showSolution && isSolved}">
    <!-- 移除调试信息 -->

    <div v-for="(row, rowIndex) in board" :key="'row-' + rowIndex" class="sudoku-row">
      <div
        v-for="(cell, colIndex) in row"
        :key="'cell-' + rowIndex + '-' + colIndex"
        class="sudoku-cell"
        :class="{
          'highlight-step': currentStepCells && currentStepCells.some(c => c.row === rowIndex && c.col === colIndex),
          'highlight-hint': highlightedCell && highlightedCell.row === rowIndex && highlightedCell.col === colIndex,
          'top-border': rowIndex % 3 === 0,
          'bottom-border': rowIndex % 3 === 2,
          'left-border': colIndex % 3 === 0,
          'right-border': colIndex % 3 === 2,
          'user-input': cell.isUserInput,
          'user-answer': cell.isUserAnswer,
          'solution': cell.isSolution
        }"
      >
        <input
          v-if="!showSolution && ((gameMode === 'create' && !cell.isUserAnswer) || (gameMode === 'solve' && !cell.isUserInput))"
          type="text"
          v-model="cell.value"
          @input="onCellInput($event, rowIndex, colIndex)"
          @focus="onCellFocus(rowIndex, colIndex)"
          maxlength="1"
          :disabled="showSolution || (gameMode === 'solve' && cell.isUserInput) || (gameMode === 'create' && cell.isUserAnswer)"
        >
        <span v-else>{{ cell.value || '' }}</span>

        <!-- 显示提示标记 -->
        <div
          v-if="highlightedCell && rowIndex === highlightedCell.row && colIndex === highlightedCell.col"
          class="hint-marker"
        ></div>
      </div>
    </div>
  </div>

  <!-- 将成功消息移出棋盘，显示在棋盘下方 -->
  <div class="success-container" v-if="showSolution && isSolved">
    <div class="confetti-container">
      <div v-for="n in 30" :key="n" class="confetti" :style="getConfettiStyle(n)"></div>
    </div>
    <div class="success-message">恭喜！数独已解决</div>
  </div>
</template>

<script setup>
/**
 * 数独棋盘组件
 * @component SudokuBoard
 */
import { defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  board: {
    type: Array,
    required: true
  },
  gameMode: {
    type: String,
    required: true
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  showSolution: {
    type: Boolean,
    default: false
  },
  highlightedCell: {
    type: Object,
    default: null
  },
  currentStepCells: {
    type: Array,
    default: null
  }
});

const emit = defineEmits(['cellInput', 'cellHover', 'cellLeave']);

// 监听高亮变化
watch(() => props.highlightedCell, (newVal) => {
  if (newVal) {
    console.log('SudokuBoard - 高亮单元格已更新:', newVal);
  }
}, { deep: true });

/**
 * 单元格输入事件
 * @param {Event} event - 输入事件
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 */
const onCellInput = (event, row, col) => {
  emit('cellInput', event, row, col);
};

/**
 * 单元格焦点事件
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 */
const onCellFocus = (row, col) => {
  // 如果该单元格是当前高亮单元格，不触发事件，保持高亮
  if (props.highlightedCell &&
      props.highlightedCell.row === row &&
      props.highlightedCell.col === col) {
    return;
  }

  // 否则正常触发悬停事件
  emit('cellHover', row, col);
};

/**
 * 获取彩带样式
 * @param {number} index - 彩带索引
 * @returns {Object} - 彩带样式对象
 */
const getConfettiStyle = (index) => {
  const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#673ab7', '#3f51b5'];
  const size = Math.floor(Math.random() * 15) + 5; // 5px - 20px
  return {
    '--size': `${size}px`,
    '--color': colors[index % colors.length],
    '--left': `${Math.random() * 100}%`,
    '--animation-duration': `${Math.random() * 3 + 2}s`,
    '--animation-delay': `${Math.random() * 2}s`
  };
};
</script>

<style scoped>
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
  border: none;
  background: transparent;
  text-align: center;
  font-size: 20px;
  font-family: 'Arial', sans-serif;
  outline: none;
  z-index: 2;
  cursor: pointer;
  caret-color: #4285f4;
  transition: all 0.2s ease;
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
  background-color: transparent; /* 移除悬停时的背景色 */
  z-index: 1;
}

.highlight-row {
  background-color: transparent; /* 移除行高亮 */
}

.highlight-col {
  background-color: transparent; /* 移除列高亮 */
}

.highlight-box {
  background-color: transparent; /* 移除宫格高亮 */
}

.highlight-same {
  background-color: transparent; /* 移除相同数字高亮 */
}

.top-border {
  border-top: 2px solid #333;
}

.bottom-border {
  border-bottom: 2px solid #333;
}

.left-border {
  border-left: 2px solid #333;
}

.right-border {
  border-right: 2px solid #333;
}

.sudoku-board.solved {
  animation: solvedPulse 1.5s ease-in-out;
}

@keyframes solvedPulse {
  0% { transform: scale(1); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
  50% { transform: scale(1.03); box-shadow: 0 15px 35px rgba(52, 168, 83, 0.3); }
  100% { transform: scale(1.01); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15); }
}

/* 将成功提示样式移出棋盘 */
.success-container {
  position: relative;
  width: 100%;
  margin-top: 10px;
  padding: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  text-align: center;
  animation: fadeIn 0.5s forwards;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.confetti {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background-color: var(--color);
  top: -20px;
  left: var(--left);
  opacity: 0;
  border-radius: 40%;
  animation: confettiFall var(--animation-duration) var(--animation-delay) infinite linear;
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
  margin: 10px 0;
  animation: successPulse 2s infinite;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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
  background-color: rgba(251, 188, 5, 0.3) !important;
  animation: highlightPulse 1.5s infinite !important;
  position: relative !important;
  z-index: 6 !important; /* 确保高于其他高亮 */
  box-shadow: inset 0 0 0 3px rgba(251, 188, 5, 0.5) !important;
}

.highlight-hint {
  /* 提示高亮 */
  background-color: rgba(251, 188, 5, 0.15) !important;
  position: relative !important;
  z-index: 5 !important;
}

@keyframes highlightPulse {
  0% { background-color: rgba(251, 188, 5, 0.3); box-shadow: inset 0 0 0 2px rgba(251, 188, 5, 0.5); }
  50% { background-color: rgba(251, 188, 5, 0.5); box-shadow: inset 0 0 0 3px rgba(251, 188, 5, 0.7); }
  100% { background-color: rgba(251, 188, 5, 0.3); box-shadow: inset 0 0 0 2px rgba(251, 188, 5, 0.5); }
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
}

@media (max-width: 360px) {
  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 14px;
  }
}

.hint-marker {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: rgba(251, 188, 5, 0.2) !important;
  box-shadow: none !important;
  animation: hintPulse 1.5s infinite !important;
  z-index: 1000 !important;
  pointer-events: none !important;
  border-radius: 0 !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}

@keyframes hintPulse {
  0% {
    background-color: rgba(251, 188, 5, 0.2) !important;
  }
  50% {
    background-color: rgba(251, 188, 5, 0.3) !important;
  }
  100% {
    background-color: rgba(251, 188, 5, 0.2) !important;
  }
}
</style>