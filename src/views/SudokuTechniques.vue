<template>
  <div class="techniques-container">
    <div class="techniques-header">
      <h2>数独解题技巧</h2>
      <p class="techniques-subtitle">掌握这些技巧，轻松解决各种难度的数独题</p>
    </div>

    <div class="techniques-content">
      <div class="technique-tabs">
        <button
          v-for="(technique, index) in techniques"
          :key="index"
          @click="currentTechniqueIndex = index"
          class="technique-tab"
          :class="{ 'active': currentTechniqueIndex === index }"
        >
          {{ technique.name }}
        </button>
      </div>

      <div class="technique-detail">
        <h3>{{ techniques[currentTechniqueIndex].name }}</h3>
        <div class="technique-difficulty">
          难度：
          <span class="difficulty-level" :class="'level-' + techniques[currentTechniqueIndex].difficulty">
            {{ getDifficultyText(techniques[currentTechniqueIndex].difficulty) }}
          </span>
        </div>
        <div class="technique-description" v-html="techniques[currentTechniqueIndex].description"></div>

        <div class="technique-example" v-if="techniques[currentTechniqueIndex].example">
          <h4>示例：</h4>
          <div v-html="techniques[currentTechniqueIndex].example"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 数独解题技巧组件
 * @component SudokuTechniques
 */
