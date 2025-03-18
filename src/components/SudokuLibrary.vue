<template>
  <div class="library-section">
    <div class="library-list" v-if="puzzleLibrary.length > 0">
      <button @click="clearLibrary" class="btn-clear-library">
        清空题库
      </button>
      <div
        v-for="(puzzle, index) in reversedPuzzles"
        :key="index"
        class="library-item"
      >
        <!-- 左侧缩略图 -->
        <div class="library-preview">
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

        <!-- 中间显示信息 -->
        <div class="library-info">
          <div class="library-difficulty">难度: {{ getDifficultyText(puzzle.difficulty) }}</div>
          <div class="library-date">{{ formatDate(puzzle.timestamp) }}</div>
        </div>

        <!-- 右侧操作按钮 -->
        <div class="library-actions">
          <button @click="loadPuzzle(originalIndex(index))" class="btn-action btn-select">选择</button>
          <button @click="deletePuzzle(originalIndex(index))" class="btn-action btn-delete">删除</button>
        </div>
      </div>
    </div>
    <div class="library-empty" v-else>
      题库为空，请添加或生成题目
    </div>
  </div>
</template>

<script setup>
/**
 * 数独题库组件
 * @component SudokuLibrary
 */
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  puzzleLibrary: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['loadPuzzle', 'deletePuzzle', 'clearLibrary']);

/**
 * 计算反转后的题目列表，使最新题目显示在最上面
 */
const reversedPuzzles = computed(() => {
  return [...props.puzzleLibrary].reverse();
});

/**
 * 获取原始索引，将反转后的索引转换回原始索引
 * @param {number} reversedIndex - 反转后的索引
 * @returns {number} - 原始索引
 */
const originalIndex = (reversedIndex) => {
  return props.puzzleLibrary.length - 1 - reversedIndex;
};

/**
 * 格式化日期
 * @param {number} timestamp - 时间戳
 * @returns {string} - 格式化的日期字符串
 */
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/**
 * 获取难度文本
 * @param {number} level - 难度等级
 * @returns {string} - 难度文本
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
 * 加载数独题目
 * @param {number} index - 题目索引
 */
const loadPuzzle = (index) => {
  emit('loadPuzzle', index);
};

/**
 * 删除数独题目
 * @param {number} index - 题目索引
 */
const deletePuzzle = (index) => {
  emit('deletePuzzle', index);
};

/**
 * 清空题库
 */
const clearLibrary = () => {
  emit('clearLibrary');
};
</script>

<style scoped>
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
  padding-bottom: 20px;
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

.btn-clear-library {
  width: auto;
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  margin-bottom: 15px;
  cursor: pointer;
  font-size: 14px;
  align-self: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.btn-clear-library:hover {
  background-color: #d32f2f;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
  padding-bottom: 30px;
}

.library-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 130px;
  width: 100%;
  padding: 10px;
}

.library-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.library-preview {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.preview-row {
  display: flex;
  justify-content: center;
}

.preview-cell {
  width: 12px;
  height: 12px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  color: #333;
}

.preview-cell-filled {
  background-color: #e8f0fe;
  font-weight: bold;
  color: #4285f4;
}

.library-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  justify-content: center;
}

.library-difficulty {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.library-date {
  font-size: 12px;
  color: #999;
}

.library-actions {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
  margin-right: 10px;
}

.btn-action {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-select {
  background-color: #e3f2fd;
  color: #2196f3;
  font-weight: 500;
}

.btn-select:hover {
  background-color: #bbdefb;
}

.btn-delete {
  background-color: #ffebee;
  color: #f44336;
  font-weight: 500;
}

.btn-delete:hover {
  background-color: #ffcdd2;
}

.library-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  font-size: 16px;
  color: #757575;
  text-align: center;
  padding: 20px;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .library-item {
    align-items: center;
    padding: 10px;
  }

  .library-actions {
    margin: 0;
    padding: 10px;
    justify-content: center;
  }

  /* .preview-cell {
    width: 10px;
    height: 10px;
    font-size: 6px;
  } */
}
</style>