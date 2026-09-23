import { defineStore } from 'pinia'
import { ref } from 'vue'
import { socket } from '../config/socket'

export const useSocketStore = defineStore('socket', () => {
  const isConnected = ref(Boolean(socket && socket.connected))
  const socketId = ref(socket?.id || '')
  const lastError = ref(null)

  // ลงทะเบียน Event ตรวจจับสถานะการเชื่อมต่อของ Socket.io
  socket.on('connect', () => {
    console.log('⚡ [SocketStore] socket.on("connect") - เชื่อมต่อสำเร็จ ID:', socket.id)
    isConnected.value = true
    socketId.value = socket.id || ''
    lastError.value = null
  })

  socket.on('reconnect', (attemptNumber) => {
    console.log('⚡ [SocketStore] socket.on("reconnect") - เชื่อมต่อใหม่สำเร็จ ครั้งที่:', attemptNumber)
    isConnected.value = true
    socketId.value = socket.id || ''
    lastError.value = null
  })

  socket.on('disconnect', (reason) => {
    console.warn('⚠️ [SocketStore] socket.on("disconnect") - ตัดการเชื่อมต่อ:', reason)
    isConnected.value = false
  })

  socket.on('connect_error', (err) => {
    console.warn('⚠️ [SocketStore] socket.on("connect_error"):', err.message)
    isConnected.value = Boolean(socket && socket.connected)
    lastError.value = err.message
  })

  // ฟังก์ชันช่วยเชื่อมต่อซ้ำ หรือตรวจสอบสถานะปัจจุบัน
  function ensureConnection() {
    isConnected.value = Boolean(socket && socket.connected)
    if (socket && !socket.connected) {
      socket.connect()
    }
  }

  // ซิงค์สถานะการเชื่อมต่อจริงแบบอัตโนมัติ
  if (typeof window !== 'undefined') {
    setInterval(() => {
      if (socket) {
        const actual = Boolean(socket.connected)
        if (isConnected.value !== actual) {
          isConnected.value = actual
        }
      }
    }, 2000)
  }

  return {
    isConnected,
    socketId,
    lastError,
    socket,
    ensureConnection
  }
})
