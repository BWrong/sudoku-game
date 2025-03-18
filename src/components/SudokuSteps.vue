<template>
  <div class="steps-section-inline" v-if="solutionSteps.length > 0">
    <h3>解题思路：</h3>

    <div class="step-controls">
      <button @click="onPrevStep" :disabled="currentStepIndex <= 0" class="step-btn">
        上一步
      </button>
      <span class="step-progress">{{ currentStepIndex + 1 }} / {{ solutionSteps.length }}</span>
      <button @click="onNextStep" :disabled="currentStepIndex >= solutionSteps.length - 1" class="step-btn">
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
        @click="onGoToStep(index)"
      >
        <span class="step-number">{{ index + 1 }}.</span> {{ step }}
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 数独解题步骤组件
 * @component SudokuSteps
 */
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  solutionSteps: {
    type: Array,
    required: true
  },
  currentStepIndex: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['prevStep', 'nextStep', 'goToStep']);

/**
 * 上一步事件
 */
const onPrevStep = () => {
  emit('prevStep');
};

/**
 * 下一步事件
 */
const onNextStep = () => {
  emit('nextStep');
};

/**
 * 转到指定步骤事件
 * @param {number} index - 步骤索引
 */
const onGoToStep = (index) => {
  emit('goToStep', index);
};
</script>

<style scoped>
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
  cursor: pointer;
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

.active-step {
  background-color: #e8f0fe;
  border-left-color: #4285f4;
  transform: translateX(3px);
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
</style>