import { Plus, Gear, FolderOpen, ChatCircle, Trash } from '@phosphor-icons/react'
import { ChatSession } from '../types/project'

interface SidebarProps {
  chats: ChatSession[]
  currentChat: ChatSession | null
  onNewChat: () => void
  onChatSelect: (chatId: string) => void
  onClearAllChats: () => void
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  onSettingsClick: () => void
}

export function Sidebar({ chats, currentChat, onNewChat, onChatSelect, onClearAllChats, connectionStatus, onSettingsClick }: SidebarProps) {
  const statusText = {
    connected: 'Connected to Claude Code',
    disconnected: 'Disconnected',
    connecting: 'Connecting...'
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes <= 1 ? 'Just now' : `${minutes}m ago`
      }
      return `${hours}h ago`
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const truncateMessage = (message: string, maxLength: number = 45): string => {
    if (message.length <= maxLength) {
      return message
    }
    return message.substring(0, maxLength).trim() + '...'
  }


  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="new-chat-btn" style={{ flex: 1 }} onClick={onNewChat}>
            <Plus size={16} />
            New Chat
          </button>
          <button 
            className="header-button"
            onClick={onClearAllChats}
            title="Clear all chats"
            style={{
              padding: '10px',
              backgroundColor: 'var(--bg-tertiary)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      
      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="text-center text-[var(--text-tertiary)] text-sm py-8">
            <ChatCircle size={32} className="mx-auto mb-3 opacity-50" />
            <p>No chats yet</p>
            <p>Start a new conversation</p>
          </div>
        ) : (
          chats.map((chat, index) => (
            <div 
              key={chat.id}
              className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => onChatSelect(chat.id)}
              style={{
                borderBottom: index < chats.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="chat-item-title">{chat.title}</div>
                {chat.projectName && (
                  <div className="flex items-center gap-1 mt-1">
                    <FolderOpen size={12} className="text-[var(--text-tertiary)]" />
                    <span className="text-xs text-[var(--text-tertiary)] truncate">
                      {chat.projectName}
                    </span>
                  </div>
                )}
                <div className="chat-item-time">
                  {formatTime(chat.createdAt)}
                  {chat.messageCount > 0 && (
                    <span className="text-[var(--text-tertiary)]">
                      {' • '}{chat.messageCount} messages
                    </span>
                  )}
                </div>
                {chat.lastMessage && (
                  <div className="chat-item-preview">
                    {truncateMessage(chat.lastMessage)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="sidebar-footer">
        <div className={`status-indicator ${connectionStatus}`}></div>
        <div className="status-text">{statusText[connectionStatus]}</div>
        <button className="settings-button" onClick={onSettingsClick}>
          <Gear size={20} />
        </button>
      </div>
    </div>
  )
}