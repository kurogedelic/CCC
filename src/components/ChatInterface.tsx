import { useState, useEffect, useRef } from 'react'
import { ArrowUp, ArrowDown, User, Robot, FolderOpen, Terminal, ShareNetwork, Upload, FileCode, CurrencyDollar } from '@phosphor-icons/react'
import { Sidebar } from './Sidebar'
import { FolderSelectionModal } from './FolderSelectionModal'
import { TypewriterText } from './TypewriterText'
import SettingsModal from './SettingsModal'
import { claudeService } from '../services/claudeService'
import { projectManager } from '../services/projectManager'
import { ChatSession, Message } from '../types/project'
import { useSettings } from '../contexts/SettingsContext'
import { extractContentFromStreamData } from '../utils/contentExtractor'

export function ChatInterface() {
  const { settings, updateSetting } = useSettings()
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const [chats, setChats] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [_dragCounter, setDragCounter] = useState(0)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  // const [currentStreamingStatus, setCurrentStreamingStatus] = useState<string>('')
  const [currentMessageStreamingDetails, setCurrentMessageStreamingDetails] = useState<string[]>([])
  const [currentNonVerboseContent, setCurrentNonVerboseContent] = useState<{content: string, type: string}[]>([])
  const [totalCost, setTotalCost] = useState<number>(0)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const currentStreamingDetailsRef = useRef<string[]>([])
  const currentNonVerboseContentRef = useRef<{content: string, type: string}[]>([])
  const allReceivedJsonRef = useRef<string[]>([])

  const handleSend = async () => {
    if (!input.trim() || !currentChat || !currentChat.projectPath) return

    const isExistingChat = messages.length > 0
    
    const baseTime = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const userMessageId = `${baseTime}-user-${randomSuffix}`
    const userMessage: Message = {
      id: userMessageId,
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    
    const currentInput = input
    setInput('')
    setIsLoading(true)
    
    // Initialize streaming details for the new message
    setCurrentMessageStreamingDetails([])
    // setCurrentStreamingStatus('')
    setCurrentNonVerboseContent([])
    currentStreamingDetailsRef.current = []
    currentNonVerboseContentRef.current = []
    allReceivedJsonRef.current = []

    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'
    }

    try {
      const tempMessageId = `${baseTime}-assistant-${randomSuffix}`
      let streamingMessage: Message = {
        id: tempMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, streamingMessage])

      // Always use streaming mode
      claudeService.setResponseMode('streaming')
      
      const response = await claudeService.sendMessage(
        currentInput,
        currentChat.projectPath!,
        (partialContent) => {
          try {
            const statusData = JSON.parse(partialContent)
            // setCurrentStreamingStatus(partialContent)
            allReceivedJsonRef.current.push(partialContent)
            
            if (settings.verbose) {
              currentStreamingDetailsRef.current.push(partialContent)
              setCurrentMessageStreamingDetails(prev => [...prev, partialContent])
            } else {
              const extracted = extractContentFromStreamData(partialContent)
              
              if (extracted.hasContent && extracted.shouldDisplay) {
                // Check for duplicates in ref (more reliable than state)
                const contentExists = currentNonVerboseContentRef.current.some(item => 
                  item.content === extracted.content && item.type === extracted.type
                )
                
                if (!contentExists && extracted.content.trim()) {
                  const newItem = { content: extracted.content, type: extracted.type || 'unknown' }
                  
                  currentNonVerboseContentRef.current.push(newItem)
                  setCurrentNonVerboseContent(prev => [...prev, newItem])
                  
                  setMessages(prevMessages => 
                    prevMessages.map(msg => {
                      if (msg.role === 'assistant' && prevMessages[prevMessages.length - 1]?.id === msg.id) {
                        const existingNonVerbose = msg.nonVerboseContent || []
                        const updatedNonVerbose = [...existingNonVerbose, newItem]
                        return {
                          ...msg,
                          nonVerboseContent: updatedNonVerbose
                        }
                      }
                      return msg
                    })
                  )
                }
              }
            }
            
            if (statusData.type === 'result' && statusData.total_cost_usd) {
              setTotalCost(statusData.total_cost_usd)
            }
          } catch {
            // Ignore non-JSON data
          }
        },
        isExistingChat
      )

      const finalResponse = { 
        ...response, 
        id: tempMessageId,
        streamingDetails: settings.verbose ? [...currentStreamingDetailsRef.current] : [],
        nonVerboseContent: settings.verbose ? [] : [...currentNonVerboseContentRef.current]
      }
      
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === tempMessageId) {
            const existingContent = msg.nonVerboseContent || []
            const newContent = [...currentNonVerboseContentRef.current]
            
            const combinedContent = [...existingContent]
            for (const newItem of newContent) {
              const exists = combinedContent.some(existing => 
                existing.content === newItem.content && existing.type === newItem.type
              )
              if (!exists) {
                combinedContent.push(newItem)
              }
            }
            
            return {
              ...finalResponse,
              nonVerboseContent: combinedContent
            }
          }
          return msg
        })
      )
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        role: 'assistant',
        timestamp: new Date(),
        streamingDetails: [...currentStreamingDetailsRef.current] // Save streaming details even for error cases
      }
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage && lastMessage.role === 'assistant') {
          return [...prev.slice(0, -1), errorMessage]
        }
        return [...prev, errorMessage]
      })
    } finally {
      setIsLoading(false)
      // setCurrentStreamingStatus('') // Clear current streaming status
      setCurrentMessageStreamingDetails([]) // Clear current message details
      setCurrentNonVerboseContent([]) // Clear non-verbose content
      currentStreamingDetailsRef.current = [] // Clear ref
      currentNonVerboseContentRef.current = [] // Clear non-verbose ref
      allReceivedJsonRef.current = [] // Clear JSON debug ref
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = '44px'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    claudeService.abort()
    setShowFolderModal(true)
  }

  const handleChatSelect = (chatId: string) => {
    const chat = projectManager.selectChatSession(chatId)
    if (chat) {
      setCurrentChat(chat)
      setMessages(chat.messages)
    }
  }

  const handleSelectFolder = async (path: string, name: string) => {
    setShowFolderModal(false)
    const newChat = projectManager.createChatSession(name, path, name)
    setCurrentChat(newChat)
    setMessages([])
    setInput('')
    setIsLoading(true)
    refreshChats()
    
    try {
      // Check if project has Claude.md
      const projectInfo = await claudeService.checkProject(path)
      
      if (projectInfo.hasClaudeConfig) {
        // Project has Claude.md, send notification
        const welcomeMessage: Message = {
          id: 'config-found',
          content: `✅ **Claude Code is configured for this project!**\n\nFound configuration at: \`${projectInfo.claudeConfigPath}\`\n\nI'm ready to help you with this project. What would you like to work on?`,
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
        projectManager.addMessage(welcomeMessage)
      } else {
        // No Claude.md found, offer to initialize
        const initMessage: Message = {
          id: 'init-offer',
          content: `⚠️ **Claude Code is not initialized in this project.**\n\nWould you like me to run \`claude init\` to set up Claude Code for this project? This will create a CLAUDE.md configuration file.\n\n*Click "Initialize Project" below to continue.*`,
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages([initMessage])
        projectManager.addMessage(initMessage)
      }
    } catch (error) {
      console.error('Error checking project:', error)
      const errorMessage: Message = {
        id: 'check-error',
        content: `❌ **Error checking project configuration**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nYou can still try to use Claude Code, but some features might not work properly.`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages([errorMessage])
      projectManager.addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshChats = () => {
    setChats([...projectManager.getChats()])
  }

  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to delete all chat history?')) {
      projectManager.clearAllChats()
      setChats([])
      setCurrentChat(null)
      setMessages([])
    }
  }


  const handleOpenInFinder = () => {
    if (!currentChat?.projectPath) return
    const fileUrl = `file://${currentChat.projectPath}`
    window.open(fileUrl, '_blank')
  }

  const handleOpenInTerminal = () => {
    if (!currentChat?.projectPath) return
    const message = `To open terminal in project directory:\n\ncd "${currentChat.projectPath}"`
    navigator.clipboard.writeText(`cd "${currentChat.projectPath}"`).then(() => {
      alert('Terminal command copied to clipboard!\n\n' + message)
    }).catch(() => {
      alert(message)
    })
  }

  const handleShareProject = async () => {
    if (!currentChat?.projectPath) return
    const shareText = `Project: ${currentChat.projectName || 'Unknown'}\nPath: ${currentChat.projectPath}`
    try {
      await navigator.clipboard.writeText(shareText)
      alert('Project information copied to clipboard!')
    } catch (error) {
      prompt('Project information:', shareText)
    }
  }

  const handleInitProject = async () => {
    if (!currentChat?.projectPath) return
    
    setIsLoading(true)
    
    try {
      const result = await claudeService.initProject(currentChat.projectPath)
      
      // Add init result message
      setMessages(prev => [...prev, result])
      projectManager.addMessage(result)
      
      // Check project again after init
      const projectInfo = await claudeService.checkProject(currentChat.projectPath)
      if (projectInfo.hasClaudeConfig) {
        const successMessage: Message = {
          id: 'init-success',
          content: `🎉 **Project initialized successfully!**\n\nClaude Code is now ready to assist with your project. You can ask me to help with coding tasks, debug issues, create components, and more.`,
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, successMessage])
        projectManager.addMessage(successMessage)
      }
    } catch (error) {
      console.error('Error initializing project:', error)
      const errorMessage: Message = {
        id: 'init-error',
        content: `❌ **Failed to initialize project**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease try running \`claude init\` manually in your project directory.`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      projectManager.addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }


  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(prev => prev + 1)
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setDragCounter(prev => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragOver(false)
      }
      return newCounter
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(0)
    setIsDragOver(false)
    
    // Handle dropped files
    // const files = Array.from(e.dataTransfer.files)
    // TODO: Implement file handling
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      // Force scroll to bottom with a small delay to ensure content is rendered
      setTimeout(() => {
        const maxScroll = container.scrollHeight - container.clientHeight
        
        // Try smooth scroll first
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
        
        // Fallback to instant scroll if smooth doesn't work
        setTimeout(() => {
          if (container.scrollTop < maxScroll - 10) {
            container.scrollTop = container.scrollHeight
          }
        }, 200)
      }, 100)
    }
  }, [messages])

  // Auto-scroll during streaming for real-time updates
  useEffect(() => {
    if (messagesContainerRef.current && isLoading) {
      const container = messagesContainerRef.current
      
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }, 50)
    }
  }, [currentNonVerboseContent, isLoading])

  // Check scroll position to show/hide scroll-to-bottom button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50
      setShowScrollToBottom(!isScrolledToBottom && messages.length > 0)
    }
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    // Load existing chats but don't auto-select any chat
    setChats(projectManager.getChats())
    setCurrentChat(null)
    setMessages([])
  }, [])

  if (!currentChat) {
    return (
      <div className="app-container">
        <Sidebar 
          chats={chats}
          currentChat={null}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          onClearAllChats={handleClearAllChats}
          connectionStatus="connected"
          onSettingsClick={() => setShowSettingsModal(true)}
        />
        
        <FolderSelectionModal
          isOpen={showFolderModal}
          onClose={() => setShowFolderModal(false)}
          onSelectFolder={handleSelectFolder}
        />

        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </div>
    )
  }

  return (
    <div 
      className="app-container"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Sidebar 
        chats={chats}
        currentChat={currentChat}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        onClearAllChats={handleClearAllChats}
        connectionStatus={isLoading ? "connecting" : "connected"}
        onSettingsClick={() => setShowSettingsModal(true)}
      />
      
      <div className="main-content">
        <div className="chat-header">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-[var(--text-secondary)]">Project:</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{currentChat.projectName}</span>
          </div>
          
          <button 
            className="header-button"
            onClick={handleOpenInFinder}
            title="Open in Finder/Explorer"
          >
            <FolderOpen size={20} />
          </button>
          <button 
            className="header-button"
            onClick={handleOpenInTerminal}
            title="Open in Terminal"
          >
            <Terminal size={20} />
          </button>
          <button 
            className="header-button"
            onClick={handleShareProject}
            title="Share Project Path"
          >
            <ShareNetwork size={20} />
          </button>

          {/* Verbose Mode Toggle */}
          <button 
            className={`header-button ${settings.verbose ? 'bg-[var(--accent)] text-white' : ''}`}
            onClick={() => updateSetting('verbose', !settings.verbose)}
            title={`${settings.verbose ? 'Disable' : 'Enable'} verbose mode`}
          >
            <Terminal size={16} />
            <span className="text-xs ml-1">{settings.verbose ? 'V' : 'S'}</span>
          </button>
          
          {/* Cost Display */}
          <div className="cost-display">
            <CurrencyDollar size={14} />
            <span>-{totalCost.toFixed(6)}</span>
          </div>
          
          {/* Show init button if project needs initialization */}
          {messages.some(msg => msg.id === 'init-offer') && (
            <button 
              className="header-button bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
              onClick={handleInitProject}
              disabled={isLoading}
              title="Initialize Claude Code"
            >
              {isLoading ? '...' : 'Init'}
            </button>
          )}
        </div>

        <div 
          className="messages-container"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1
            const isCurrentlyStreaming = isLoading && message.role === 'assistant' && isLastMessage
            
            return (
              <div key={`${message.id}-${index}`}>
{message.role === 'user' ? (
                  <div className={`message ${message.role}`}>
                    <div className="message-avatar">
                      <User size={16} />
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">
                        <TypewriterText 
                          text={message.content} 
                          messageId={message.id}
                          isStreaming={false}
                          speed={15}
                        />
                        
                        {message.files && message.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="file-preview mt-3">
                            <FileCode size={24} className="file-icon" />
                            <div>
                              <div className="file-name">{file.name}</div>
                              <div className="file-size">{file.size}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="assistant-streaming-section">
                    {settings.verbose ? (
                      <>
                        {/* Verbose mode: Show detailed JSON streaming */}
                        {/* Show current streaming status for active message */}
                        {isCurrentlyStreaming && currentMessageStreamingDetails.length > 0 && 
                          currentMessageStreamingDetails.map((statusData, statusIndex) => {
                            const getTypeClass = (data: string) => {
                              try {
                                const parsed = JSON.parse(data)
                                return `json-stream-item json-type-${parsed.type || 'unknown'}`
                              } catch {
                                return 'json-stream-item'
                              }
                            }
                            
                            return (
                              <div key={`current-${statusIndex}`} className={getTypeClass(statusData)}>
                                <pre className="json-display">{statusData}</pre>
                              </div>
                            )
                          })
                        }
                        
                        {/* Show saved streaming details for completed messages */}
                        {!isCurrentlyStreaming && message.streamingDetails && message.streamingDetails.length > 0 &&
                          message.streamingDetails.map((statusData, statusIndex) => {
                            const getTypeClass = (data: string) => {
                              try {
                                const parsed = JSON.parse(data)
                                return `json-stream-item json-type-${parsed.type || 'unknown'}`
                              } catch {
                                return 'json-stream-item'
                              }
                            }
                            
                            const className = getTypeClass(statusData)
                            
                            return (
                              <div key={`saved-${statusIndex}`} className={className}>
                                <pre className="json-display">{statusData}</pre>
                              </div>
                            )
                          })
                        }
                      </>
                    ) : (
                      <>
                        {/* Non-verbose mode: Show only user-facing content */}
                        {/* Show current non-verbose content for active message */}
                        {isCurrentlyStreaming && currentNonVerboseContent.length > 0 && 
                          currentNonVerboseContent.map((item, contentIndex) => (
                            <div key={`current-content-${contentIndex}`} className={`non-verbose-content non-verbose-type-${item.type}`}>
                              <div className="non-verbose-header">
                                <span className="non-verbose-type-label">{item.type}</span>
                              </div>
                              <TypewriterText 
                                text={item.content} 
                                messageId={`streaming-${contentIndex}`}
                                isStreaming={true}
                                speed={15}
                              />
                            </div>
                          ))
                        }
                        
                        {/* Show saved non-verbose content for completed messages */}
                        {!isCurrentlyStreaming && message.nonVerboseContent && message.nonVerboseContent.length > 0 &&
                          message.nonVerboseContent.map((item, contentIndex) => (
                            <div key={`saved-content-${contentIndex}`} className={`non-verbose-content non-verbose-type-${item.type}`}>
                              <div className="non-verbose-header">
                                <span className="non-verbose-type-label">{item.type}</span>
                                <span className="non-verbose-index">#{contentIndex}</span>
                              </div>
                              <TypewriterText 
                                text={item.content} 
                                messageId={`${message.id}-content-${contentIndex}`}
                                isStreaming={false}
                                speed={15}
                              />
                            </div>
                          ))
                        }
                        
                        {/* Show final result content only if no non-verbose content exists */}
                        {!isCurrentlyStreaming && message.content && (!message.nonVerboseContent || message.nonVerboseContent.length === 0) && (
                          <div className="non-verbose-content final-content">
                            <div className="non-verbose-header">
                              <span className="non-verbose-type-label">final_result</span>
                            </div>
                            <TypewriterText 
                              text={message.content} 
                              messageId={message.id}
                              isStreaming={false}
                              speed={15}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          
          
          {isLoading && !messages.some(msg => isLoading && msg.role === 'assistant' && messages[messages.length - 1]?.id === msg.id) && (
            <div className="message assistant">
              <div className="message-avatar">
                <Robot size={16} />
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <div className="message-text">
                    <span className="typewriter">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <button
            className="scroll-to-bottom-btn"
            onClick={scrollToBottom}
            title="Scroll to bottom"
          >
            <ArrowDown size={20} />
          </button>
        )}

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="input-field"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Message Claude Code..."
              rows={1}
              disabled={isLoading || !currentChat.projectPath}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !currentChat.projectPath}
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>

      <FolderSelectionModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSelectFolder={handleSelectFolder}
      />

      {isDragOver && (
        <div className="drop-zone active">
          <div className="drop-zone-content">
            <Upload size={48} className="drop-zone-icon" />
            <div className="drop-zone-text">Drop files here to upload</div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  )
}