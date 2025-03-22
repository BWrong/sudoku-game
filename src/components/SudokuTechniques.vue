<template>
  <div class="techniques-section">
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

      <!-- 唯一候选数法 -->
      <div v-if="currentTechniqueIndex === 0">
        <div class="technique-description">
          <p>唯一候选数法是最基本的数独解题技巧。当一个单元格只有唯一的一个数字可以填入时，我们可以确定这个单元格的值。</p>
          <p>步骤：</p>
          <ol>
            <li>找出所有已填数字在行、列和3x3宫格中的影响</li>
            <li>对于每个空格，列出所有可能的候选数</li>
            <li>如果某个空格只有一个候选数，则该数字是唯一可能的答案</li>
          </ol>
        </div>
        <div class="technique-example">
          <div class="technique-example-container">
            <p>例如：在下面的示例中，红色标记的单元格只有一个可能的候选数 5，因为其他数字都已经在同行、同列或同宫格中出现。</p>
            <table class="sudoku-example">
              <tbody>
                <tr>
                  <td>1</td><td>7</td><td class="border-right">4</td><td>3</td><td>8</td><td class="border-right">6</td><td>2</td><td>9</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td>9</td><td class="empty">-</td><td class="border-right">8</td><td>2</td><td class="empty">-</td><td class="border-right">4</td><td>3</td><td class="empty">-</td><td>6</td>
                </tr>
                <tr class="border-bottom">
                  <td class="empty">-</td><td>3</td><td class="border-right">2</td><td>9</td><td class="empty">-</td><td class="border-right">7</td><td>8</td><td>4</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td>7</td><td>9</td><td class="border-right">-</td><td>4</td><td class="empty">-</td><td class="border-right">2</td><td>5</td><td>6</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td>8</td><td class="empty">-</td><td class="border-right">6</td><td class="empty">-</td><td>9</td><td class="border-right">-</td><td>4</td><td class="empty">-</td><td>7</td>
                </tr>
                <tr class="border-bottom">
                  <td>4</td><td class="empty">-</td><td class="border-right">-</td><td>6</td><td>7</td><td class="border-right">8</td><td class="empty">-</td><td>2</td><td>9</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td>8</td><td class="border-right">9</td><td>7</td><td>4</td><td class="border-right">-</td><td>6</td><td>3</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td>6</td><td class="empty">-</td><td class="border-right">7</td><td>8</td><td class="empty">-</td><td class="border-right">3</td><td>9</td><td class="empty">-</td><td>4</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td>4</td><td class="border-right">3</td><td>5</td><td>6</td><td class="border-right">9</td><td>7</td><td>8</td><td class="empty">-</td>
                </tr>
              </tbody>
            </table>
            <p>在标记的单元格中，1-9中除了5以外的所有数字都已经在同行、同列或同宫格中出现，所以5是唯一可能的选择。</p>
          </div>
        </div>
      </div>

      <!-- 隐藏单数法 -->
      <div v-if="currentTechniqueIndex === 1">
        <div class="technique-description">
          <p>隐藏单数法是当一个数字在行、列或宫格中只有一个可能的位置时使用的技巧。</p>
          <p>步骤：</p>
          <ol>
            <li>对于每一行、列和宫格，检查1-9中的每个数字</li>
            <li>如果某个数字只能放在该行、列或宫格的一个位置，则可以确定该位置的值</li>
          </ol>
        </div>
        <div class="technique-example">
          <div class="technique-example-container">
            <p>例如：在下面的示例中，第一行中数字6只能放在红色标记的位置，因为其他位置都有冲突。</p>
            <table class="sudoku-example">
              <tbody>
                <tr>
                  <td class="empty">-</td><td>2</td><td class="border-right">3</td><td>3</td><td>5</td><td class="border-right">7</td><td>9</td><td>8</td><td class="highlight-cell">6</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td>6</td><td class="empty">-</td><td class="border-right">8</td><td>7</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr class="border-bottom">
                  <td>7</td><td>8</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td>2</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td>3</td><td class="empty">-</td><td class="border-right">8</td><td class="empty">-</td><td class="empty">-</td><td class="border-right">6</td><td class="empty">-</td><td>9</td><td>7</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="border-right empty">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr class="border-bottom">
                  <td>2</td><td>7</td><td class="border-right">6</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td>8</td><td class="empty">-</td><td>3</td>
                </tr>
                <tr>
                  <td>8</td><td class="empty">-</td><td class="border-right empty">-</td><td class="empty">-</td><td class="empty">-</td><td class="border-right">-</td><td class="empty">-</td><td>7</td><td>2</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="border-right">7</td><td>8</td><td class="empty">-</td><td class="border-right">9</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td>9</td><td>5</td><td class="border-right">2</td><td>7</td><td>6</td><td class="empty border-right">-</td><td class="">3</td><td>1</td><td class="empty">-</td>
                </tr>
              </tbody>
            </table>
            <p>虽然该单元格可能有多个候选数，但在第一行中，只有这个位置可以放6，所以必须在这里填入6。</p>
          </div>
        </div>
      </div>

      <!-- 区块摒除法 -->
      <div v-if="currentTechniqueIndex === 2">
        <div class="technique-description">
          <p>区块摒除法是利用候选数在宫格内的分布规律来减少其他行或列中的候选数。</p>
          <p>步骤：</p>
          <ol>
            <li>找出某个数字在一个宫格中只可能出现在同一行或同一列</li>
            <li>这意味着该数字在这一行或列的其他宫格中不可能出现</li>
            <li>利用这一信息排除其他位置的候选数</li>
          </ol>
        </div>
        <div class="technique-example">
          <div class="technique-example-container">
            <p>例如：在下图中，数字4在左下角的宫格中只能出现在底行（标记为黄色的单元格）。这意味着底行的其他宫格中不能有4，可以排除标记为红色的位置。</p>
            <table class="sudoku-example">
              <tbody>
                <tr>
                  <td>5</td><td>3</td><td class="empty border-right">-</td><td class="empty">-</td><td>7</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td>6</td><td class="empty">-</td><td class="empty border-right">-</td><td>1</td><td>9</td><td class="border-right">5</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr class="border-bottom">
                  <td class="empty">-</td><td>9</td><td class="border-right">8</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td>6</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td>8</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td>6</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td>3</td>
                </tr>
                <tr>
                  <td>4</td><td class="empty">-</td><td class="empty border-right">-</td><td>8</td><td class="empty">-</td><td class="border-right">3</td><td class="empty">-</td><td class="empty">-</td><td>1</td>
                </tr>
                <tr class="border-bottom">
                  <td>7</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td>2</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td>6</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td>6</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td>2</td><td>8</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td>4</td><td>1</td><td class="border-right">9</td><td class="empty">-</td><td class="empty">-</td><td>5</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="highlight-possible border-right">-</td><td class="empty">-</td><td>8</td><td class="exclude-cell border-right">-</td><td class="exclude-cell">-</td><td>7</td><td>9</td>
                </tr>
              </tbody>
            </table>
            <p>在此示例中，左下角宫格中的4只能放在底行，因此底行其他宫格中不能有4。</p>
          </div>
        </div>
      </div>

      <!-- 数对法 -->
      <div v-if="currentTechniqueIndex === 3">
        <div class="technique-description">
          <p>数对法是指在同一行、列或宫格中，如果两个单元格只有相同的两个候选数，那么这两个数字只能出现在这两个位置，其他位置不能有这两个数字。</p>
          <p>步骤：</p>
          <ol>
            <li>寻找同一行、列或宫格中只有相同两个候选数的单元格对</li>
            <li>从同一行、列或宫格的其他单元格的候选数中排除这两个数字</li>
          </ol>
        </div>
        <div class="technique-example">
          <div class="technique-example-container">
            <p>例如：如果一行中有两个单元格只包含2和5这两个候选数，那么这行中其他单元格就不可能是2或5。</p>
            <table class="sudoku-example">
              <tbody>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="empty  border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="naked-pair">[2,5]</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="naked-pair">[2,5]</td><td class="empty">-</td>
                </tr>
                <tr class="border-bottom">
                  <td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr class="border-bottom">
                  <td class="empty">-</td><td class="empty">-</td><td class="empty     border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="empty   border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
                <tr>
                  <td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty border-right">-</td><td class="empty">-</td><td class="empty">-</td><td class="empty">-</td>
                </tr>
              </tbody>
            </table>
            <p>在上面的示例中，第二行的两个单元格只可能是2或5。因此，第二行的其他单元格不可能包含2或5作为候选数。</p>
          </div>
        </div>
      </div>

      <!-- X-Wing (X翼法) -->
      <div v-if="currentTechniqueIndex === 4">
        <div class="technique-description">
          <p>X-Wing（X翼法）是一种强大的中级技巧，用于在多个行或列之间建立逻辑关系。</p>
          <p>步骤：</p>
          <ol>
            <li>找出某个数字在两行中都只有两个可能位置</li>
            <li>如果这两行中的可能位置恰好在相同的列上，形成一个矩形</li>
            <li>此时该数字必定只能出现在这个矩形的四个角上</li>
            <li>可以排除这两列中其他位置的该数字候选值</li>
          </ol>
        </div>
        <div class="technique-example">
          <div class="technique-example-container">
            <p>例如：在下面的示例中，数字7只能出现在第三行和第七行的第一列和最后一列（高亮部分）。</p>
            <table class="sudoku-example">
              <tbody>
                <tr>
                  <td>5</td><td>3</td><td class="border-right">4</td><td>6</td><td>7</td><td class="border-right">8</td><td>9</td><td>1</td><td>2</td>
                </tr>
                <tr>
                  <td>6</td><td>7</td><td class="border-right">2</td><td>1</td><td>9</td><td class="border-right">5</td><td>3</td><td>4</td><td>8</td>
                </tr>
                <tr class="border-bottom">
                  <td class="highlight-cell">-</td><td>9</td><td class="border-right">8</td><td>3</td><td>4</td><td class="border-right">2</td><td>5</td><td>6</td><td class="highlight-cell">-</td>
                </tr>
                <tr>
                  <td class="exclude-cell">-</td><td>5</td><td class="border-right">9</td><td>7</td><td>6</td><td class="border-right">1</td><td>4</td><td>2</td><td>3</td>
                </tr>
                <tr>
                  <td class="exclude-cell">-</td><td>4</td><td class="border-right">6</td><td>8</td><td>5</td><td class="border-right">3</td><td>7</td><td>9</td><td>1</td>
                </tr>
                <tr class="border-bottom">
                  <td class="exclude-cell">-</td><td>2</td><td class="border-right">1</td><td>9</td><td>8</td><td class="border-right">4</td><td>6</td><td>5</td><td class="exclude-cell">-</td>
                </tr>
                <tr>
                  <td class="highlight-cell">-</td><td>1</td><td class="border-right">5</td><td>2</td><td>3</td><td class="border-right">6</td><td>8</td><td>7</td><td class="highlight-cell">-</td>
                </tr>
                <tr>
                  <td>9</td><td>6</td><td class="border-right">3</td><td>5</td><td>1</td><td class="border-right">7</td><td>2</td><td>8</td><td>4</td>
                </tr>
                <tr>
                  <td>2</td><td>8</td><td class="border-right">7</td><td>4</td><td>2</td><td class="border-right">9</td><td>1</td><td>3</td><td>6</td>
                </tr>
              </tbody>
            </table>
            <p>因此，第一列和最后一列中的其他位置不能再有7（红色标记位置）。这些位置的7已被排除。</p>
          </div>
        </div>
      </div>

      <!-- 剑鱼法 -->
      <div v-if="currentTechniqueIndex === 5">
        <div class="technique-description">
          <p>剑鱼法（Swordfish）是X-Wing技巧的扩展版本，涉及三行三列形成的网格模式。</p>
          <p>步骤：</p>
          <ol>
            <li>找出某个数字在三行中都只有两个或三个可能位置</li>
            <li>如果这些可能位置总共只在三列中出现</li>
            <li>则该数字在这三列中只能出现在与这三行相交的位置</li>
            <li>可以排除这三列中其他位置的该数字候选值</li>
          </ol>
        </div>
        <div class="technique-example">
          <div class="technique-example-container">
            <p>例如：在下图中，数字3在三行（第二、四、八行）中只出现在三列（第三、四、七列）。</p>
            <table class="sudoku-example">
              <tbody>
                <tr>
                  <td>5</td><td>9</td><td class="border-right">1</td><td>7</td><td>4</td><td class="border-right">8</td><td>6</td><td>2</td><td>3</td>
                </tr>
                <tr>
                  <td>7</td><td>6</td><td class="border-right highlight-cell">-</td><td>1</td><td>2</td><td class="border-right">5</td><td>7</td><td>1</td><td>9</td>
                </tr>
                <tr class="border-bottom">
                  <td>2</td><td>8</td><td class="border-right">4</td><td>9</td><td>6</td><td class="border-right">1</td><td>3</td><td>5</td><td>7</td>
                </tr>
                <tr>
                  <td>1</td><td>5</td><td class="border-right highlight-cell">-</td><td>6</td><td>7</td><td class="border-right">9</td><td>8</td><td>3</td><td>8</td>
                </tr>
                <tr>
                  <td>3</td><td>7</td><td class="border-right">2</td><td>6</td><td>8</td><td class="border-right">4</td><td>5</td><td>9</td><td>1</td>
                </tr>
                <tr class="border-bottom">
                  <td>8</td><td>4</td><td class="border-right">9</td><td>5</td><td>1</td><td class="border-right">3</td><td>7</td><td>6</td><td>2</td>
                </tr>
                <tr>
                  <td>4</td><td>1</td><td class="border-right exclude-cell">-</td><td>8</td><td>5</td><td class="border-right">7</td><td>2</td><td>3</td><td>6</td>
                </tr>
                <tr>
                  <td>6</td><td>2</td><td class="border-right highlight-cell">-</td><td>3</td><td>3</td><td class="border-right">1</td><td>9</td><td>8</td><td>5</td>
                </tr>
                <tr>
                  <td>9</td><td>3</td><td class="border-right exclude-cell">-</td><td>2</td><td>9</td><td class="border-right">6</td><td>1</td><td>7</td><td>4</td>
                </tr>
              </tbody>
            </table>
            <p>因此，这三列中的其他位置（如第七行第三列和第九行第三列，标记为红色）不能再有数字3。</p>
          </div>
        </div>
      </div>

      <!-- XY-Wing (XY翼法) -->
      <div v-if="currentTechniqueIndex === 6">
        <div class="technique-description">
          <p>XY-Wing是一种基于三个单元格之间关系的技巧，这三个单元格都包含两个候选数。</p>
          <p>步骤：</p>
          <ol>
            <li>找到一个包含两个候选数的"枢纽格"（如包含XY的格子）</li>
            <li>找到两个与枢纽格有共同候选数的格子，一个共享X，一个共享Y</li>
            <li>如果这两个格子都包含一个相同的第三个候选数Z</li>
            <li>则可以排除这两个格子的共同影响范围内的Z</li>
          </ol>
        </div>
        <div class="technique-example">
          <div class="technique-example-container">
            <p>例如：下图中，D5是枢纽格，包含[2,7]；D2包含[2,9]，与枢纽格共享候选数2；B5包含[7,9]，与枢纽格共享候选数7。</p>
            <table class="sudoku-example">
              <tbody>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td class="naked-pair">[7,9]</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr class="border-bottom">
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td class="naked-pair">[2,9]</td><td class="border-right">-</td><td>-</td><td class="naked-pair">[2,7]</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td class="exclude-cell">-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr class="border-bottom">
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
              </tbody>
            </table>
            <p>B5和D2都包含9，它们共同影响到的E5格子中的9可以被排除。因为无论枢纽格D5是2还是7，两个翼格中的一个必然是9。</p>
          </div>
        </div>
      </div>

      <!-- 空矩形法 -->
      <div v-if="currentTechniqueIndex === 7">
        <div class="technique-description">
          <p>空矩形法（Empty Rectangle）是一种高级技巧，利用数字在九宫格内的特殊排列方式进行排除。</p>
          <p>步骤：</p>
          <ol>
            <li>找到一个宫内某数字只出现在某行和某列，形成一个角落（其他位置形成"空矩形"）</li>
            <li>找到与该角落同行或同列的另一处存在强链的位置</li>
            <li>通过这种连接关系，可以排除与两处位置相交的单元格中的该数字</li>
          </ol>
        </div>
        <div class="technique-example">
          <div class="technique-example-container">
            <p>例如：在下图中，中间宫（第5宫）中的数字4只出现在第5行和第6列，形成一个角落（标记为黄色）。</p>
            <table class="sudoku-example">
              <tbody>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">4</td><td >-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td >-</td><td>-</td><td>-</td>
                </tr>
                <tr class="border-bottom">
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>4</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="highlight-possible border-right">4</td><td >-</td><td>-</td><td>-</td>
                </tr>
                <tr class="border-bottom">
                  <td>4</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="exclude-cell border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td >-</td><td>-</td><td>-</td>
                </tr>
                <tr>
                  <td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td class="border-right">-</td><td>-</td><td>-</td><td>-</td>
                </tr>
              </tbody>
            </table>
            <p>第5行的数字4形成强链（只能出现在两个位置），与第6列形成连接。因此，在第7行第6列（红色位置）的4可以被排除。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 数独技巧展示组件
 * @component SudokuTechniques
 */
