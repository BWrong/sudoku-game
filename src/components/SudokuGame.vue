<template>
  <div class="sudoku-container">
    <div class="main-content">
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

        <div class="history-toggle" v-if="savedPuzzles.length > 0">
          <button @click="toggleHistory" class="btn history-btn">
            查看历史记录
          </button>
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
    </div>

    <!-- 历史记录弹窗 -->
    <div class="history-modal" v-if="showHistory" @click.self="toggleHistory">
      <div class="history-dialog">
        <div class="history-header">
          <h3>历史记录</h3>
          <button @click="toggleHistory" class="btn-close">×</button>
        </div>
        <div class="history-list">
          <div
            v-for="(puzzle, index) in savedPuzzles"
            :key="index"
            class="history-item"
            @click="loadPuzzle(index); toggleHistory();"
          >
            <div class="history-preview">
              <div v-for="(row, rowIndex) in puzzle.board" :key="'preview-row-' + rowIndex" class="preview-row">
                <div
                  v-for="(cell, colIndex) in row"
                  :key="'preview-cell-' + rowIndex + '-' + colIndex"
                  class="preview-cell"
                  :class="{'preview-cell-filled': cell.value}"
                >
                  {{ cell.value || '' }}
                </div>
              </div>
            </div>
            <div class="history-info">
              <span class="history-date">{{ formatDate(puzzle.timestamp) }}</span>
              <div class="history-actions">
                <button @click.stop="loadPuzzle(index); toggleHistory();" class="btn-action btn-load">加载</button>
                <button @click.stop="deletePuzzle(index)" class="btn-action btn-delete">删除</button>
              </div>
            </div>
          </div>
        </div>
        <div class="history-empty" v-if="savedPuzzles.length === 0">
          <p>暂无保存的题目</p>
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
      isSolved: false,
      /**
       * 是否显示历史记录
       * @type {boolean}
       */
      showHistory: false
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
     * 切换历史记录显示状态
     */
    toggleHistory() {
      this.showHistory = !this.showHistory;
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

      // 生成候选数表
      const candidates = this.generateCandidates(boardCopy);

      // 使用逻辑解法尝试求解
      if (this.solveWithLogic(boardCopy, candidates)) {
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
        // 如果逻辑解法无法完全解决，使用回溯法
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
          this.solutionSteps.push("使用回溯法完成剩余部分");
        } else {
          alert('无法解决当前数独！请检查输入是否有效。');
          this.isSolved = false;
        }
      }
    },

    /**
     * 生成候选数表
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @returns {Array<Array<Array<string>>>} 候选数表
     */
    generateCandidates(board) {
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
            this.eliminateCandidates(candidates, board[row][col].value, row, col);
          }
        }
      }

      return candidates;
    },

    /**
     * 从相关单元格中删除候选数
     * @param {Array<Array<Array<string>>>} candidates - 候选数表
     * @param {string} num - 要删除的数字
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     */
    eliminateCandidates(candidates, num, row, col) {
      // 从同行删除
      for (let i = 0; i < 9; i++) {
        const index = candidates[row][i].indexOf(num);
        if (index !== -1) {
          candidates[row][i].splice(index, 1);
        }
      }

      // 从同列删除
      for (let i = 0; i < 9; i++) {
        const index = candidates[i][col].indexOf(num);
        if (index !== -1) {
          candidates[i][col].splice(index, 1);
        }
      }

      // 从同宫格删除
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
    },

    /**
     * 使用逻辑解法求解数独
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {Array<Array<Array<string>>>} candidates - 候选数表
     * @returns {boolean} 是否完全解决
     */
    solveWithLogic(board, candidates) {
      let progress = true;
      let solved = false;

      // 当有进展时继续尝试
      while (progress) {
        progress = false;

        // 检查是否已完成
        solved = this.isBoardFilled(board);
        if (solved) break;

        // 1. 唯一候选数法
        if (this.applySingleCandidate(board, candidates)) {
          progress = true;
          continue;
        }

        // 2. 隐性唯一候选数法
        if (this.applyHiddenSingle(board, candidates)) {
          progress = true;
          continue;
        }

        // 3. 区块删减法
        if (this.applySingleSectorCandidates(board, candidates)) {
          progress = true;
          continue;
        }

        // 4. X-Wing技巧
        if (this.applyXWing(board, candidates)) {
          progress = true;
          continue;
        }

        // 5. XY-Wing技巧
        if (this.applyXYWing(board, candidates)) {
          progress = true;
          continue;
        }
      }

      return solved;
    },

    /**
     * 检查数独面板是否已填满
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @returns {boolean} 是否已填满
     */
    isBoardFilled(board) {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!board[row][col].value) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     * 应用唯一候选数法
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {Array<Array<Array<string>>>} candidates - 候选数表
     * @returns {boolean} 是否有进展
     */
    applySingleCandidate(board, candidates) {
      let progress = false;

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          // 如果单元格已有数字，跳过
          if (board[row][col].value) continue;

          // 如果只有一个候选数，填入
          if (candidates[row][col].length === 1) {
            const num = candidates[row][col][0];
            board[row][col].value = num;
            this.solutionSteps.push(`在第${row + 1}行第${col + 1}列填入数字${num}：唯一候选数法，该位置只有一个候选数 ${num}`);

            // 从相关单元格中删除该候选数
            this.eliminateCandidates(candidates, num, row, col);
            progress = true;
          }
        }
      }

      return progress;
    },

    /**
     * 应用隐性唯一候选数法
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {Array<Array<Array<string>>>} candidates - 候选数表
     * @returns {boolean} 是否有进展
     */
    applyHiddenSingle(board, candidates) {
      let progress = false;

      // 检查行
      for (let row = 0; row < 9; row++) {
        const numCount = {};
        const numPos = {};

        // 统计每个数字在行中出现的次数和位置
        for (let col = 0; col < 9; col++) {
          if (!board[row][col].value) {
            for (const num of candidates[row][col]) {
              numCount[num] = (numCount[num] || 0) + 1;
              numPos[num] = numPos[num] || [];
              numPos[num].push(col);
            }
          }
        }

        // 查找只出现一次的数字
        for (const num in numCount) {
          if (numCount[num] === 1) {
            const col = numPos[num][0];
            board[row][col].value = num;
            this.solutionSteps.push(`在第${row + 1}行第${col + 1}列填入数字${num}：隐性唯一候选数法，数字${num}在第${row + 1}行只能放在这个位置`);

            // 从相关单元格中删除该候选数
            this.eliminateCandidates(candidates, num, row, col);
            progress = true;
          }
        }
      }

      // 检查列
      for (let col = 0; col < 9; col++) {
        const numCount = {};
        const numPos = {};

        // 统计每个数字在列中出现的次数和位置
        for (let row = 0; row < 9; row++) {
          if (!board[row][col].value) {
            for (const num of candidates[row][col]) {
              numCount[num] = (numCount[num] || 0) + 1;
              numPos[num] = numPos[num] || [];
              numPos[num].push(row);
            }
          }
        }

        // 查找只出现一次的数字
        for (const num in numCount) {
          if (numCount[num] === 1) {
            const row = numPos[num][0];
            board[row][col].value = num;
            this.solutionSteps.push(`在第${row + 1}行第${col + 1}列填入数字${num}：隐性唯一候选数法，数字${num}在第${col + 1}列只能放在这个位置`);

            // 从相关单元格中删除该候选数
            this.eliminateCandidates(candidates, num, row, col);
            progress = true;
          }
        }
      }

      // 检查宫格
      for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
          const numCount = {};
          const numPos = {};

          // 统计每个数字在宫格中出现的次数和位置
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

          // 查找只出现一次的数字
          for (const num in numCount) {
            if (numCount[num] === 1) {
              const { row, col } = numPos[num][0];
              board[row][col].value = num;
              this.solutionSteps.push(`在第${row + 1}行第${col + 1}列填入数字${num}：隐性唯一候选数法，数字${num}在第${Math.floor(row / 3) + 1}行第${Math.floor(col / 3) + 1}列宫格只能放在这个位置`);

              // 从相关单元格中删除该候选数
              this.eliminateCandidates(candidates, num, row, col);
              progress = true;
            }
          }
        }
      }

      return progress;
    },

    /**
     * 应用区块删减法
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {Array<Array<Array<string>>>} candidates - 候选数表
     * @returns {boolean} 是否有进展
     */
    applySingleSectorCandidates(board, candidates) {
      let progress = false;

      // 检查行中的区块
      for (let row = 0; row < 9; row++) {
        // 按宫格分组
        const boxGroups = [[], [], []];
        for (let col = 0; col < 9; col++) {
          if (!board[row][col].value) {
            const boxIndex = Math.floor(col / 3);
            boxGroups[boxIndex].push({ col, candidates: candidates[row][col] });
          }
        }

        // 检查每个数字是否只出现在一个宫格中
        for (let num = 1; num <= 9; num++) {
          const numStr = num.toString();
          const boxWithNum = [];

          for (let i = 0; i < 3; i++) {
            let hasNum = false;
            for (const cell of boxGroups[i]) {
              if (cell.candidates.includes(numStr)) {
                hasNum = true;
                break;
              }
            }
            if (hasNum) boxWithNum.push(i);
          }

          // 如果数字只出现在一个宫格中，从该宫格的其他行中删除该数字
          if (boxWithNum.length === 1) {
            const boxIndex = boxWithNum[0];
            const boxRow = Math.floor(row / 3);
            const boxCol = boxIndex;

            let eliminated = false;
            for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
              if (r === row) continue; // 跳过当前行

              for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
                const index = candidates[r][c].indexOf(numStr);
                if (index !== -1) {
                  candidates[r][c].splice(index, 1);
                  eliminated = true;
                  this.solutionSteps.push(`从第${r + 1}行第${c + 1}列移除候选数${numStr}：区块删减法，数字${numStr}在第${row + 1}行只出现在第${boxIndex + 1}个宫格`);

                  // 如果删除后只剩一个候选数，标记有进展
                  if (candidates[r][c].length === 1 && !board[r][c].value) {
                    progress = true;
                  }
                }
              }
            }

            if (eliminated) progress = true;
          }
        }
      }

      // 检查列中的区块
      for (let col = 0; col < 9; col++) {
        // 按宫格分组
        const boxGroups = [[], [], []];
        for (let row = 0; row < 9; row++) {
          if (!board[row][col].value) {
            const boxIndex = Math.floor(row / 3);
            boxGroups[boxIndex].push({ row, candidates: candidates[row][col] });
          }
        }

        // 检查每个数字是否只出现在一个宫格中
        for (let num = 1; num <= 9; num++) {
          const numStr = num.toString();
          const boxWithNum = [];

          for (let i = 0; i < 3; i++) {
            let hasNum = false;
            for (const cell of boxGroups[i]) {
              if (cell.candidates.includes(numStr)) {
                hasNum = true;
                break;
              }
            }
            if (hasNum) boxWithNum.push(i);
          }

          // 如果数字只出现在一个宫格中，从该宫格的其他列中删除该数字
          if (boxWithNum.length === 1) {
            const boxIndex = boxWithNum[0];
            const boxRow = boxIndex;
            const boxCol = Math.floor(col / 3);

            let eliminated = false;
            for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
              if (c === col) continue; // 跳过当前列

              for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
                const index = candidates[r][c].indexOf(numStr);
                if (index !== -1) {
                  candidates[r][c].splice(index, 1);
                  eliminated = true;
                  this.solutionSteps.push(`从第${r + 1}行第${c + 1}列移除候选数${numStr}：区块删减法，数字${numStr}在第${col + 1}列只出现在第${boxIndex + 1}个宫格`);

                  // 如果删除后只剩一个候选数，标记有进展
                  if (candidates[r][c].length === 1 && !board[r][c].value) {
                    progress = true;
                  }
                }
              }
            }

            if (eliminated) progress = true;
          }
        }
      }

      return progress;
    },

    /**
     * 应用X-Wing技巧
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {Array<Array<Array<string>>>} candidates - 候选数表
     * @returns {boolean} 是否有进展
     */
    applyXWing(board, candidates) {
      let progress = false;

      // 检查行中的X-Wing
      for (let num = 1; num <= 9; num++) {
        const numStr = num.toString();

        // 找出每行中数字num的候选位置
        const rowCandidates = [];
        for (let row = 0; row < 9; row++) {
          const positions = [];
          for (let col = 0; col < 9; col++) {
            if (!board[row][col].value && candidates[row][col].includes(numStr)) {
              positions.push(col);
            }
          }
          rowCandidates.push(positions);
        }

        // 查找具有相同两个候选位置的行
        for (let row1 = 0; row1 < 8; row1++) {
          if (rowCandidates[row1].length !== 2) continue;

          for (let row2 = row1 + 1; row2 < 9; row2++) {
            if (rowCandidates[row2].length !== 2) continue;

            // 检查两行的候选位置是否相同
            if (rowCandidates[row1][0] === rowCandidates[row2][0] &&
                rowCandidates[row1][1] === rowCandidates[row2][1]) {

              const col1 = rowCandidates[row1][0];
              const col2 = rowCandidates[row1][1];

              // 从其他行的这两列中删除候选数
              let eliminated = false;
              for (let r = 0; r < 9; r++) {
                if (r === row1 || r === row2) continue;

                // 检查第一列
                const index1 = candidates[r][col1].indexOf(numStr);
                if (index1 !== -1) {
                  candidates[r][col1].splice(index1, 1);
                  eliminated = true;
                  this.solutionSteps.push(`从第${r + 1}行第${col1 + 1}列移除候选数${numStr}：X-Wing技巧，数字${numStr}在第${row1 + 1}行和第${row2 + 1}行形成X-Wing结构`);
                }

                // 检查第二列
                const index2 = candidates[r][col2].indexOf(numStr);
                if (index2 !== -1) {
                  candidates[r][col2].splice(index2, 1);
                  eliminated = true;
                  this.solutionSteps.push(`从第${r + 1}行第${col2 + 1}列移除候选数${numStr}：X-Wing技巧，数字${numStr}在第${row1 + 1}行和第${row2 + 1}行形成X-Wing结构`);
                }
              }

              if (eliminated) progress = true;
            }
          }
        }
      }

      // 检查列中的X-Wing
      for (let num = 1; num <= 9; num++) {
        const numStr = num.toString();

        // 找出每列中数字num的候选位置
        const colCandidates = [];
        for (let col = 0; col < 9; col++) {
          const positions = [];
          for (let row = 0; row < 9; row++) {
            if (!board[row][col].value && candidates[row][col].includes(numStr)) {
              positions.push(row);
            }
          }
          colCandidates.push(positions);
        }

        // 查找具有相同两个候选位置的列
        for (let col1 = 0; col1 < 8; col1++) {
          if (colCandidates[col1].length !== 2) continue;

          for (let col2 = col1 + 1; col2 < 9; col2++) {
            if (colCandidates[col2].length !== 2) continue;

            // 检查两列的候选位置是否相同
            if (colCandidates[col1][0] === colCandidates[col2][0] &&
                colCandidates[col1][1] === colCandidates[col2][1]) {

              const row1 = colCandidates[col1][0];
              const row2 = colCandidates[col1][1];

              // 从其他列的这两行中删除候选数
              let eliminated = false;
              for (let c = 0; c < 9; c++) {
                if (c === col1 || c === col2) continue;

                // 检查第一行
                const index1 = candidates[row1][c].indexOf(numStr);
                if (index1 !== -1) {
                  candidates[row1][c].splice(index1, 1);
                  eliminated = true;
                  this.solutionSteps.push(`从第${row1 + 1}行第${c + 1}列移除候选数${numStr}：X-Wing技巧，数字${numStr}在第${col1 + 1}列和第${col2 + 1}列形成X-Wing结构`);
                }

                // 检查第二行
                const index2 = candidates[row2][c].indexOf(numStr);
                if (index2 !== -1) {
                  candidates[row2][c].splice(index2, 1);
                  eliminated = true;
                  this.solutionSteps.push(`从第${row2 + 1}行第${c + 1}列移除候选数${numStr}：X-Wing技巧，数字${numStr}在第${col1 + 1}列和第${col2 + 1}列形成X-Wing结构`);
                }
              }

              if (eliminated) progress = true;
            }
          }
        }
      }

      return progress;
    },

    /**
     * 应用XY-Wing技巧
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @param {Array<Array<Array<string>>>} candidates - 候选数表
     * @returns {boolean} 是否有进展
     */
    applyXYWing(board, candidates) {
      let progress = false;

      // 查找所有具有两个候选数的单元格（双值格）
      const biValueCells = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!board[row][col].value && candidates[row][col].length === 2) {
            biValueCells.push({
              row,
              col,
              candidates: [...candidates[row][col]]
            });
          }
        }
      }

      // 对每个双值格，尝试找到XY-Wing结构
      for (let i = 0; i < biValueCells.length; i++) {
        const pivot = biValueCells[i];
        const [x, y] = pivot.candidates;

        // 查找与pivot共享一个候选数的其他双值格
        for (let j = 0; j < biValueCells.length; j++) {
          if (j === i) continue;
          const wing1 = biValueCells[j];

          // 检查wing1是否与pivot共享候选数x
          if (wing1.candidates.includes(x) && !wing1.candidates.includes(y)) {
            const z = wing1.candidates.find(c => c !== x);

            // 查找与pivot共享另一个候选数的其他双值格
            for (let k = 0; k < biValueCells.length; k++) {
              if (k === i || k === j) continue;
              const wing2 = biValueCells[k];

              // 检查wing2是否与pivot共享候选数y，并且包含z
              if (wing2.candidates.includes(y) && wing2.candidates.includes(z) && !wing2.candidates.includes(x)) {
                // 检查wing1和wing2是否能看到相同的单元格
                const commonSeenCells = this.findCommonSeenCells(wing1, wing2, board);

                // 从共同可见的单元格中删除候选数z
                for (const cell of commonSeenCells) {
                  const index = candidates[cell.row][cell.col].indexOf(z);
                  if (index !== -1) {
                    candidates[cell.row][cell.col].splice(index, 1);
                    this.solutionSteps.push(`从第${cell.row + 1}行第${cell.col + 1}列移除候选数${z}：XY-Wing技巧，枢纽位置(${pivot.row + 1},${pivot.col + 1})候选数[${x},${y}]，翼1位置(${wing1.row + 1},${wing1.col + 1})候选数[${x},${z}]，翼2位置(${wing2.row + 1},${wing2.col + 1})候选数[${y},${z}]`);
                    progress = true;
                  }
                }
              }
            }
          }

          // 检查wing1是否与pivot共享候选数y
          if (wing1.candidates.includes(y) && !wing1.candidates.includes(x)) {
            const z = wing1.candidates.find(c => c !== y);

            // 查找与pivot共享另一个候选数的其他双值格
            for (let k = 0; k < biValueCells.length; k++) {
              if (k === i || k === j) continue;
              const wing2 = biValueCells[k];

              // 检查wing2是否与pivot共享候选数x，并且包含z
              if (wing2.candidates.includes(x) && wing2.candidates.includes(z) && !wing2.candidates.includes(y)) {
                // 检查wing1和wing2是否能看到相同的单元格
                const commonSeenCells = this.findCommonSeenCells(wing1, wing2, board);

                // 从共同可见的单元格中删除候选数z
                for (const cell of commonSeenCells) {
                  const index = candidates[cell.row][cell.col].indexOf(z);
                  if (index !== -1) {
                    candidates[cell.row][cell.col].splice(index, 1);
                    this.solutionSteps.push(`从第${cell.row + 1}行第${cell.col + 1}列移除候选数${z}：XY-Wing技巧，枢纽位置(${pivot.row + 1},${pivot.col + 1})候选数[${x},${y}]，翼1位置(${wing1.row + 1},${wing1.col + 1})候选数[${y},${z}]，翼2位置(${wing2.row + 1},${wing2.col + 1})候选数[${x},${z}]`);
                    progress = true;
                  }
                }
              }
            }
          }
        }
      }

      return progress;
    },

    /**
     * 查找两个单元格共同可见的单元格
     * @param {Object} cell1 - 第一个单元格
     * @param {Object} cell2 - 第二个单元格
     * @param {Array<Array<{value: string, isUserInput: boolean, isSolution: boolean}>>} board - 数独面板
     * @returns {Array<{row: number, col: number}>} 共同可见的单元格列表
     */
    findCommonSeenCells(cell1, cell2, board) {
      const seenCells = [];

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          // 跳过已填入数字的单元格
          if (board[row][col].value) continue;

          // 跳过cell1和cell2本身
          if ((row === cell1.row && col === cell1.col) || (row === cell2.row && col === cell2.col)) continue;

          // 检查是否同时可见cell1和cell2
          const seesCell1 = this.cellsCanSeeEachOther(row, col, cell1.row, cell1.col);
          const seesCell2 = this.cellsCanSeeEachOther(row, col, cell2.row, cell2.col);

          if (seesCell1 && seesCell2) {
            seenCells.push({ row, col });
          }
        }
      }

      return seenCells;
    },

    /**
     * 检查两个单元格是否可以相互看见（在同一行、列或宫格中）
     * @param {number} row1 - 第一个单元格的行
     * @param {number} col1 - 第一个单元格的列
     * @param {number} row2 - 第二个单元格的行
     * @param {number} col2 - 第二个单元格的列
     * @returns {boolean} 是否可以相互看见
     */
    cellsCanSeeEachOther(row1, col1, row2, col2) {
      // 同一行
      if (row1 === row2) return true;

      // 同一列
      if (col1 === col2) return true;

      // 同一宫格
      const box1Row = Math.floor(row1 / 3);
      const box1Col = Math.floor(col1 / 3);
      const box2Row = Math.floor(row2 / 3);
      const box2Col = Math.floor(col2 / 3);

      return box1Row === box2Row && box1Col === box2Col;
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

.main-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  gap: 30px;
  flex-wrap: wrap;
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
  flex: 1;
  min-width: 320px;
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

/* 历史记录弹窗样式 */
.history-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.history-dialog {
  width: 100%;
  max-width: 450px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  animation: zoomIn 0.3s ease-out;
}

@keyframes zoomIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.history-dialog::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.history-section h3,
.history-dialog h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  position: relative;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f5f5f5;
  color: #555;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 60vh;
  overflow-y: auto;
  padding: 0;
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
  padding: 15px 20px;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background-color: #f9f9f9;
}

.history-preview {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  margin-right: 15px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  background-color: #f9f9f9;
}

.preview-row {
  display: flex;
}

.preview-cell {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  font-size: 8px;
  color: transparent;
  background-color: #f9f9f9;
}

.preview-cell-filled {
  background-color: #e8f0fe;
  color: #4285f4;
  font-weight: bold;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-date {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 5px 12px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-load {
  background-color: #e8f0fe;
  color: #4285f4;
}

.btn-load:hover {
  background-color: #d2e3fc;
}

.btn-delete {
  background-color: #ffebee;
  color: #f44336;
}

.btn-delete:hover {
  background-color: #ffcdd2;
}

.history-empty {
  padding: 30px;
  text-align: center;
  color: #999;
}

.history-toggle {
  margin-top: 15px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.history-btn {
  max-width: 250px;
  background-color: #f8f9fa;
  color: #4285f4;
  border: 1px solid #e0e0e0;
}

.history-btn:hover {
  background-color: #f0f0f0;
  color: #3367d6;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    align-items: center;
  }

  .history-section {
    max-width: 600px;
    margin-top: 20px;
  }

  .history-list {
    max-height: 400px;
  }
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

  .history-btn {
    max-width: 200px;
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