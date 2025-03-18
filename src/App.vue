<template>
  <div class="app-container">
    <div class="background-pattern"></div>
    <div class="app-header">
      <h1>数独游戏</h1>
      <p class="subtitle">挑战你的逻辑思维能力</p>
    </div>
    <SudokuGame />
    <footer class="app-footer">
      <p>© 2025 数独游戏 - 享受解谜的乐趣</p>
    </footer>
  </div>
</template>

<script>
/**
 * 应用主组件
 * @component App
 */
import SudokuGame from './views/SudokuGame.vue';

export default {
  name: 'App',
  components: {
    SudokuGame
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #333;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%),
    radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%);
  background-size: 100px 100px;
  pointer-events: none;
  z-index: 0;
  animation: patternFade 1.5s ease-out;
}

@keyframes patternFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.app-header:after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(66, 133, 244, 0.8), transparent);
  border-radius: 3px;
  animation: expandWidth 0.8s ease-out 0.3s forwards;
}

@keyframes expandWidth {
  from { width: 0; }
  to { width: 100px; }
}

h1 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 2.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  display: inline-block;
}

h1:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(66, 133, 244, 0.5), transparent);
  animation: expandWidth 0.6s ease-out 0.5s forwards;
}

.subtitle {
  color: #5d6778;
  font-size: 1.1rem;
  margin-top: 5px;
  opacity: 0;
  animation: fadeIn 0.6s ease-out 0.4s forwards;
}

.app-nav {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.nav-link {
  display: inline-block;
  padding: 8px 20px;
  background-color: #4285f4;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
}

.nav-link:hover {
  background-color: #3367d6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
}

.router-link-active {
  background-color: #3367d6;
  box-shadow: 0 2px 5px rgba(51, 103, 214, 0.5);
}

.app-footer {
  margin-top: auto;
  text-align: center;
  padding: 20px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  position: relative;
  animation: fadeIn 0.6s ease-out 0.8s forwards;
}

.app-footer:before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
}

@media (max-width: 768px) {
  .app-container {
    padding: 15px;
  }

  h1 {
    font-size: 2rem;
  }

  .app-nav {
    flex-direction: column;
    gap: 10px;
  }
}
</style>