export default {
  name: 'SudokuTechniques',
  data() {
    return {
      /**
       * 当前选中的技巧索引
       * @type {number}
       */
      currentTechniqueIndex: 0,

      /**
       * 解题技巧列表
       * @type {Array<{name: string, difficulty: number, description: string, example: string}>}
       */
      techniques: [
        {
          name: '唯一候选数法',
          difficulty: 1,
          description: `
            <p>唯一候选数法（Naked Single）是最基本的数独解题技巧之一。</p>
            <p>当一个单元格只有一个可能的数字时，这个数字就是该单元格的解。</p>
            <p>步骤：</p>
            <ol>
              <li>找出每个空白单元格的所有可能数字（候选数）</li>
              <li>如果某个单元格只有一个候选数，则该数字就是这个单元格的解</li>
            </ol>
          `,
          example: `
            <p>例如，如果一个单元格的候选数只有5，那么这个单元格就应该填入5。</p>
          `
        },
        {
          name: '隐性唯一候选数法',
          difficulty: 2,
          description: `
            <p>隐性唯一候选数法（Hidden Single）是在一个行、列或宫格中，某个数字只能放在一个特定的单元格中。</p>
            <p>即使这个单元格有多个候选数，但由于这个数字在当前行、列或宫格的其他单元格都不能放置，所以它必须放在这个单元格中。</p>
            <p>步骤：</p>
            <ol>
              <li>对于每个数字（1-9），检查它在每一行、列和宫格中的可能位置</li>
              <li>如果某个数字在某一行、列或宫格中只有一个可能的位置，则该数字就是那个位置的解</li>
            </ol>
          `,
          example: `
            <p>例如，在某一行中，数字3只能放在一个特定的单元格中（因为其他位置都不能放3），那么这个单元格就应该填入3，即使这个单元格还有其他候选数。</p>
          `
        },
        {
          name: '区块删减法',
          difficulty: 3,
          description: `
            <p>区块删减法（Block and Line Interaction）利用宫格与行或列的交互关系来消除候选数。</p>
            <p>如果某个数字在一个宫格中只能出现在某一行或某一列上，那么这个数字在这一行或这一列的其他宫格中就不可能出现。</p>
            <p>步骤：</p>
            <ol>
              <li>找出某个数字在一个宫格中的所有可能位置</li>
              <li>如果这些位置都在同一行或同一列上，则这个数字在这一行或这一列的其他宫格中不可能出现</li>
            </ol>
          `,
          example: `
            <p>例如，如果在一个3×3宫格中，数字7只可能出现在该宫格的第一行，那么在其他宫格的第一行中，7就不可能出现了。</p>
            <div class="example-description">
              <p>示意图：假设在左上角的3×3宫格中，数字7只能出现在第一行的三个格子中，那么第一行其余两个3×3宫格中就不能出现数字7。</p>
            </div>
          `
        },
        {
          name: 'X-Wing技巧',
          difficulty: 4,
          description: `
            <p>X-Wing技巧适用于当某个数字在两行中都只能出现在相同的两列位置上，或者在两列中都只能出现在相同的两行位置上。</p>
            <p>这形成了一个矩形（或X形状），这个数字必须出现在这个矩形的四个角上，因此可以从其他单元格中删除这个数字作为候选数。</p>
            <p>步骤：</p>
            <ol>
              <li>找出某个数字在两行中都只能出现在相同的两列位置上（或在两列中都只能出现在相同的两行位置上）</li>
              <li>这个数字必须出现在形成的矩形的四个角上</li>
              <li>从其他可能受影响的单元格中删除这个数字作为候选数</li>
            </ol>
          `,
          example: `
            <p>例如，如果数字5在第2行和第7行都只能出现在第3列和第8列，那么在第3列和第8列的其他行中，5就不可能出现了。</p>
            <div class="example-description">
              <p>示意图：形成一个X形状的四个单元格，这四个单元格位于两行和两列的交叉点上。</p>
            </div>
          `
        },
        {
          name: 'XY-Wing技巧',
          difficulty: 5,
          description: `
            <p>XY-Wing技巧涉及三个单元格：一个"枢纽"单元格和两个"翼"单元格。</p>
            <p>枢纽单元格有两个候选数（例如XY），一个翼单元格有两个候选数（例如XZ），另一个翼单元格有两个候选数（例如YZ）。</p>
            <p>这种情况下，Z必须出现在其中一个翼单元格中，因此可以从同时能看到两个翼单元格的其他单元格中删除Z作为候选数。</p>
            <p>步骤：</p>
            <ol>
              <li>找出一个有两个候选数的单元格作为枢纽</li>
              <li>找出两个翼单元格，每个都与枢纽单元格共享一个候选数，且两个翼单元格有一个共同的候选数</li>
              <li>从同时能看到两个翼单元格的其他单元格中删除共同的候选数</li>
            </ol>
          `,
          example: `
            <p>例如，如果有一个枢纽单元格候选数为[2,7]，一个翼单元格候选数为[2,5]，另一个翼单元格候选数为[5,7]，那么在同时能看到两个翼单元格的其他单元格中，5就不可能出现了。</p>
            <div class="example-description">
              <p>示意图：三个单元格形成Y形状，枢纽单元格在中间，两个翼单元格分别与枢纽单元格相连。</p>
            </div>
          `
        },
        {
          name: '唯一矩形技巧',
          difficulty: 5,
          description: `
            <p>唯一矩形技巧（Unique Rectangle）用于避免数独有多个解的情况。</p>
            <p>如果四个单元格形成一个矩形，且其中三个单元格都只有相同的两个候选数，那么第四个单元格不能只有这两个候选数，否则会导致数独有多个解。</p>
            <p>步骤：</p>
            <ol>
              <li>找出四个单元格形成的矩形，其中三个单元格都只有相同的两个候选数</li>
              <li>第四个单元格必须包含额外的候选数，或者已经确定为一个特定的数字</li>
              <li>利用这一限制来消除候选数或确定单元格的值</li>
            </ol>
          `,
          example: `
            <p>例如，如果有四个单元格形成矩形，其中三个单元格的候选数都是[3,7]，第四个单元格的候选数是[3,7,9]，那么第四个单元格的解必须是9，以避免数独有多解。</p>
            <div class="example-description">
              <p>示意图：四个单元格形成一个矩形，其中三个单元格只有相同的两个候选数，第四个单元格有额外的候选数。</p>
            </div>
          `
        },
        {
          name: '剑鱼技巧',
          difficulty: 6,
          description: `
            <p>剑鱼技巧（Swordfish）是X-Wing技巧的扩展，涉及三行和三列（而不是两行和两列）。</p>
            <p>如果某个数字在三行中都只能出现在相同的三列位置上（或在三列中都只能出现在相同的三行位置上），那么这个数字必须出现在形成的九个交叉点中的三个点上。</p>
            <p>步骤：</p>
            <ol>
              <li>找出某个数字在三行中都只能出现在相同的三列位置上（或在三列中都只能出现在相同的三行位置上）</li>
              <li>这个数字必须出现在形成的九个交叉点中的三个点上</li>
              <li>从其他可能受影响的单元格中删除这个数字作为候选数</li>
            </ol>
          `,
          example: `
            <p>例如，如果数字6在第1、4、8行中都只能出现在第2、5、7列中，那么在第2、5、7列的其他行中，6就不可能出现了。</p>
            <div class="example-description">
              <p>示意图：三行三列形成的九个交叉点，其中某些点上的候选数形成特定模式。</p>
            </div>
          `
        },
        {
          name: '回溯法',
          difficulty: 6,
          description: `
            <p>回溯法（Backtracking）是一种通过尝试不同可能性来解决数独的方法。</p>
            <p>当其他技巧都无法继续时，可以选择一个有最少候选数的单元格，尝试其中一个候选数，然后继续解题。如果最终导致矛盾，则回溯并尝试另一个候选数。</p>
            <p>步骤：</p>
            <ol>
              <li>选择一个有最少候选数的单元格</li>
              <li>尝试其中一个候选数，并继续解题</li>
              <li>如果导致矛盾，则回溯并尝试另一个候选数</li>
              <li>重复此过程直到找到解决方案</li>
            </ol>
            <p>注意：回溯法通常是最后的手段，因为它涉及猜测和尝试，而不是纯粹的逻辑推理。</p>
          `,
          example: `
            <p>例如，当遇到一个复杂的数独，其他技巧都无法继续时，可以选择一个只有两个候选数[4,8]的单元格，先尝试填入4，如果最终导致矛盾，则回溯并尝试填入8。</p>
            <div class="example-description">
              <p>示意图：通过尝试不同的可能性，逐步排除错误选择，最终找到正确解答的过程。</p>
            </div>
          `
        }
      ]
    };
  },
  methods: {
    /**
     * 获取难度文本
     * @param {number} level - 难度级别
     * @returns {string} 难度文本
     */
    getDifficultyText(level) {
      const difficultyMap = {
        1: '简单',
        2: '基础',
        3: '中等',
        4: '进阶',
        5: '困难',
        6: '专家'
      };
      return difficultyMap[level] || '未知';
    }
  }
};
</script>

