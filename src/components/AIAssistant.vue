<template>
  <div class="ai-assistant">
    <!-- 悬浮按钮 -->
    <transition name="fab">
      <div v-if="!isOpen" class="ai-fab" @click="openAssistant" role="button" tabindex="0" @keydown.enter="openAssistant" @keydown.space.prevent="openAssistant" title="AI智能助手" aria-label="打开AI智能助手">
        <div class="ai-fab-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
          </svg>
        </div>
        <div class="ai-fab-pulse"></div>
      </div>
    </transition>

    <!-- 对话面板 -->
    <transition name="panel">
      <div v-if="isOpen" class="ai-panel">
        <!-- 面板头部 -->
        <div class="panel-header">
          <div class="header-left">
            <div class="ai-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
              </svg>
            </div>
            <div class="header-info">
              <div class="header-title">AI智能助手</div>
              <div class="header-status">
                <span class="status-dot"></span>
                在线
              </div>
            </div>
          </div>
          <button class="close-btn" @click="closeAssistant" aria-label="关闭助手">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 消息列表 -->
        <div class="message-list" ref="messageListRef">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-section">
            <div class="welcome-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
              </svg>
            </div>
            <div class="welcome-text">您好！我是AI智能助手</div>
            <div class="welcome-desc">我可以帮您：</div>
            <div class="welcome-features">
              <div class="feature-item" v-for="(feature, idx) in features" :key="idx" @click="sendQuickMessage(feature.question)">
                <div class="feature-icon" :class="feature.iconClass">
                  <component :is="feature.icon" />
                </div>
                <div class="feature-text">{{ feature.label }}</div>
              </div>
            </div>
          </div>

          <!-- 消息 -->
          <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.type]">
            <div v-if="msg.type === 'user'" class="message-content">
              <div class="message-text">{{ msg.text }}</div>
            </div>
            <div v-else class="message-content">
              <div class="ai-avatar-small" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
                </svg>
              </div>
              <div class="message-bubble">
                <div class="message-title" v-if="msg.title">{{ msg.title }}</div>
                <div class="message-text" v-html="formatMessage(msg.text)"></div>
                
                <!-- 搜索结果展示 -->
                <div v-if="msg.searchResults" class="search-results">
                  <div class="search-result-item" v-for="result in msg.searchResults.residents.slice(0, 3)" :key="result.id" @click="viewResident(result.id)">
                    <div class="result-avatar">{{ result.name.charAt(0) }}</div>
                    <div class="result-info">
                      <div class="result-name">{{ result.name }}</div>
                      <div class="result-meta">{{ result.type }} · {{ result.community }}</div>
                    </div>
                    <el-icon class="result-arrow"><ArrowRight /></el-icon>
                  </div>
                </div>

                <!-- 建议回复 -->
                <div v-if="msg.suggestions" class="suggestions">
                  <div class="suggestions-title">您还可以问我：</div>
                  <div class="suggestion-buttons">
                    <button 
                      v-for="(suggestion, sIdx) in msg.suggestions" 
                      :key="sIdx" 
                      class="suggestion-btn"
                      @click="sendQuickMessage(suggestion)"
                    >
                      {{ suggestion }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载中 -->
          <div v-if="isLoading" class="message bot">
            <div class="message-content">
              <div class="ai-avatar-small" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
                </svg>
              </div>
              <div class="message-bubble loading">
                <div class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-wrapper">
            <input 
              v-model="inputText" 
              @keyup.enter="sendMessage"
              placeholder="输入您的问题…"
              class="input-field"
              autocomplete="off"
              aria-label="输入问题"
            />
            <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()" aria-label="发送消息">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, h } from 'vue'
import { useRouter } from 'vue-router'
import { 
  askPolicyQuestion, 
  queryData, 
  smartSearch, 
  processAIQuestion 
} from '../services/aiService'
import { 
  ArrowRight,
  Document,
  PieChart,
  Search,
  Help
} from '@element-plus/icons-vue'

const router = useRouter()

const isOpen = ref(false)
const isLoading = ref(false)
const inputText = ref('')
const messages = ref([])
const messageListRef = ref(null)

// 功能特性
const features = [
  { 
    icon: Document, 
    label: '政策咨询', 
    iconClass: 'icon-blue',
    question: '高龄老人有什么补贴政策？'
  },
  { 
    icon: PieChart, 
    label: '数据查询', 
    iconClass: 'icon-green',
    question: '系统有多少居民？'
  },
  { 
    icon: Search, 
    label: '智能搜索', 
    iconClass: 'icon-purple',
    question: '找一下姓张的居民'
  },
  { 
    icon: Help, 
    label: '使用帮助', 
    iconClass: 'icon-orange',
    question: '系统有哪些功能？'
  }
]

const openAssistant = () => {
  isOpen.value = true
}

const closeAssistant = () => {
  isOpen.value = false
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return
  
  const userMessage = inputText.value.trim()
  inputText.value = ''
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    text: userMessage
  })
  
  scrollToBottom()
  isLoading.value = true
  
  try {
    const response = await processUserMessage(userMessage)
    
    // 添加AI响应
    messages.value.push(response)
    
    scrollToBottom()
  } catch (error) {
    console.error('AI处理失败:', error)
    messages.value.push({
      type: 'bot',
      title: '处理失败',
      text: '抱歉，我遇到了一些问题，请稍后再试。',
      suggestions: ['重试', '换个问题']
    })
  } finally {
    isLoading.value = false
  }
}

