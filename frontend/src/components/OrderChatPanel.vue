<template>
  <div v-if="isOpen" class="chat-overlay" @click.self="$emit('close')">
    <div class="chat-panel">
      <div class="chat-header">
        <div class="chat-peer">
          <div class="chat-avatar">🛵</div>
          <div>
            <div class="chat-peer-name">{{ peerName }}</div>
            <div class="chat-peer-sub">ออเดอร์ #{{ orderId }}</div>
          </div>
        </div>
        <button class="chat-close" @click="$emit('close')">✕</button>
      </div>

      <div ref="streamEl" class="chat-stream">
        <div v-if="messages.length === 0" class="chat-empty">
          ยังไม่มีข้อความ พิมพ์ถึงไรเดอร์ได้เลย เช่น จุดส่งของ หรือคำขอเพิ่มเติม
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat-row"
          :class="msg.sender === 'customer' ? 'is-self' : 'is-peer'"
        >
          <div class="chat-bubble">
            <p>{{ msg.text }}</p>
            <span class="chat-time">{{ msg.time }}</span>
          </div>
        </div>
      </div>

      <div class="chat-quick">
        <button v-for="q in quickReplies" :key="q" class="chat-quick-btn" @click="send(q)">{{ q }}</button>
      </div>

      <form class="chat-input-bar" @submit.prevent="send(draft)">
        <input v-model="draft" type="text" maxlength="1000" placeholder="พิมพ์ข้อความถึงไรเดอร์..." class="chat-input" />
        <button type="submit" class="chat-send" :disabled="!draft.trim() || isSending">ส่ง</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  orderId: { type: [String, Number], default: '' },
  peerName: { type: String, default: 'ไรเดอร์' },
  messages: { type: Array, default: () => [] },
  isSending: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'send'])

const draft = ref('')
const streamEl = ref(null)
const quickReplies = ['รอหน้าบ้านนะครับ', 'ฝากไว้หน้าห้องได้เลย', 'ถึงแล้วโทรหาได้เลย']

const send = (text) => {
  const trimmed = (text || '').trim()
  if (!trimmed) return
  emit('send', trimmed)
  draft.value = ''
}

const scrollToBottom = async () => {
  await nextTick()
  if (streamEl.value) streamEl.value.scrollTop = streamEl.value.scrollHeight
}

watch(() => props.messages.length, scrollToBottom)
watch(() => props.isOpen, (open) => open && scrollToBottom())
</script>

<style scoped>
.chat-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.chat-panel { background: #fff; width: 100%; max-width: 400px; height: min(560px, 85vh); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25); }
.chat-header { background: #557c61; color: #fff; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
.chat-peer { display: flex; align-items: center; gap: 10px; }
.chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; }
.chat-peer-name { font-weight: 600; font-size: 14px; }
.chat-peer-sub { font-size: 11px; opacity: 0.8; }
.chat-close { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
.chat-stream { flex: 1; overflow-y: auto; padding: 14px; background: #f7f6f0; display: flex; flex-direction: column; gap: 8px; }
.chat-empty { text-align: center; color: #888; font-size: 13px; margin-top: 30px; padding: 0 20px; }
.chat-row { display: flex; }
.chat-row.is-self { justify-content: flex-end; }
.chat-row.is-peer { justify-content: flex-start; }
.chat-bubble { max-width: 78%; padding: 8px 12px; border-radius: 16px; font-size: 13px; line-height: 1.4; word-break: break-word; }
.is-self .chat-bubble { background: #557c61; color: #fff; border-bottom-right-radius: 4px; }
.is-peer .chat-bubble { background: #fff; color: #333; border: 1px solid #e5e2d5; border-bottom-left-radius: 4px; }
.chat-bubble p { margin: 0; }
.chat-time { display: block; text-align: right; font-size: 10px; margin-top: 3px; opacity: 0.7; }
.chat-quick { display: flex; gap: 6px; padding: 8px 12px 0; overflow-x: auto; }
.chat-quick-btn { white-space: nowrap; background: #f1ede1; border: none; border-radius: 14px; padding: 6px 10px; font-size: 12px; color: #333; cursor: pointer; }
.chat-quick-btn:hover { background: #e5e2d5; }
.chat-input-bar { display: flex; gap: 8px; padding: 10px 12px 12px; }
.chat-input { flex: 1; border: 1px solid #e5e2d5; border-radius: 12px; padding: 10px 12px; font-size: 14px; outline: none; font-family: inherit; }
.chat-input:focus { border-color: #557c61; }
.chat-send { background: #557c61; color: #fff; border: none; border-radius: 12px; padding: 0 16px; font-weight: 600; cursor: pointer; font-family: inherit; }
.chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