<style>
.techniques-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
  max-width: 900px;
  margin: 0 auto;
}

.techniques-header {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

.techniques-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  position: relative;
  display: inline-block;
}

.techniques-subtitle {
  color: #5d6778;
  margin-top: 10px;
  font-size: 1.1rem;
}

.techniques-content {
  display: flex;
  flex-direction: column;
}

.technique-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 15px;
  background-color: #f9f9f9;
}

.technique-tabs::-webkit-scrollbar {
  height: 4px;
}

.technique-tabs::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.technique-tabs::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.technique-tab {
  padding: 15px 20px;
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  color: #666;
  font-weight: 500;
  position: relative;
  transition: all 0.2s ease;
}

.technique-tab:hover {
  color: #4285f4;
}

.technique-tab.active {
  color: #4285f4;
  font-weight: 600;
}

.technique-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4285f4;
  border-radius: 3px 3px 0 0;
}

.technique-detail {
  padding: 30px;
  overflow-y: auto;
  max-height: 70vh;
}

.technique-detail::-webkit-scrollbar {
  width: 6px;
}

.technique-detail::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.technique-detail::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.technique-detail h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.6rem;
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

.technique-description p {
  margin-bottom: 15px;
}

.technique-description ol {
  padding-left: 20px;
}

.technique-description li {
  margin-bottom: 8px;
}

.technique-example {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  border-left: 4px solid #4285f4;
  margin-top: 20px;
}

.technique-example h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4285f4;
  font-size: 1.2rem;
}

.example-image {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.example-image img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.example-description {
  background-color: #e8f0fe;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  color: #4285f4;
  font-weight: 500;
}

@media (max-width: 768px) {
  .techniques-container {
    border-radius: 0;
  }

  .techniques-header h2 {
    font-size: 1.8rem;
  }

  .technique-detail {
    padding: 20px;
  }

  .technique-tab {
    padding: 12px 15px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .techniques-header {
    padding: 20px 15px;
  }

  .techniques-header h2 {
    font-size: 1.5rem;
  }

  .techniques-subtitle {
    font-size: 1rem;
  }

  .technique-detail {
    padding: 15px;
  }

  .technique-detail h3 {
    font-size: 1.3rem;
  }

  .technique-tab {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>