const sendQuickMessage = async (question) => {
  inputText.value = question
  await sendMessage()
}

const processUserMessage = async (message) => {
  const m = message.toLowerCase()
  
  // 搜索类关键词
  if (m.includes('找') || m.includes('搜索') || m.includes('查') || m.includes('看一下')) {
    // 提取搜索关键词
    const keywords = m.replace(/找|搜索|查|看一下/g, '').trim()
    if (keywords) {
      const result = await smartSearch(keywords)
      return {
        type: 'bot',
        title: result.title || '搜索结果',
        text: result.message || `找到以下结果：`,
        searchResults: result.results,
        suggestions: result.suggestions || []
      }
    }
  }
  
  // 数据查询类关键词
  if (m.includes('多少') || m.includes('统计') || m.includes('总数') || m.includes('查询')) {
    return await queryData(message)
  }
  
  // 政策咨询类关键词
  const policyKeywords = ['政策', '补贴', '津贴', '保险', '保障', '高龄', '低保', '残疾', '养老', '医疗', '社保', '住房', '公租房', '独生子女', '军人', '优抚']
  const isPolicyQuestion = policyKeywords.some(k => m.includes(k))
  
  if (isPolicyQuestion) {
    return await askPolicyQuestion(message)
  }
  
  // 其他问题
  return await processAIQuestion(message)
}

const formatMessage = (text) => {
  if (!text) return ''
  // 简单格式化：换行符转为<br>，**加粗**
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

const viewResident = (id) => {
  router.push(`/resident/detail/${id}`)
  closeAssistant()
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 悬浮按钮 */
.ai-fab {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

@media (prefers-reduced-motion: reduce) {
  .ai-fab {
    transition: none;
  }
  .ai-fab-pulse {
    animation: none;
  }
}

.ai-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
}

.ai-fab-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.ai-fab-icon svg {
  width: 100%;
  height: 100%;
}

.ai-fab-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: pulse 2s infinite;
  z-index: -1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 对话面板 */
.ai-panel {
  width: 420px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面板头部 */
.panel-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-avatar svg {
  width: 24px;
  height: 24px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .close-btn {
    transition: none;
  }
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn svg {
  width: 16px;
  height: 16px;
  color: white;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f7f8fa;
}

/* 欢迎区域 */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
}

.welcome-icon svg {
  width: 48px;
  height: 48px;
  color: white;
}

.welcome-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.welcome-desc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.welcome-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e5e7eb;
}

@media (prefers-reduced-motion: reduce) {
  .feature-item {
    transition: none;
  }
}

.feature-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.feature-icon.icon-blue {
  background: #eff6ff;
  color: #3b82f6;
}

.feature-icon.icon-green {
  background: #ecfdf5;
  color: #10b981;
}

.feature-icon.icon-purple {
  background: #f5f3ff;
  color: #8b5cf6;
}

.feature-icon.icon-orange {
  background: #fffbeb;
  color: #f59e0b;
}

.feature-text {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* 消息样式 */
.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message.bot {
  align-items: flex-start;
}

.message-content {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.message-text {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  word-wrap: break-word;
}

.message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot .message-text {
  background: white;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ai-avatar-small {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar-small svg {
  width: 18px;
  height: 18px;
  color: white;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

/* 搜索结果 */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .search-result-item {
    transition: none;
  }
}

.search-result-item:hover {
  background: #eff6ff;
}

.result-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.result-info {
  flex: 1;
}

.result-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.result-meta {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.result-arrow {
  color: #d1d5db;
  font-size: 16px;
}

/* 建议回复 */
.suggestions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.suggestions-title {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .suggestion-btn {
    transition: none;
  }
}

.suggestion-btn:hover {
  background: #eff6ff;
  border-color: #667eea;
  color: #667eea;
}

/* 加载中 */
.loading-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-dots span {
    animation: none;
    transform: scale(1);
  }
}

/* 输入区域 */
.input-area {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-field {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .input-field {
    transition: none;
  }
}

.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 20px;
  height: 20px;
  color: white;
}

/* 动画 */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s ease;
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
