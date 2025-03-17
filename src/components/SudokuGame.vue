<template>
  <div class="sudoku-container">
    <div class="game-section">
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
              'solution': cell.isSolution,
              'highlight-row': highlightedCell && highlightedCell.row === rowIndex,
              'highlight-col': highlightedCell && highlightedCell.col === colIndex,
              'highlight-box': highlightedCell && Math.floor(highlightedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(highlightedCell.col / 3) === Math.floor(colIndex / 3),
              'highlight-same': highlightedCell && cell.value && cell.value === board[highlightedCell.row][highlightedCell.col].value
            }"
            @mouseenter="highlightCell(rowIndex, colIndex)"
            @mouseleave="clearHighlight"
          >
            <input
              v-if="!showSolution"
              type="text"
              v-model="cell.value"
              @input="validateInput($event, rowIndex, colIndex)"
              @focus="highlightCell(rowIndex, colIndex)"
              maxlength="1"
              :disabled="cell.isUserInput && showSolution"
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
        <button @click="clearBoard" class="btn">
          清空全部
        </button>
        <button @click="clearSolution" class="btn">
          清空答案
        </button>
        <button @click="savePuzzle" class="btn">
          暂存题目
        </button>
        <button @click="solveSudoku" class="btn primary">
          求解
        </button>
      </div>
    </div>

    <div class="history-section" v-if="savedPuzzles.length > 0">
      <h3>历史记录</h3>
      <div class="history-list">
        <div
          v-for="(puzzle, index) in savedPuzzles"
          :key="index"
          class="history-item"
          @click="loadPuzzle(index)"
        >
          <div class="history-preview">
            <div v-for="(row, rowIndex) in puzzle.board" :key="'preview-row-' + rowIndex" class="preview-row">
              <div
                v-for="(cell, colIndex) in row"
                :key="'preview-cell-' + rowIndex + '-' + colIndex"
                class="preview-cell"
              >
                {{ cell.value || '' }}
              </div>
            </div>
          </div>
          <div class="history-info">
            <span class="history-date">{{ formatDate(puzzle.timestamp) }}</span>
            <button @click.stop="deletePuzzle(index)" class="btn-delete">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSolution && solutionSteps.length > 0" class="solution-steps">
      <h3>解题思路：</h3>
      <div class="steps-container">
        <div v-for="(step, index) in solutionSteps" :key="index" class="step">
          <span class="step-number">{{ index + 1 }}.</span> {{ step }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 数独游戏组件
 * @component SudokuGame
 */
export default {
  name: 'SudokuGame',
  data() {
    return {
      /**
       * 数独游戏面板
       * @type {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>}
       */
      board: [],
      /**
       * 是否显示解决方案
       * @type {boolean}
       */
      showSolution: false,
      /**
       * 解题步骤
       * @type {Array<string>}
       */
      solutionSteps: [],
      /**
       * 保存的数独题目列表
       * @type {Array<{board: Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>, timestamp: number}>}
       */
      savedPuzzles: [],
      /**
       * 当前高亮的单元格
       * @type {Object|null}
       */
      highlightedCell: null,
      /**
       * 是否已解决
       * @type {boolean}
       */
      isSolved: false
    };
  },
  created() {
    this.initializeBoard();
    this.loadSavedPuzzles();
  },
  methods: {
    /**
     * 初始化数独面板
     */
    initializeBoard() {
      this.board = Array(9).fill().map(() =>
        Array(9).fill().map(() => ({
          value: '',
          isUserInput: false,
          isSolution: false
        }))
      );
      this.showSolution = false;
      this.solutionSteps = [];
      this.highlightedCell = null;
      this.isSolved = false;
    },

    /**
     * 高亮单元格
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     */
    highlightCell(row, col) {
      this.highlightedCell = { row, col };
    },

    /**
     * 清除高亮
     */
    clearHighlight() {
      this.highlightedCell = null;
    },

    /**
     * 获取五彩纸屑样式
     * @param {number} index - 索引
     * @returns {Object} 样式对象
     */
    getConfettiStyle(index) {
      const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4'];
      const size = Math.floor(Math.random() * 10) + 5;
      const color = colors[index % colors.length];
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 3;
      const animationDuration = Math.random() * 3 + 3;

      return {
        '--size': `${size}px`,
        '--color': color,
        '--left': `${left}%`,
        '--animation-delay': `${animationDelay}s`,
        '--animation-duration': `${animationDuration}s`
      };
    },

    /**
     * 验证用户输入
     * @param {Event} event - 输入事件
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     */
    validateInput(event, row, col) {
      const value = event.target.value;

      // 只允许输入1-9的数字
      if (value && !/^[1-9]$/.test(value)) {
        this.board[row][col].value = '';
        return;
      }

      if (value) {
        this.board[row][col].isUserInput = true;
      } else {
        this.board[row][col].isUserInput = false;
      }
    },

    /**
     * 清空数独面板（全部清空）
     */
    clearBoard() {
      this.initializeBoard();
    },

    /**
     * 清空答案（保留题目）
     */
    clearSolution() {
      // 保留用户输入的题目，清除解答
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (!this.board[i][j].isUserInput) {
            this.board[i][j].value = '';
            this.board[i][j].isSolution = false;
          }
        }
      }
      this.showSolution = false;
      this.solutionSteps = [];
      this.isSolved = false;
    },

    /**
     * 暂存当前题目到localStorage
     */
    savePuzzle() {
      // 检查是否有题目输入
      let hasInput = false;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (this.board[i][j].isUserInput) {
            hasInput = true;
            break;
          }
        }
        if (hasInput) break;
      }

      if (!hasInput) {
        alert('请先输入题目再保存！');
        return;
      }

      // 创建题目的副本（只保存用户输入的部分）
      const puzzleCopy = {
        board: this.board.map(row =>
          row.map(cell => ({
            value: cell.isUserInput ? cell.value : '',
            isUserInput: cell.isUserInput,
            isSolution: false
          }))
        ),
        timestamp: Date.now()
      };

      // 添加到保存列表
      this.savedPuzzles.unshift(puzzleCopy);

      // 限制保存数量，最多保存10个
      if (this.savedPuzzles.length > 10) {
        this.savedPuzzles.pop();
      }

      // 保存到localStorage
      this.savePuzzlesToStorage();

      alert('题目已保存！');
    },

    /**
     * 将保存的题目列表存储到localStorage
     */
    savePuzzlesToStorage() {
      try {
        localStorage.setItem('sudoku-puzzles', JSON.stringify(this.savedPuzzles));
      } catch (e) {
        console.error('保存题目到localStorage失败:', e);
      }
    },

    /**
     * 从localStorage加载保存的题目列表
     */
    loadSavedPuzzles() {
      try {
        const savedData = localStorage.getItem('sudoku-puzzles');
        if (savedData) {
          this.savedPuzzles = JSON.parse(savedData);
        }
      } catch (e) {
        console.error('从localStorage加载题目失败:', e);
        this.savedPuzzles = [];
      }
    },

    /**
     * 加载指定的历史题目
     * @param {number} index - 题目索引
     */
    loadPuzzle(index) {
      if (index >= 0 && index < this.savedPuzzles.length) {
        // 清空当前面板
        this.clearBoard();

        // 加载保存的题目
        const savedPuzzle = this.savedPuzzles[index];
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (savedPuzzle.board[i][j].value) {
              this.board[i][j].value = savedPuzzle.board[i][j].value;
              this.board[i][j].isUserInput = true;
            }
          }
        }
      }
    },

    /**
     * 删除指定的历史题目
     * @param {number} index - 题目索引
     */
    deletePuzzle(index) {
      if (index >= 0 && index < this.savedPuzzles.length) {
        this.savedPuzzles.splice(index, 1);
        this.savePuzzlesToStorage();
      }
    },

    /**
     * 格式化日期
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },

    /**
     * 求解数独
     */
    solveSudoku() {
      // 复制当前面板状态
      const boardCopy = this.board.map(row =>
        row.map(cell => ({...cell}))
      );

      // 重置解题步骤
      this.solutionSteps = [];

      // 尝试求解
      if (this.solve(boardCopy, 0, 0)) {
        // 更新面板显示解决方案
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (!this.board[i][j].isUserInput) {
              this.board[i][j].value = boardCopy[i][j].value;
              this.board[i][j].isSolution = true;
            }
          }
        }
        this.showSolution = true;
        this.isSolved = true;
      } else {
        alert('无法解决当前数独！请检查输入是否有效。');
        this.isSolved = false;
      }
    },

    /**
     * 递归求解数独算法
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {number} row - 当前行
     * @param {number} col - 当前列
     * @returns {boolean} 是否成功求解
     */
    solve(board, row, col) {
      // 如果已经到了最后一行之后，说明解决完成
      if (row === 9) {
        return true;
      }

      // 计算下一个单元格位置
      const nextRow = col === 8 ? row + 1 : row;
      const nextCol = col === 8 ? 0 : col + 1;

      // 如果当前单元格已有数字，则跳到下一个
      if (board[row][col].value !== '') {
        return this.solve(board, nextRow, nextCol);
      }

      // 尝试填入1-9
      for (let num = 1; num <= 9; num++) {
        if (this.isValid(board, row, col, num.toString())) {
          board[row][col].value = num.toString();

          // 记录解题步骤，包含推导过程
          const validationInfo = this.getValidationInfo(board, row, col, num.toString());
          this.solutionSteps.push(`在第${row + 1}行第${col + 1}列填入数字${num}：${validationInfo}`);

          // 递归解决下一个单元格
          if (this.solve(board, nextRow, nextCol)) {
            return true;
          }

          // 如果无法解决，回溯
          board[row][col].value = '';
          this.solutionSteps.pop();
        }
      }

      return false;
    },

    /**
     * 获取验证信息，用于解释推导过程
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {string} num - 填入的数字
     * @returns {string} 验证信息
     */
    getValidationInfo(board, row, col, num) {
      // 收集当前行已有的数字
      const rowNums = [];
      for (let i = 0; i < 9; i++) {
        if (board[row][i].value && i !== col) {
          rowNums.push(board[row][i].value);
        }
      }

      // 收集当前列已有的数字
      const colNums = [];
      for (let i = 0; i < 9; i++) {
        if (board[i][col].value && i !== row) {
          colNums.push(board[i][col].value);
        }
      }

      // 收集当前3x3宫格已有的数字
      const boxNums = [];
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[boxRow + i][boxCol + j].value && (boxRow + i !== row || boxCol + j !== col)) {
            boxNums.push(board[boxRow + i][boxCol + j].value);
          }
        }
      }

      // 计算该位置的候选数字
      const candidates = [];
      for (let n = 1; n <= 9; n++) {
        const numStr = n.toString();
        if (!rowNums.includes(numStr) && !colNums.includes(numStr) && !boxNums.includes(numStr)) {
          candidates.push(numStr);
        }
      }

      // 构建推导说明
      let info = `经分析，该位置的候选数字为 [${candidates.join(', ')}]`;

      if (rowNums.length > 0) {
        info += `，第${row + 1}行已有数字 [${rowNums.join(', ')}]`;
      }

      if (colNums.length > 0) {
        info += `，第${col + 1}列已有数字 [${colNums.join(', ')}]`;
      }

      if (boxNums.length > 0) {
        info += `，当前宫格已有数字 [${boxNums.join(', ')}]`;
      }

      if (candidates.length === 1) {
        info += `，因此只能填入 ${num}`;
      } else {
        info += `，尝试填入 ${num} 并继续求解`;
      }

      return info;
    },

    /**
     * 检查在指定位置填入数字是否有效
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {string} num - 要填入的数字
     * @returns {boolean} 是否有效
     */
    isValid(board, row, col, num) {
      // 检查同一行
      for (let i = 0; i < 9; i++) {
        if (board[row][i].value === num) {
          return false;
        }
      }

      // 检查同一列
      for (let i = 0; i < 9; i++) {
        if (board[i][col].value === num) {
          return false;
        }
      }

      // 检查同一个3x3宫格
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[boxRow + i][boxCol + j].value === num) {
            return false;
          }
        }
      }

      return true;
    }
  }
};
</script>

