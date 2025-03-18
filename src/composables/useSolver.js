/**
 * 数独解题算法和相关逻辑
 * @module useSolver
 */
import { ref } from 'vue';

/**
 * 解题器逻辑Hook
 * @param {Object} options - 配置选项
 * @returns {Object} 返回解题器相关状态和方法
 */
export function useSolver(options) {
  const {
    board,
    hasPuzzle,
    showSolution,
    isSolved,
    currentStepCells,
    initializeBoard,
    isValid,
    isValidForGeneration
  } = options;

  // 解题步骤
  const solutionSteps = ref([]);
  const currentStepIndex = ref(0);

  /**
   * 随机生成数独题目
   * @param {number} difficulty - 难度级别
   */
  const generateRandomPuzzle = (difficulty = 2) => {
    // 初始化一个空白棋盘
    initializeBoard();

    // 辅助函数：数字数组洗牌
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // 辅助函数：生成一个完整的解决方案
    const generateSolution = (tempBoard) => {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (tempBoard[i][j] === 0) {
            const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            for (const num of nums) {
              if (isValidForGeneration(tempBoard, i, j, num)) {
                tempBoard[i][j] = num;
                if (generateSolution(tempBoard)) {
                  return true;
                }
                tempBoard[i][j] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    // 创建临时棋盘
    const tempBoard = Array(9).fill().map(() => Array(9).fill(0));

    // 生成完整解法
    generateSolution(tempBoard);

    // 根据难度确定要挖去的空格数量
    let cellsToRemove;
    switch (difficulty) {
      case 1: cellsToRemove = 45; break; // 简单
      case 2: cellsToRemove = 50; break; // 中等
      case 3: cellsToRemove = 55; break; // 困难
      case 4: cellsToRemove = 60; break; // 专家
      default: cellsToRemove = 50;
    }

    // 随机移除格子
    const cells = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        cells.push({ row: i, col: j });
      }
    }
    shuffleArray(cells);

    for (let i = 0; i < cellsToRemove; i++) {
      const { row, col } = cells[i];
      tempBoard[row][col] = 0;
    }

    // 将生成的题目应用到实际棋盘
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (tempBoard[i][j] === 0) {
          board.value[i][j].value = null;
          board.value[i][j].isUserInput = false;
        } else {
          board.value[i][j].value = tempBoard[i][j];
          board.value[i][j].isUserInput = true;
        }
      }
    }

    // 设置为有题目状态
    hasPuzzle.value = true;
  };

  /**
   * 获取解题提示
   * @returns {string} 提示文本
   */
  const getHint = () => {
    // 创建临时棋盘
    const tempBoard = Array(9).fill().map(() => Array(9).fill(0));

    // 解题步骤记录
    const steps = [];

    // 复制当前棋盘状态
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        tempBoard[i][j] = board.value[i][j].value || 0;
      }
    }

    // 检查是否有唯一可行解
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (tempBoard[i][j] === 0) {
          // 寻找可能的候选数
          const candidates = [];

          for (let num = 1; num <= 9; num++) {
            // 检查是否可以在当前位置填入num
            let isNumValid = true;

            // 检查行
            for (let k = 0; k < 9; k++) {
              if (tempBoard[i][k] === num) {
                isNumValid = false;
                break;
              }
            }

            if (!isNumValid) continue;

            // 检查列
            for (let k = 0; k < 9; k++) {
              if (tempBoard[k][j] === num) {
                isNumValid = false;
                break;
              }
            }

            if (!isNumValid) continue;

            // 检查3x3宫格
            const boxRow = Math.floor(i / 3) * 3;
            const boxCol = Math.floor(j / 3) * 3;
            for (let r = 0; r < 3; r++) {
              for (let c = 0; c < 3; c++) {
                if (tempBoard[boxRow + r][boxCol + c] === num) {
                  isNumValid = false;
                  break;
                }
              }
              if (!isNumValid) break;
            }

            if (isNumValid) {
              candidates.push(num);
            }
          }

          if (candidates.length === 1) {
            return `提示：在位置 (${i+1},${j+1}) 只有一个可能的数字 ${candidates[0]}。

唯一候选数法：该位置的其他数字都不满足数独规则，因为每行、每列、每个3x3宫格中1-9的数字不能重复出现。通过排除法，只剩下数字 ${candidates[0]} 可以填入。`;
          }
        }
      }
    }

    // 查找隐藏单数法的提示

    // 检查行的隐藏单数法
    for (let row = 0; row < 9; row++) {
      const rowCandidates = new Map();

      for (let col = 0; col < 9; col++) {
        if (tempBoard[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            // 检查是否可以在当前位置填入num
            let isNumValid = true;

            // 检查行
            for (let k = 0; k < 9; k++) {
              if (tempBoard[row][k] === num) {
                isNumValid = false;
                break;
              }
            }

            if (!isNumValid) continue;

            // 检查列
            for (let k = 0; k < 9; k++) {
              if (tempBoard[k][col] === num) {
                isNumValid = false;
                break;
              }
            }

            if (!isNumValid) continue;

            // 检查3x3宫格
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) {
              for (let c = 0; c < 3; c++) {
                if (tempBoard[boxRow + r][boxCol + c] === num) {
                  isNumValid = false;
                  break;
                }
              }
              if (!isNumValid) break;
            }

            if (isNumValid) {
              if (!rowCandidates.has(num)) {
                rowCandidates.set(num, []);
              }
              rowCandidates.get(num).push(col);
            }
          }
        }
      }

      for (const [num, positions] of rowCandidates.entries()) {
        if (positions.length === 1) {
          const col = positions[0];
          return `提示：在第 ${row+1} 行中，数字 ${num} 只能放在位置 (${row+1},${col+1})。

隐藏单数法：虽然该位置可能有多个候选数字，但数字 ${num} 在当前行中只能放在这个位置，因为其他位置都不符合规则。因此，这个位置必须填入 ${num}。`;
        }
      }
    }

    // 检查列的隐藏单数法
    for (let col = 0; col < 9; col++) {
      const colCandidates = new Map();

      for (let row = 0; row < 9; row++) {
        if (tempBoard[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            // 检查是否可以在当前位置填入num
            let isNumValid = true;

            // 检查行
            for (let k = 0; k < 9; k++) {
              if (tempBoard[row][k] === num) {
                isNumValid = false;
                break;
              }
            }

            if (!isNumValid) continue;

            // 检查列
            for (let k = 0; k < 9; k++) {
              if (tempBoard[k][col] === num) {
                isNumValid = false;
                break;
              }
            }

            if (!isNumValid) continue;

            // 检查3x3宫格
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) {
              for (let c = 0; c < 3; c++) {
                if (tempBoard[boxRow + r][boxCol + c] === num) {
                  isNumValid = false;
                  break;
                }
              }
              if (!isNumValid) break;
            }

            if (isNumValid) {
              if (!colCandidates.has(num)) {
                colCandidates.set(num, []);
              }
              colCandidates.get(num).push(row);
            }
          }
        }
      }

      for (const [num, positions] of colCandidates.entries()) {
        if (positions.length === 1) {
          const row = positions[0];
          return `提示：在第 ${col+1} 列中，数字 ${num} 只能放在位置 (${row+1},${col+1})。

隐藏单数法：虽然该位置可能有多个候选数字，但数字 ${num} 在当前列中只能放在这个位置，因为其他位置都不符合规则。因此，这个位置必须填入 ${num}。`;
        }
      }
    }

    // 检查3x3宫格的隐藏单数法
    for (let boxRowStart = 0; boxRowStart < 9; boxRowStart += 3) {
      for (let boxColStart = 0; boxColStart < 9; boxColStart += 3) {
        const boxCandidates = new Map();

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = boxRowStart + r;
            const col = boxColStart + c;

            if (tempBoard[row][col] === 0) {
              for (let num = 1; num <= 9; num++) {
                // 检查是否可以在当前位置填入num
                let isNumValid = true;

                // 检查行
                for (let k = 0; k < 9; k++) {
                  if (tempBoard[row][k] === num) {
                    isNumValid = false;
                    break;
                  }
                }

                if (!isNumValid) continue;

                // 检查列
                for (let k = 0; k < 9; k++) {
                  if (tempBoard[k][col] === num) {
                    isNumValid = false;
                    break;
                  }
                }

                if (!isNumValid) continue;

                // 检查3x3宫格
                for (let br = 0; br < 3; br++) {
                  for (let bc = 0; bc < 3; bc++) {
                    if (tempBoard[boxRowStart + br][boxColStart + bc] === num) {
                      isNumValid = false;
                      break;
                    }
                  }
                  if (!isNumValid) break;
                }

                if (isNumValid) {
                  if (!boxCandidates.has(num)) {
                    boxCandidates.set(num, []);
                  }
                  boxCandidates.get(num).push({ row, col });
                }
              }
            }
          }
        }

        for (const [num, positions] of boxCandidates.entries()) {
          if (positions.length === 1) {
            const { row, col } = positions[0];
            return `提示：在包含位置 (${boxRowStart+1},${boxColStart+1}) 的3x3宫格中，数字 ${num} 只能放在位置 (${row+1},${col+1})。

隐藏单数法：虽然该位置可能有多个候选数字，但数字 ${num} 在当前3x3宫格中只能放在这个位置，因为其他位置都不符合规则。因此，这个位置必须填入 ${num}。`;
          }
        }
      }
    }

    return '无法提供简单的提示，请尝试更高级的解题策略或使用"查看答案"功能获取完整解答。';
  };

  /**
   * 求解数独并显示步骤
   * @returns {boolean} 解题是否成功
   */
  const solveSudoku = () => {
    // 重置解题步骤
    solutionSteps.value = [];
    currentStepIndex.value = 0;
    currentStepCells.value = null;

    // 创建临时棋盘
    const tempBoard = Array(9).fill().map(() => Array(9).fill(0));

    // 复制当前棋盘状态
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        tempBoard[i][j] = board.value[i][j].value || 0;
      }
    }

    // 解题步骤记录
    const steps = [];

    // 首先检查数独是否有效
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (tempBoard[i][j] !== 0) {
          // 暂时清除这个单元格的值
          const value = tempBoard[i][j];
          tempBoard[i][j] = 0;

          // 检查是否可以放回相同的值
          let isValueValid = true;

          // 检查行
          for (let k = 0; k < 9; k++) {
            if (k !== j && tempBoard[i][k] === value) {
              isValueValid = false;
              break;
            }
          }

          if (!isValueValid) {
            console.error(`数独无效：位置(${i+1}, ${j+1})的值${value}与其他单元格冲突`);
            return false;
          }

          // 检查列
          for (let k = 0; k < 9; k++) {
            if (k !== i && tempBoard[k][j] === value) {
              isValueValid = false;
              break;
            }
          }

          if (!isValueValid) {
            console.error(`数独无效：位置(${i+1}, ${j+1})的值${value}与其他单元格冲突`);
            return false;
          }

          // 检查3x3宫格
          const boxRow = Math.floor(i / 3) * 3;
          const boxCol = Math.floor(j / 3) * 3;
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              const cellRow = boxRow + r;
              const cellCol = boxCol + c;
              if ((cellRow !== i || cellCol !== j) && tempBoard[cellRow][cellCol] === value) {
                isValueValid = false;
                break;
              }
            }
            if (!isValueValid) break;
          }

          if (!isValueValid) {
            console.error(`数独无效：位置(${i+1}, ${j+1})的值${value}与其他单元格冲突`);
            return false;
          }

          // 放回值
          tempBoard[i][j] = value;
        }
      }
    }

    // 使用唯一候选数法和隐藏单数法尝试解题
    const solveWithLogic = () => {
      let progress = true;
      let solved = false;

      while (progress && !solved) {
        progress = false;

        // 检查是否已完成
        solved = true;
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (tempBoard[i][j] === 0) {
              solved = false;
              break;
            }
          }
          if (!solved) break;
        }

        if (solved) return true;

        // 唯一候选数法
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (tempBoard[i][j] === 0) {
              const candidates = [];

              for (let num = 1; num <= 9; num++) {
                // 替换isValid调用，避免使用board.value
                let isNumValid = true;

                // 检查行
                for (let k = 0; k < 9; k++) {
                  if (tempBoard[i][k] === num) {
                    isNumValid = false;
                    break;
                  }
                }

                if (!isNumValid) continue;

                // 检查列
                for (let k = 0; k < 9; k++) {
                  if (tempBoard[k][j] === num) {
                    isNumValid = false;
                    break;
                  }
                }

                if (!isNumValid) continue;

                // 检查3x3宫格
                const boxRow = Math.floor(i / 3) * 3;
                const boxCol = Math.floor(j / 3) * 3;
                for (let r = 0; r < 3; r++) {
                  for (let c = 0; c < 3; c++) {
                    if (tempBoard[boxRow + r][boxCol + c] === num) {
                      isNumValid = false;
                      break;
                    }
                  }
                  if (!isNumValid) break;
                }

                if (isNumValid) {
                  candidates.push(num);
                }
              }

              if (candidates.length === 1) {
                tempBoard[i][j] = candidates[0];
                steps.push(`在位置 (${i+1}, ${j+1}) 填入数字 ${candidates[0]}（唯一候选数法）：该位置只有一个候选数 ${candidates[0]} 可以填入，其他数字都不符合规则。`);
                progress = true;
              }
            }
          }
        }

        if (progress) continue;

        // 隐藏单数法
        // 检查行
        for (let row = 0; row < 9; row++) {
          const digitPositions = new Map();

          for (let col = 0; col < 9; col++) {
            if (tempBoard[row][col] === 0) {
              for (let num = 1; num <= 9; num++) {
                // 检查是否可以在当前位置填入num
                let isNumValid = true;

                // 检查行
                for (let k = 0; k < 9; k++) {
                  if (tempBoard[row][k] === num) {
                    isNumValid = false;
                    break;
                  }
                }

                if (!isNumValid) continue;

                // 检查列
                for (let k = 0; k < 9; k++) {
                  if (tempBoard[k][col] === num) {
                    isNumValid = false;
                    break;
                  }
                }

                if (!isNumValid) continue;

                // 检查3x3宫格
                const gridRow = Math.floor(row / 3) * 3;
                const gridCol = Math.floor(col / 3) * 3;
                for (let r = 0; r < 3; r++) {
                  for (let c = 0; c < 3; c++) {
                    if (tempBoard[gridRow + r][gridCol + c] === num) {
                      isNumValid = false;
                      break;
                    }
                  }
                  if (!isNumValid) break;
                }

                if (isNumValid) {
                  if (!digitPositions.has(num)) {
                    digitPositions.set(num, []);
                  }
                  digitPositions.get(num).push({ row, col });
                }
              }
            }
          }

          for (const [num, positions] of digitPositions.entries()) {
            if (positions.length === 1) {
              const { row, col } = positions[0];
              tempBoard[row][col] = num;
              steps.push(`在位置 (${row+1}, ${col+1}) 填入数字 ${num}（隐藏单数法）：在第 ${row+1} 行中，数字 ${num} 只能放在这个位置，因为其他位置都不符合规则。`);
              progress = true;
            }
          }
        }

        // 检查列
        for (let col = 0; col < 9; col++) {
          const digitPositions = new Map();

          for (let row = 0; row < 9; row++) {
            if (tempBoard[row][col] === 0) {
              for (let num = 1; num <= 9; num++) {
                // 检查是否可以在当前位置填入num
                let isNumValid = true;

                // 检查行
                for (let k = 0; k < 9; k++) {
                  if (tempBoard[row][k] === num) {
                    isNumValid = false;
                    break;
                  }
                }

                if (!isNumValid) continue;

                // 检查列
                for (let k = 0; k < 9; k++) {
                  if (tempBoard[k][col] === num) {
                    isNumValid = false;
                    break;
                  }
                }

                if (!isNumValid) continue;

                // 检查3x3宫格
                const gridRow = Math.floor(row / 3) * 3;
                const gridCol = Math.floor(col / 3) * 3;
                for (let r = 0; r < 3; r++) {
                  for (let c = 0; c < 3; c++) {
                    if (tempBoard[gridRow + r][gridCol + c] === num) {
                      isNumValid = false;
                      break;
                    }
                  }
                  if (!isNumValid) break;
                }

                if (isNumValid) {
                  if (!digitPositions.has(num)) {
                    digitPositions.set(num, []);
                  }
                  digitPositions.get(num).push(row);
                }
              }
            }
          }

          for (const [num, positions] of digitPositions.entries()) {
            if (positions.length === 1) {
              const row = positions[0];
              tempBoard[row][col] = num;
              steps.push(`在位置 (${row+1}, ${col+1}) 填入数字 ${num}（隐藏单数法）：在第 ${col+1} 列中，数字 ${num} 只能放在这个位置，因为其他位置都不符合规则。`);
              progress = true;
            }
          }
        }

        // 检查3x3宫格
        for (let boxRow = 0; boxRow < 3; boxRow++) {
          for (let boxCol = 0; boxCol < 3; boxCol++) {
            const digitPositions = new Map();

            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++) {
                const row = boxRow * 3 + i;
                const col = boxCol * 3 + j;

                if (tempBoard[row][col] === 0) {
                  for (let num = 1; num <= 9; num++) {
                    // 检查是否可以在当前位置填入num
                    let isNumValid = true;

                    // 检查行
                    for (let k = 0; k < 9; k++) {
                      if (tempBoard[row][k] === num) {
                        isNumValid = false;
                        break;
                      }
                    }

                    if (!isNumValid) continue;

                    // 检查列
                    for (let k = 0; k < 9; k++) {
                      if (tempBoard[k][col] === num) {
                        isNumValid = false;
                        break;
                      }
                    }

                    if (!isNumValid) continue;

                    // 检查3x3宫格
                    const gridRow = boxRow * 3;
                    const gridCol = boxCol * 3;
                    for (let r = 0; r < 3; r++) {
                      for (let c = 0; c < 3; c++) {
                        if (tempBoard[gridRow + r][gridCol + c] === num) {
                          isNumValid = false;
                          break;
                        }
                      }
                      if (!isNumValid) break;
                    }

                    if (isNumValid) {
                      if (!digitPositions.has(num)) {
                        digitPositions.set(num, []);
                      }
                      digitPositions.get(num).push({ row, col });
                    }
                  }
                }
              }
            }

            for (const [num, positions] of digitPositions.entries()) {
              if (positions.length === 1) {
                const { row, col } = positions[0];
                tempBoard[row][col] = num;
                steps.push(`在位置 (${row+1}, ${col+1}) 填入数字 ${num}（隐藏单数法）：在第 ${Math.floor(row/3)+1}宫格中，数字 ${num} 只能放在这个位置，因为其他位置都不符合规则。`);
                progress = true;
              }
            }
          }
        }
      }

      return solved;
    };

    // 回溯法解题
    const solveWithBacktracking = (tempBoard, position = 0) => {
      if (position === 81) return true;

      const row = Math.floor(position / 9);
      const col = position % 9;

      if (tempBoard[row][col] !== 0) {
        return solveWithBacktracking(tempBoard, position + 1);
      }

      for (let num = 1; num <= 9; num++) {
        // 检查是否可以在当前位置填入num
        let isNumValid = true;

        // 检查行
        for (let i = 0; i < 9; i++) {
          if (i !== col && tempBoard[row][i] === num) {
            isNumValid = false;
            break;
          }
        }

        if (!isNumValid) continue;

        // 检查列
        for (let i = 0; i < 9; i++) {
          if (i !== row && tempBoard[i][col] === num) {
            isNumValid = false;
            break;
          }
        }

        if (!isNumValid) continue;

        // 检查3x3宫格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const r = boxRow + i;
            const c = boxCol + j;
            if ((r !== row || c !== col) && tempBoard[r][c] === num) {
              isNumValid = false;
              break;
            }
          }
          if (!isNumValid) break;
        }

        if (isNumValid) {
          tempBoard[row][col] = num;
          steps.push(`尝试在位置 (${row+1}, ${col+1}) 填入数字 ${num}（回溯法）`);

          if (solveWithBacktracking(tempBoard, position + 1)) {
            return true;
          }

          tempBoard[row][col] = 0;
          steps.push(`位置 (${row+1}, ${col+1}) 的数字 ${num} 导致后续冲突，回溯`);
        }
      }

      return false;
    };

    // 先尝试用逻辑方法解题
    let logicSolved = solveWithLogic();

    // 如果逻辑方法不能完全解决，使用回溯法
    let backtrackSolved = false;
    if (!logicSolved) {
      steps.push("使用基本逻辑方法无法完全解决，转为使用回溯法解决剩余部分。");
      steps.push("回溯法：通过尝试各种可能的数字组合，找到满足数独规则的唯一解。");
      backtrackSolved = solveWithBacktracking(tempBoard);

      if (!backtrackSolved) {
        console.error("数独无解：回溯法解题失败");
        return false;
      }
    }

    // 确认解题成功
    const solved = logicSolved || backtrackSolved;

    if (!solved) {
      console.error("数独无解：未能找到有效解");
      return false;
    }

    // 将解法应用到棋盘
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!board.value[i][j].isUserInput && !board.value[i][j].isUserAnswer) {
          board.value[i][j].value = tempBoard[i][j];
          board.value[i][j].isSolution = true;
        }
      }
    }

    // 设置解题状态
    showSolution.value = true;
    isSolved.value = true;

    // 保存解题步骤
    solutionSteps.value = [...steps, "数独已成功解决！"];

    // 更新当前步骤索引
    if (solutionSteps.value.length > 0) {
      goToStep(0);
    }

    return true;
  };

  /**
   * 切换到特定步骤
   * @param {number} index - 步骤索引
   */
  const goToStep = (index) => {
    if (index >= 0 && index < solutionSteps.value.length) {
      currentStepIndex.value = index;

      // 解析步骤文本中的单元格坐标
      const stepText = solutionSteps.value[index];
      const regex = /\((\d+),\s*(\d+)\)/g;
      const cells = [];
      let match;

      while ((match = regex.exec(stepText)) !== null) {
        // 注意：提取的坐标是从1开始的，需要转换为从0开始的索引
        const row = parseInt(match[1]) - 1;
        const col = parseInt(match[2]) - 1;

        // 检查坐标是否有效
        if (!isNaN(row) && !isNaN(col) && row >= 0 && row < 9 && col >= 0 && col < 9) {
          cells.push({ row, col });
        }
      }

      // 更新高亮单元格
      if (cells.length > 0) {
        console.log(`步骤 ${index+1}/${solutionSteps.value.length}: 高亮单元格 ${JSON.stringify(cells)}`);
        currentStepCells.value = cells;
      } else {
        console.log(`步骤 ${index+1}/${solutionSteps.value.length}: 无法找到要高亮的单元格`);
        currentStepCells.value = null;
      }
    }
  };

  /**
   * 前一步
   */
  const prevStep = () => {
    if (currentStepIndex.value > 0) {
      // 不要清除高亮，直接跳转到上一步
      goToStep(currentStepIndex.value - 1);
    }
  };

  /**
   * 后一步
   */
  const nextStep = () => {
    if (currentStepIndex.value < solutionSteps.value.length - 1) {
      // 不要清除高亮，直接跳转到下一步
      goToStep(currentStepIndex.value + 1);
    }
  };

  return {
    solutionSteps,
    currentStepIndex,
    generateRandomPuzzle,
    getHint,
    solveSudoku,
    goToStep,
    prevStep,
    nextStep
  };
}