<template>
  <div
    class="ai-assistant-wrapper"
    :style="wrapperStyle"
    ref="wrapperRef"
  >
    <transition name="fade">
      <div v-if="showChat" class="chat-window" :style="chatStyle">
        <div
          class="chat-header"
          ref="dragHandle"
          @mousedown.prevent="startDrag($event, 'chat')"
          @touchstart.prevent="startDrag($event, 'chat')"
        >
          <div class="chat-header-info">
            <img src="/src/assets/ai-assistant.jpg" class="chat-avatar" />
            <div class="chat-title">
              <div class="chat-name">小智 AI 助手</div>
              <div class="chat-status"><span class="dot"></span>在线</div>
            </div>
          </div>
          <el-button class="close-btn" text @click="showChat = false">
            <el-icon :size="20"><Close /></el-icon>
          </el-button>
        </div>

        <div ref="chatBodyRef" class="chat-body">
          <div v-for="msg in messages" :key="msg.id" class="chat-msg" :class="msg.role">
            <img v-if="msg.role === 'assistant'" src="/src/assets/ai-assistant.jpg" class="msg-avatar" />
            <div class="msg-bubble">
              <div v-if="msg.loading" class="typing">
                <span></span><span></span><span></span>
              </div>
              <div v-else>{{ msg.content }}</div>
            </div>
            <div v-if="msg.role === 'user'" class="msg-avatar user-avatar">我</div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="quick-prompts">
            <el-tag
              v-for="(p, idx) in quickPrompts"
              :key="idx"
              size="small"
              class="quick-tag"
              @click="sendQuick(p)">
              {{ p }}
            </el-tag>
          </div>
          <div class="input-row">
            <el-input
              v-model="inputMsg"
              type="textarea"
              :rows="2"
              placeholder="输入您的问题，按 Enter 发送…"
              resize="none"
              @keydown.enter.prevent="sendMessage"
            />
            <el-button type="primary" class="send-btn" @click="sendMessage">
              <el-icon><Promotion /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </transition>

    <div
      class="ai-fab"
      :class="{ active: showChat }"
      @click.stop="onFabClick"
      ref="fabRef"
      @mousedown.prevent="startDrag($event, 'fab')"
      @touchstart.prevent="startDrag($event, 'fab')"
    >
      <div class="fab-shadow"></div>
      <div class="fab-body">
        <img src="/src/assets/ai-assistant.jpg" class="fab-img" />
      </div>
      <div class="fab-ring"></div>
      <div class="fab-ring delay"></div>
      <div class="fab-tip" v-if="!showChat">小智在线</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Close, Promotion } from '@element-plus/icons-vue'

const showChat = ref(false)
const inputMsg = ref('')
const chatBodyRef = ref(null)
const wrapperRef = ref(null)
const dragHandle = ref(null)
const fabRef = ref(null)

// 位置：使用相对视口的百分比坐标，保证窗口缩放自适应
const pos = reactive({
  x: 24,       // wrapper 距离视口右边距
  y: 32,       // wrapper 距离视口下边距
  chatX: 0,    // chat 窗口相对 wrapper 的偏移（展开后可以独立拖动）
  chatY: 0
})

const wrapperStyle = computed(() => ({
  right: `${pos.x}px`,
  bottom: `${pos.y}px`
}))

const chatStyle = computed(() => ({
  transform: `translate(${pos.chatX}px, ${pos.chatY}px)`
}))

const quickPrompts = [
  '帮我分析低保资格',
  '查询政策匹配',
  '生成核查报告',
  '社区数据统计'
]

const messages = ref([
  {
    id: 1,
    role: 'assistant',
    content: '您好！我是小智 AI 助手 👋 可以帮助您进行政策匹配、数据分析、报告生成等工作。请问有什么可以帮您？'
  }
])

let msgId = 2

// ============ 拖拽逻辑 ============
let dragState = null // { type: 'fab'|'chat', startX, startY, origPos }