<style scoped>
.sudoku-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  width: 100%;
}

.game-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12), 0 5px 15px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 600px;
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

.game-section:hover {
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.15), 0 8px 18px rgba(0, 0, 0, 0.08);
}

.sudoku-board {
  display: flex;
  flex-direction: column;
  border: 2px solid #333;
  margin-bottom: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.sudoku-board:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.sudoku-row {
  display: flex;
}

.sudoku-cell {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  position: relative;
  transition: all 0.2s ease;
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

.sudoku-cell input {
  width: 100%;
  height: 100%;
  border: none;
  text-align: center;
  font-size: 22px;
  background: transparent;
  outline: none;
  color: #2c3e50;
  transition: all 0.3s ease;
  font-family: 'Arial', sans-serif;
}

.sudoku-cell input:focus {
  background-color: #e8f0fe;
  box-shadow: inset 0 0 0 2px #4285f4;
  font-size: 24px;
}

.sudoku-cell span {
  font-size: 22px;
  font-family: 'Arial', sans-serif;
}

.user-input input, .user-input span {
  font-weight: bold;
  color: #2c3e50;
}

.solution span {
  color: #34a853;
  font-weight: bold;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 600px;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  background-color: #f5f5f5;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #444;
  flex: 1;
  min-width: 120px;
  max-width: 200px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
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

/* 历史记录样式 */
.history-section {
  width: 100%;
  max-width: 600px;
  margin-top: 35px;
  margin-bottom: 35px;
  text-align: left;
}

.history-section h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
  font-size: 1.3rem;
  position: relative;
}

.history-section h3:after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4285f4, #34a853);
  border-radius: 3px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 18px;
  border-radius: 12px;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.history-item:hover {
  background-color: #f9f9f9;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.history-preview {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  margin-right: 25px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.history-item:hover .history-preview {
  transform: none;
}

.preview-row {
  display: flex;
}

.preview-cell {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  font-size: 9px;
  color: #555;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-date {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.btn-delete {
  align-self: flex-start;
  padding: 6px 12px;
  border: none;
  border-radius: 50px;
  background-color: #ff4d4f;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 3px 8px rgba(255, 77, 79, 0.2);
  display: flex;
  align-items: center;
}

.btn-delete:hover {
  background-color: #ff7875;
  box-shadow: 0 4px 10px rgba(255, 77, 79, 0.3);
}

.btn-delete:active {
  box-shadow: 0 2px 5px rgba(255, 77, 79, 0.2);
}

@media (max-width: 768px) {
  .sudoku-cell {
    width: 40px;
    height: 40px;
  }

  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 16px;
  }

  .controls {
    gap: 10px;
  }

  .btn {
    padding: 12px 16px;
    font-size: 14px;
    min-width: 100px;
  }

  .game-section {
    padding: 20px;
  }

  .solution-steps,
  .history-section {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .sudoku-cell {
    width: 32px;
    height: 32px;
  }

  .sudoku-cell input,
  .sudoku-cell span {
    font-size: 14px;
  }

  .btn {
    padding: 10px 14px;
    font-size: 13px;
    min-width: 80px;
  }

  .game-section {
    padding: 15px;
  }

  .history-preview {
    margin-right: 15px;
  }

  .history-item {
    padding: 12px;
  }
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
</style>