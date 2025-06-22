import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, FolderOpen } from '@phosphor-icons/react'

interface FolderSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectFolder: (path: string, name: string) => void
}

export function FolderSelectionModal({ isOpen, onClose, onSelectFolder }: FolderSelectionModalProps) {
  const [manualPath, setManualPath] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [selectedPath, setSelectedPath] = useState('')
  // const [recentProjects, setRecentProjects] = useState<Array<{path: string, name: string, lastAccessed: Date}>>([])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // モーダル表示時にbodyのスクロールを無効化
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleSelectFolder = async () => {
    try {
      const result = await (window as any).electronAPI?.selectDirectory()
      if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
        const path = result.filePaths[0]
        setSelectedPath(path)
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
      setShowManualInput(true)
    }
  }

  const handleStartChat = () => {
    if (selectedPath) {
      const name = selectedPath.split('/').pop() || 'Unknown Project'
      onSelectFolder(selectedPath, name)
    }
  }

  const handleManualSubmit = () => {
    if (manualPath.trim()) {
      const path = manualPath.trim()
      const name = path.split('/').pop() || 'Unknown Project'
      onSelectFolder(path, name)
      setManualPath('')
      setShowManualInput(false)
    }
  }

  // const handleRecentProjectSelect = (project: {path: string, name: string}) => {
  //   onSelectFolder(project.path, project.name)
  // }

  if (!isOpen) {
    return null
  }

  const modalContent = (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        style={{
          backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'rgba(40, 40, 40, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          boxShadow: window.matchMedia('(prefers-color-scheme: dark)').matches
            ? '0 32px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 32px 64px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          maxWidth: '440px',
          width: '100%',
          margin: '0 1.5rem',
          overflow: 'hidden',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          padding: '24px 24px 20px 24px',
          borderBottom: `1px solid ${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          
          <div style={{ textAlign: 'center', paddingRight: '50px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.01em'
            }}>
              プロジェクトフォルダを選択
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              margin: '0',
              fontWeight: '400',
              lineHeight: '1.4'
            }}>
              チャットで使用するプロジェクトを選んでください
            </p>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {!showManualInput ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={handleSelectFolder}
                style={{
                  width: '100%',
                  padding: '20px',
                  borderRadius: '16px',
                  border: window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.06)',
                  backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                    : '0 8px 24px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'rgba(0, 0, 0, 0.02)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)'
                }}>
                  <FolderOpen size={22} style={{ color: 'white' }} />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                    letterSpacing: '-0.01em'
                  }}>
                    {selectedPath || 'Select Folder'}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    fontWeight: '400'
                  }}>
                    {selectedPath ? 'Click to change folder' : 'Browse project directory'}
                  </div>
                </div>
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button
                  onClick={() => setShowManualInput(true)}
                  style={{
                    fontSize: '15px',
                    color: '#007AFF',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '400',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  Or enter path manually
                </button>
                
                {selectedPath && (
                  <div style={{ marginTop: '16px' }}>
                    <button
                      onClick={handleStartChat}
                      style={{
                        padding: '14px 32px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)'
                      }}
                    >
                      Start Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label style={{
                display: 'block',
                fontSize: '17px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                letterSpacing: '-0.01em'
              }}>
                プロジェクトパス
              </label>
              <input
                type="text"
                value={manualPath}
                onChange={(e) => setManualPath(e.target.value)}
                placeholder="/Users/username/your-project"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.03)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  backdropFilter: 'blur(10px)'
                }}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit()
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#007AFF'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualPath.trim()}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: !manualPath.trim() 
                      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                      : 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                    color: !manualPath.trim() 
                      ? 'var(--text-secondary)'
                      : 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: !manualPath.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: !manualPath.trim() ? 'none' : '0 2px 8px rgba(0, 122, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (manualPath.trim()) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (manualPath.trim()) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)'
                    }
                  }}
                >
                  選択
                </button>
                <button
                  onClick={() => {
                    setShowManualInput(false)
                    setManualPath('')
                  }}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.05)',
                    color: 'var(--text-secondary)',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = window.matchMedia('(prefers-color-scheme: dark)').matches 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = window.matchMedia('(prefers-color-scheme: dark)').matches 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.05)'
                  }}
                >
                  戻る
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}