const getEventPoint = (e) => {
  if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
  return { x: e.clientX, y: e.clientY }
}

const startDrag = (e, type) => {
  const { x, y } = getEventPoint(e)
  dragState = {
    type,
    startX: x,
    startY: y,
    origX: pos.x,
    origY: pos.y,
    origChatX: pos.chatX,
    origChatY: pos.chatY,
    moved: false,
    fabStartTime: performance.now()
  }
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

const onDragMove = (e) => {
  if (!dragState) return
  e.preventDefault?.()
  const { x, y } = getEventPoint(e)
  const dx = x - dragState.startX
  const dy = y - dragState.startY
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragState.moved = true

  if (dragState.type === 'fab') {
    // 移动 wrapper：视口内贴边
    const rect = wrapperRef.value?.getBoundingClientRect()
    const w = rect?.width || 80
    const h = rect?.height || 80
    const vw = window.innerWidth
    const vh = window.innerHeight
    // wrapper 的锚点是 right/bottom，所以新 right = 原 right - dx（dx为正，用户往右拖，right变小）
    const newRight = Math.max(0, Math.min(vw - w, dragState.origX - dx))
    const newBottom = Math.max(0, Math.min(vh - h, dragState.origY - dy))
    pos.x = newRight
    pos.y = newBottom
    // 拖动悬浮球时，聊天窗口相对偏移归零，保持一致
    pos.chatX = 0
    pos.chatY = 0
  } else {
    // 移动 chat 窗口（相对 wrapper 的偏移）
    pos.chatX = dragState.origChatX + dx
    pos.chatY = dragState.origChatY + dy
  }
}

const onDragEnd = () => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
  dragState = null
}

// FAB 点击：如果没发生拖拽再 toggle
let lastFabClickInfo = null
const onFabClick = () => {
  if (dragState?.moved) return
  toggleChat()
}

const toggleChat = () => {
  showChat.value = !showChat.value
  if (showChat.value) {
    // 打开时重置 chat 相对偏移，从 wrapper 位置展开
    pos.chatX = 0
    pos.chatY = 0
    nextTick(scrollToBottom)
  }
}

const scrollToBottom = () => {
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

const sendQuick = (text) => {
  inputMsg.value = text
  sendMessage()
}

const sendMessage = async () => {
  const text = inputMsg.value.trim()
  if (!text) return

  messages.value.push({
    id: msgId++,
    role: 'user',
    content: text
  })
  inputMsg.value = ''
  nextTick(scrollToBottom)

  messages.value.push({
    id: msgId++,
    role: 'assistant',
    content: '',
    loading: true
  })
  nextTick(scrollToBottom)

  setTimeout(() => {
    const last = messages.value[messages.value.length - 1]
    last.content = generateReply(text)
    last.loading = false
    nextTick(scrollToBottom)
  }, 900 + Math.random() * 600)
}

const generateReply = (input) => {
  const lower = input.toLowerCase()
  if (lower.includes('低保')) {
    return '根据当前数据，低保资格核查要点：\n\n1. 家庭人均收入是否低于当地低保标准\n2. 家庭财产状况是否符合要求\n3. 是否存在法定赡养人但未履行义务\n\n建议前往「核查管理 → 核查列表」查看详细预警信息，或使用「政策匹配」功能进行智能比对。'
  }
  if (lower.includes('匹配') || lower.includes('政策')) {
    return '政策匹配功能已就绪 🎯\n\n您可以在左侧菜单「政策匹配」页面：\n• 输入居民信息进行智能匹配\n• AI 会自动推荐适合的惠民政策\n• 支持低保、残疾、公租房、老年津贴等 10+ 类政策\n\n需要我帮您跳转到政策匹配页面吗？'
  }
  if (lower.includes('报告') || lower.includes('核查')) {
    return '核查报告生成流程：\n\n1. 选择居民 → 点击详情\n2. 系统自动汇总比对信息、标签信息\n3. 点击「生成报告」即可导出 PDF\n\n当前项目已内置 96+ 条核查记录，支持批量导出。'
  }
  if (lower.includes('统计') || lower.includes('数据')) {
    return '📊 数据统计概览：\n\n• 居民总数：8 人（本月新增 5 人）\n• 待处理预警：5 条\n• 享受中标签：34 个\n• 标签总数：40 个\n\n详细报表请查看「统计报表」页面。'
  }
  return `收到您的问题：「${input}」\n\n小智正在为您分析...您可以尝试以下操作：\n• 在左侧菜单选择对应功能模块\n• 点击「政策匹配」进行智能推荐\n• 查看「核查列表」处理预警\n\n如需帮助，随时告诉我 😊`
}

// 清理
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
})
</script>

