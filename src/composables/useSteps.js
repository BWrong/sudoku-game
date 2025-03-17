/**
 * 解题步骤管理
 * @file useSteps.js
 */
import { ref, watch } from 'vue';

/**
 * 解题步骤管理
 * @param {Object} solutionStepsRef - 解题步骤数组的ref
 * @param {Object} currentStepCellsRef - 当前步骤高亮单元格的ref
 * @returns {Object} 步骤相关状态和方法
 */
export function useSteps(solutionStepsRef, currentStepCellsRef) {
  // 当前步骤索引
  const currentStepIndex = ref(0);

  // 监听解题步骤变化，重置当前步骤索引
  watch(solutionStepsRef, () => {
    currentStepIndex.value = 0;
    updateStepHighlight();
  });

  /**
   * 前往指定步骤
   * @param {number} index - 步骤索引
   */
  const goToStep = (index) => {
    if (index < 0 || index >= solutionStepsRef.value.length) return;

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
    if (currentStepIndex.value < solutionStepsRef.value.length - 1) {
      currentStepIndex.value++;
      updateStepHighlight();
    }
  };

  /**
   * 更新步骤高亮
   */
  const updateStepHighlight = () => {
    if (!solutionStepsRef.value.length) return;

    // 解析当前步骤，找出涉及的单元格
    const step = solutionStepsRef.value[currentStepIndex.value];

    // 重置高亮单元格
    currentStepCellsRef.value = [];

    // 解析步骤文本，查找行列信息
    // 例如："在第3行第5列填入数字7"
    const rowMatch = step.match(/第(\d+)行/);
    const colMatch = step.match(/第(\d+)列/);

    if (rowMatch && colMatch) {
      const row = parseInt(rowMatch[1]) - 1;
      const col = parseInt(colMatch[1]) - 1;

      if (row >= 0 && row < 9 && col >= 0 && col < 9) {
        currentStepCellsRef.value.push({ row, col });
      }
    }
  };

  return {
    currentStepIndex,
    goToStep,
    prevStep,
    nextStep,
    updateStepHighlight
  };
}