import { ref } from 'vue';

// 获取难度文本
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

// 当前技巧索引
const currentTechniqueIndex = ref(0);

// 数独技巧列表
const techniques = ref([
  {
    name: '唯一候选数法',
    difficulty: 1
  },
  {
    name: '隐藏单数法',
    difficulty: 2
  },
  {
    name: '区块摒除法',
    difficulty: 3
  },
  {
    name: '数对法',
    difficulty: 4
  },
  {
    name: 'X翼法',
    difficulty: 4
  },
  {
    name: '剑鱼法',
    difficulty: 5
  },
  {
    name: 'XY翼法',
    difficulty: 4
  },
  {
    name: '空矩形法',
    difficulty: 5
  }
]);
</script>

<style scoped>
/* 技巧区域样式 */
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

.techniques-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335);
}

.technique-tabs {
  display: flex;
  overflow-x: auto;
  padding: 10px;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
}

.technique-tab {
  padding: 10px 16px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.technique-tab:hover {
  background-color: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.technique-tab.active {
  background-color: #4285f4;
  color: white;
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.3);
}

.technique-content {
  padding: 0 15px 20px;
  max-width: 700px;
  margin: 0 auto;
}

.technique-content h4 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.technique-content h4:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(66, 133, 244, 0.7), transparent);
}

