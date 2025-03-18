# 数独游戏 (Sudoku Game)

一个基于Vue 3的现代数独游戏应用，具有丰富的功能和美观的用户界面。

## 🌟 功能特点

- 🎮 多种游戏模式：玩家模式和创作模式
- 🧩 智能数独生成器：自动生成不同难度级别的数独题目
- 🧠 高级解题器：可以解决任何有效的数独题目
- 📚 题库系统：保存和管理您最喜欢的数独题目
- 🔍 步骤解析：查看解题过程的详细步骤和解释
- 💡 提示系统：在遇到困难时获取提示
- 📱 响应式设计：适配各种屏幕尺寸
- ✨ 动画效果：平滑过渡和视觉反馈

## 📋 技术栈

- Vue 3 (Composition API)
- Vite 构建工具
- 原生CSS动画和过渡
- 本地存储实现题库功能

## 🚀 快速开始

### 前置要求

- Node.js (>= 14.0.0)
- npm 或 yarn

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/sudoku-game.git
cd sudoku-game
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

4. 在浏览器中访问
```
http://localhost:5173
```

## 📦 构建生产版本

```bash
npm run build
# 或
yarn build
```

生成的文件将位于 `dist` 目录中。

## 🎯 游戏玩法

1. **玩家模式**：解答已生成的数独题目
   - 选择难度级别生成新题目
   - 使用提示功能获取帮助
   - 检查答案是否正确
   - 查看完整解决方案和解题步骤

2. **创作模式**：创建自己的数独题目
   - 手动设置初始数字
   - 验证题目是否有效
   - 保存到题库中供以后使用

## 📝 项目结构

```
sudoku-game/
├── public/             # 静态资源
├── src/
│   ├── assets/         # 图片和样式资源
│   ├── components/     # Vue组件
│   ├── composables/    # 组合式API
│   │   ├── useGameBoard.js    # 游戏面板管理
│   │   ├── useHighlight.js    # 单元格高亮效果
│   │   ├── usePuzzleLibrary.js # 题库管理
│   │   ├── useSolver.js       # 数独解题算法
│   │   ├── useSteps.js        # 解题步骤管理
│   │   └── useUI.js           # UI状态管理
│   ├── views/          # 页面视图组件
│   ├── App.vue         # 主应用组件
│   └── main.js         # 应用入口
├── index.html          # HTML模板
├── vite.config.js      # Vite配置
├── package.json        # 项目依赖和脚本
└── README.md           # 项目文档
```

## 🧩 数独解题算法

本应用实现了多种数独解题技巧，包括：

- 单个候选值法
- 唯一候选值法
- 候选区域缩减
- 隐藏单数法
- 隐藏双数法
- X翼法
- Y翼法
- 简单色法
- 强制链
- 回溯法

## 📱 本地存储

项目使用浏览器本地存储来保存：

- 用户创建的数独题目
- 游戏进度和设置
- 解题记录

## 📜 开源协议

ISC