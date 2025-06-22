import { ChatSession, Message } from '../types/project'

const STORAGE_KEY = 'ccc-chats'
const CURRENT_CHAT_KEY = 'ccc-current-chat'

class ProjectManager {
  private chats: ChatSession[] = []
  private currentChat: ChatSession | null = null

  constructor() {
    this.loadChats()
    this.loadCurrentChat()
  }

  // Chat Management
  getChats(): ChatSession[] {
    return this.chats
  }

  getCurrentChat(): ChatSession | null {
    return this.currentChat
  }

  createChatSession(title: string = 'New Chat', projectPath?: string, projectName?: string): ChatSession {
    const chat: ChatSession = {
      id: Date.now().toString(),
      title,
      createdAt: new Date(),
      messageCount: 0,
      messages: [],
      projectPath,
      projectName
    }

    this.chats.unshift(chat) // Add to beginning
    this.currentChat = chat
    this.saveChats()
    this.saveCurrentChat()
    return chat
  }

  selectChatSession(chatId: string): ChatSession | null {
    const chat = this.chats.find(c => c.id === chatId)
    if (chat) {
      this.currentChat = chat
      this.saveCurrentChat()
      return chat
    }
    return null
  }

  deleteChatSession(chatId: string): boolean {
    const index = this.chats.findIndex(c => c.id === chatId)
    if (index !== -1) {
      this.chats.splice(index, 1)
      if (this.currentChat?.id === chatId) {
        this.currentChat = null
      }
      this.saveChats()
      this.saveCurrentChat()
      return true
    }
    return false
  }

  updateChatTitle(chatId: string, title: string): ChatSession | null {
    const chat = this.chats.find(c => c.id === chatId)
    if (chat) {
      chat.title = title
      this.saveChats()
      return chat
    }
    return null
  }

  // Project utilities
  setProjectForChat(chatId: string, projectPath: string, projectName: string): ChatSession | null {
    const chat = this.chats.find(c => c.id === chatId)
    if (chat) {
      chat.projectPath = projectPath
      chat.projectName = projectName
      this.saveChats()
      return chat
    }
    return null
  }

  // Message Management
  addMessage(message: Message): boolean {
    if (!this.currentChat) return false

    this.currentChat.messages.push(message)
    this.currentChat.messageCount = this.currentChat.messages.length
    this.currentChat.lastMessage = message.content.substring(0, 100)

    // Auto-generate chat title from first user message
    if (this.currentChat.messages.length === 1 && message.role === 'user') {
      this.currentChat.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
    }

    this.saveChats()
    return true
  }

  clearCurrentChat(): boolean {
    if (!this.currentChat) return false
    
    this.currentChat.messages = []
    this.currentChat.messageCount = 0
    this.currentChat.lastMessage = undefined
    this.saveChats()
    return true
  }

  clearAllChats(): void {
    this.chats = []
    this.currentChat = null
    this.saveChats()
    this.saveCurrentChat()
  }

  // Storage Methods
  private loadChats(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.chats = data.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }))
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
      this.chats = []
    }
  }

  private saveChats(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.chats))
    } catch (error) {
      console.error('Failed to save chats:', error)
    }
  }

  private loadCurrentChat(): void {
    try {
      const stored = localStorage.getItem(CURRENT_CHAT_KEY)
      if (stored) {
        const chatId = JSON.parse(stored)
        this.selectChatSession(chatId)
      }
    } catch (error) {
      console.error('Failed to load current chat:', error)
    }
  }

  private saveCurrentChat(): void {
    try {
      const chatId = this.currentChat?.id || null
      localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(chatId))
    } catch (error) {
      console.error('Failed to save current chat:', error)
    }
  }
}

export const projectManager = new ProjectManager()