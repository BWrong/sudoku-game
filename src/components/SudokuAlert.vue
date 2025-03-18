<template>
  <div class="custom-alert" v-if="show">
    <div class="alert-content">
      <div class="alert-icon" :class="type">
        <span v-if="type === 'success'">✓</span>
        <span v-else-if="type === 'error'">✖</span>
        <span v-else-if="type === 'info'">ℹ</span>
        <span v-else-if="type === 'hint'">💡</span>
      </div>
      <div class="alert-message">{{ message }}</div>
      <div class="alert-buttons">
        <button class="alert-button" @click="onConfirm">确定</button>
        <button v-if="hasCallback" class="alert-button cancel" @click="onCancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 数独自定义弹窗组件
 * @component SudokuAlert
 */
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info'
  },
  hasCallback: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

/**
 * 确认按钮点击事件
 */
const onConfirm = () => {
  emit('confirm');
};

/**
 * 取消按钮点击事件
 */
const onCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
/* 自定义弹窗样式 */
.custom-alert {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-in-out;
}

.alert-content {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: popIn 0.3s ease-out;
}

.alert-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-size: 30px;
  color: white;
}

.alert-icon.success {
  background-color: #34a853;
}

.alert-icon.error {
  background-color: #ea4335;
}

.alert-icon.info {
  background-color: #4285f4;
}

.alert-icon.hint {
  background-color: #fbbc05;
}

.alert-message {
  margin-bottom: 25px;
  font-size: 16px;
  line-height: 1.6;
  color: #444;
}

.alert-buttons {
  display: flex;
  gap: 10px;
}

.alert-button {
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3);
}

.alert-button:hover {
  background-color: #3b78e7;
  box-shadow: 0 6px 12px rgba(66, 133, 244, 0.4);
}

.alert-button.cancel {
  background-color: #f5f5f5;
  color: #444;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.alert-button.cancel:hover {
  background-color: #e0e0e0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>