.technique-difficulty {
  margin-bottom: 20px;
  font-weight: 500;
  color: #666;
}

.difficulty-level {
  display: inline-block;
  padding: 4px 12px;
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

.technique-description {
  margin-bottom: 25px;
  line-height: 1.6;
  text-align: left;
}

.technique-description p, .technique-description ol, .technique-description ul {
  margin-bottom: 15px;
}

.technique-description ol, .technique-description ul {
  padding-left: 25px;
}

.technique-example {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  text-align: center;
}

/* 数独示例容器样式 */
.technique-example-container {
  background-color: #fcfcfc;
  margin: 15px auto;
  text-align: center;
  max-width: 400px;
}

.technique-example-container p {
  margin-bottom: 15px;
  line-height: 1.6;
  text-align: left;
  color: #444;
  font-size: 14px;
}

/* 数独示例表格样式 */
.sudoku-example {
  border-collapse: collapse;
  margin: 20px auto;
  border: 2px solid #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
  width: 100%;
  max-width: 340px;
}

.sudoku-example td {
  width: 32px;
  height: 32px;
  text-align: center;
  border: 1px solid #bbb;
  font-family: 'Arial', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.sudoku-example td.empty {
  color: #bbb;
  font-weight: 500;
}

.sudoku-example td.border-right {
  border-right: 2px solid #333;
}

.sudoku-example tr.border-bottom td {
  border-bottom: 2px solid #333;
}

.sudoku-example td.highlight-cell {
  background-color: rgba(239, 83, 80, 0.15);
  color: #ef5350;
  font-weight: bold;
  box-shadow: inset 0 0 0 2px #ef5350;
  animation: pulse 2s infinite;
}

.sudoku-example td.highlight-possible {
  background-color: rgba(255, 235, 59, 0.25);
  font-weight: bold;
}

.sudoku-example td.exclude-cell {
  position: relative;
  color: transparent;
}

.sudoku-example td.exclude-cell::before {
  content: '4';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: rgba(239, 83, 80, 0.7);
  font-weight: 500;
  z-index: 1;
}

.sudoku-example td.exclude-cell::after {
  content: '';
  position: absolute;
  width: 32px;
  height: 2px;
  background-color: rgba(239, 83, 80, 0.7);
  transform: translate(-50%, -50%) rotate(45deg);
  left: 50%;
  top: 50%;
  z-index: 2;
}

.sudoku-example td.naked-pair {
  background-color: rgba(66, 133, 244, 0.1);
  color: #4285f4;
  font-weight: bold;
  font-size: 12px;
  border: 1px solid rgba(66, 133, 244, 0.3);
}

@keyframes pulse {
  0% { box-shadow: inset 0 0 0 2px #ef5350; }
  50% { box-shadow: inset 0 0 0 3px #ef5350; }
  100% { box-shadow: inset 0 0 0 2px #ef5350; }
}

@media (max-width: 480px) {
  .sudoku-example {
    max-width: 280px;
  }

  .sudoku-example td {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .sudoku-example td.exclude-cell::after {
    width: 28px;
  }

  .sudoku-example td.naked-pair {
    font-size: 9px;
  }
}
</style>