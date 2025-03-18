<template>
  <!-- 判断是否只显示模式切换按钮 -->
  <div v-if="showModeToggleOnly" class="controls-container">
    <!-- 模式切换按钮 -->
    <div class="game-mode-toggle">
      <button
        @click="onModeChange('create')"
        class="mode-btn"
        :class="{'active': gameMode === 'create'}"
      >
        出题模式
      </button>
      <button
        @click="onModeChange('solve')"
        class="mode-btn"
        :class="{'active': gameMode === 'solve'}"
        :disabled="!hasPuzzle"
      >
        作答模式
      </button>
    </div>
  </div>

  <!-- 判断是否只显示操作按钮 -->
  <div v-else class="action-controls">
    <!-- 创建模式的操作按钮 -->
    <template v-if="gameMode === 'create'">
      <button @click="onFinishCreating" class="btn primary full-width">
        完成出题
      </button>

      <div class="secondary-controls">
        <button @click="onClearBoard" class="btn secondary">
          清空全部
        </button>
        <button @click="onGenerateRandomPuzzle" class="btn secondary">
          自动出题
        </button>
      </div>
    </template>

    <!-- 解题模式的操作按钮 -->
    <template v-else>
      <button @click="onCheckAnswer" class="btn primary full-width">
        提交答案
      </button>

      <div class="secondary-controls">
        <button @click="onClearSolution" class="btn secondary">
          清空答案
        </button>
        <button @click="onGetHint" class="btn secondary">
          查看提示
        </button>
        <button @click="onSolveSudoku" class="btn secondary">
          查看答案
        </button>
      </div>
    </template>

  </div>
</template>

<script setup>
/**
 * 数独游戏控制面板组件
 * @component SudokuControls
 */
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  /**
   * 当前游戏模式
   * @type {string}
   */
  gameMode: {
    type: String,
    required: true
  },
  /**
   * 是否有题目
   * @type {boolean}
   */
  hasPuzzle: {
    type: Boolean,
    required: true
  },
  /**
   * 是否只显示模式切换按钮
   * @type {boolean}
   */
  showModeToggleOnly: {
    type: Boolean,
    default: false
  },
  /**
   * 是否显示解决方案
   * @type {boolean}
   */
  showSolution: {
    type: Boolean,
    default: false
  },
  /**
   * 解决方案步骤
   * @type {array}
   */
  solutionSteps: {
    type: Array,
    default: []
  },
  /**
   * 当前步骤索引
   * @type {number}
   */
  currentStepIndex: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  'modeChange',
  'finishCreating',
  'clearBoard',
  'generateRandomPuzzle',
  'checkAnswer',
  'clearSolution',
  'getHint',
  'solveSudoku',
  'prevStep',
  'nextStep'
]);

/**
 * 切换游戏模式
 * @param {string} mode - 游戏模式
 */
const onModeChange = (mode) => {
  emit('modeChange', mode);
};

/**
 * 完成出题
 */
const onFinishCreating = () => {
  emit('finishCreating');
};

/**
 * 清空棋盘
 */
const onClearBoard = () => {
  emit('clearBoard');
};

/**
 * 生成随机题目
 */
const onGenerateRandomPuzzle = () => {
  emit('generateRandomPuzzle');
};

/**
 * 检查答案
 */
const onCheckAnswer = () => {
  emit('checkAnswer');
};

/**
 * 清空答案
 */
const onClearSolution = () => {
  emit('clearSolution');
};

/**
 * 获取提示
 */
const onGetHint = () => {
  emit('getHint');
};

/**
 * 解决数独
 */
const onSolveSudoku = () => {
  emit('solveSudoku');
};
</script>

<style scoped>
.controls-container, .action-controls {
  width: 100%;
  max-width: 450px;
}

.game-mode-toggle {
  display: flex;
  margin-bottom: 5px;
  width: 100%;
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

.action-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
}

.secondary-controls {
  display: flex;
  gap: 10px;
  width: 100%;
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  background-color: #f5f5f5;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #444;
  flex: 1;
  min-width: 0;
  max-width: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.btn.full-width {
  width: 100%;
}

.btn.secondary {
  padding: 10px 14px;
  font-size: 13px;
  background-color: #f0f0f0;
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

@media (max-width: 480px) {
  .btn {
    padding: 10px 14px;
    font-size: 13px;
  }
}

.solution-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.step-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-button {
  padding: 8px 12px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  background-color: #f5f5f5;
  transition: background-color 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: #444;
}

.step-button:hover {
  background-color: #ececec;
}

.step-button:active {
  background-color: #dcdcdc;
}

.step-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-indicator {
  font-size: 14px;
  font-weight: 500;
  color: #444;
}

.step-description {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #444;
}
</style>