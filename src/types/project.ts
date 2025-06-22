export interface Project {
  id: string
  name: string
  path: string
  description?: string
  lastAccessed: Date
  createdAt: Date
  chats: ChatSession[]
}

export interface ChatSession {
  id: string
  title: string
  createdAt: Date
  lastMessage?: string
  messageCount: number
  messages: Message[]
  projectPath?: string
  projectName?: string
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  files?: FileItem[]
  streamingDetails?: string[] // Store streaming status data for this message
  nonVerboseContent?: {content: string, type: string}[] // Store extracted user-facing content for non-verbose mode
}

export interface FileItem {
  name: string
  size: string
  type: 'code' | 'image' | 'document'
}

export interface ProjectState {
  currentProject: Project | null
  currentChat: ChatSession | null
  projects: Project[]
}