<style scoped>
.ai-assistant-wrapper {
  position: fixed;
  right: 24px;
  bottom: 32px;
  z-index: 9999;
  user-select: none;
}

.ai-fab {
  position: relative;
  width: 80px;
  height: 80px;
  cursor: grab;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  touch-action: none;
}
.ai-fab:active { cursor: grabbing; }

.ai-fab:hover {
  transform: translateY(-6px);
}

.ai-fab.active {
  transform: scale(0) rotate(180deg);
  pointer-events: none;
}

.fab-shadow {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: -6px;
  height: 10px;
  background: rgba(30, 64, 175, 0.35);
  border-radius: 50%;
  filter: blur(8px);
  animation: shadow-pulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shadow-pulse {
  0%, 100% { transform: scaleX(1); opacity: 0.35; }
  50% { transform: scaleX(0.85); opacity: 0.2; }
}

.fab-body {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(145deg, #60a5fa 0%, #3b82f6 40%, #1e40af 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  box-shadow:
    0 8px 24px rgba(30, 64, 175, 0.45),
    0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  transform-style: preserve-3d;
  animation: bobble 3s ease-in-out infinite;
}

@keyframes bobble {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-4px) rotate(-2deg); }
  75% { transform: translateY(-2px) rotate(2deg); }
}

.fab-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background: white;
  border: 3px solid rgba(255, 255, 255, 0.9);
  pointer-events: none;
}

.fab-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(59, 130, 246, 0.5);
  animation: ring-pulse 2s ease-out infinite;
  pointer-events: none;
}

.fab-ring.delay {
  animation-delay: 0.7s;
}

@keyframes ring-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

.fab-tip {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  background: white;
  padding: 3px 10px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
  pointer-events: none;
}

.chat-window {
  position: absolute;
  right: 0;
  bottom: 100px;
  width: 380px;
  height: 560px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

@keyframes pop-in {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.chat-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  flex-shrink: 0;
  cursor: move;
  user-select: none;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.chat-name {
  font-weight: 600;
  font-size: 15px;
}

.chat-status {
  font-size: 12px;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 4px;
}

.chat-status .dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 4px #22c55e;
}

.close-btn {
  color: white !important;
  cursor: pointer;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-body::-webkit-scrollbar {
  width: 6px;
}
.chat-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-msg {
  display: flex;
  gap: 8px;
  max-width: 90%;
}

.chat-msg.assistant {
  align-self: flex-start;
}

.chat-msg.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.msg-avatar.user-avatar {
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
}

.chat-msg.assistant .msg-bubble {
  background: white;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.chat-msg.user .msg-bubble {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  border-top-right-radius: 4px;
}

.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 2px 0;
}

.typing span {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.chat-input-area {
  background: white;
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s;
  background: #eff6ff !important;
  color: #1e40af !important;
  border: none !important;
}

.quick-tag:hover {
  background: #dbeafe !important;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.input-row :deep(.el-textarea__inner) {
  border-radius: 10px;
  border-color: #e2e8f0;
  font-size: 14px;
  padding: 10px 12px;
}

.input-row :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
}

.send-btn {
  height: 40px;
  width: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
