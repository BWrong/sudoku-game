<template>
  <div class="mobile-tabbar">
    <div
      class="tab-item"
      :class="{'active': activeTab === 'game'}"
      @click="onTabChange('game')"
    >
      <div class="tab-icon">🎮</div>
      <div class="tab-label">游戏</div>
    </div>
    <div
      class="tab-item"
      :class="{'active': activeTab === 'library'}"
      @click="onTabChange('library')"
    >
      <div class="tab-icon">📚</div>
      <div class="tab-label">题库</div>
    </div>
    <div
      class="tab-item"
      :class="{'active': activeTab === 'techniques'}"
      @click="onTabChange('techniques')"
    >
      <div class="tab-icon">💡</div>
      <div class="tab-label">技巧</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 数独导航栏组件
 * @component SudokuNavbar
 */
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['tabChange']);

/**
 * 标签页改变事件
 * @param {string} tab - 标签页名称
 */
const onTabChange = (tab) => {
  emit('tabChange', tab);
};
</script>

<style scoped>
/* 移动端底部导航栏样式优化 */
.mobile-tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
  padding: 8px 0;
  border-top: 1px solid #ddd;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  z-index: 1000;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
  transition: all 0.3s ease;
  padding: 5px 0;
  width: 33.33%; /* 三个选项平均分配 */
  cursor: pointer;
}

.tab-item.active {
  color: #4285f4;
  transform: translateY(-2px);
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
}

@media (min-width: 768px) {
  /* 平板和桌面端显示顶部导航栏 */
  .mobile-tabbar {
    display: flex;
    position: static;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-top: none;
    border-bottom: none;
    margin-bottom: 20px;
    padding: 3px;
    background-color: #ffffff;
    border-radius: 12px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .tab-item {
    padding: 8px 15px;
    margin: 3px;
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .tab-item:hover:not(.active) {
    background-color: #f5f5f5;
    transform: translateY(-2px);
  }

  .tab-item.active {
    background-color: #4285f4;
    color: white;
    box-shadow: 0 4px 8px rgba(66, 133, 244, 0.25);
  }

  .tab-item.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
    z-index: 1;
  }

  .tab-icon {
    font-size: 18px;
    margin-bottom: 4px;
    position: relative;
    z-index: 2;
  }

  .tab-label {
    font-size: 13px;
    font-weight: 500;
    position: relative;
    z-index: 2;
  }
}

@media (max-width: 767px) {
  .mobile-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>