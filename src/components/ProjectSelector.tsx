import { useState } from 'react'
import { FolderOpen, Plus } from '@phosphor-icons/react'
import { Project } from '../types/project'
// import { projectManager } from '../services/projectManager'

interface ProjectSelectorProps {
  projects: Project[]
  onSelectProject: (project: Project) => void
}

export function ProjectSelector({ projects, onSelectProject }: ProjectSelectorProps) {
  const [showPathSelector, setShowPathSelector] = useState(false)
  const [selectedPath, setSelectedPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectDirectory = async () => {
    try {
      // Check if running in Electron
      if ((window as any).electronAPI) {
        const path = await (window as any).electronAPI.selectDirectory()
        if (path) {
          setSelectedPath(path)
          return
        }
      }
      
      // Check for File System Access API (Chrome/Edge)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker()
        if (dirHandle) {
          setSelectedPath(dirHandle.name)
          return
        }
      }
      
      // Fallback: manual input
      setShowPathSelector(true)
    } catch (error) {
      // Directory selection cancelled
    }
  }

  const handlePathInput = (path: string) => {
    setSelectedPath(path)
    setShowPathSelector(false)
  }

  const handleOpenProject = async () => {
    if (!selectedPath.trim()) return

    setIsLoading(true)
    
    try {
      // Extract project name from path
      const projectName = selectedPath.split(/[/\\]/).pop() || 'Untitled Project'
      
      // Create a new project object
      const project: Project = {
        id: Date.now().toString(),
        name: projectName,
        path: selectedPath.trim(),
        lastAccessed: new Date(),
        createdAt: new Date(),
        chats: []
      }
      onSelectProject(project)
    } catch (error) {
      console.error('Failed to open project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastAccessed = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const sortedProjects = [...projects].sort((a, b) => 
    new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
  )

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="messages-container">
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px' }}>
            
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-[var(--accent)] rounded-2xl flex items-center justify-center shadow-lg">
                <FolderOpen size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-3 text-[var(--text-primary)]">
                Select Project Directory
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                Choose a directory to start working with Claude Code
              </p>
            </div>

            {/* Project Path Selection */}
            <div className="mb-8">
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={selectedPath}
                    onChange={(e) => setSelectedPath(e.target.value)}
                    placeholder="Project directory path..."
                    className="flex-1 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-base focus:border-[var(--accent)] outline-none transition-colors"
                  />
                  <button
                    onClick={handleSelectDirectory}
                    className="px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center"
                    title="Browse for folder"
                  >
                    <FolderOpen size={20} className="text-[var(--text-secondary)]" />
                  </button>
                </div>
                
                <button
                  onClick={handleOpenProject}
                  disabled={!selectedPath.trim() || isLoading}
                  className="w-full py-4 bg-[var(--accent)] text-white rounded-lg font-medium text-base hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Opening...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Open Project
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recent Projects */}
            {sortedProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Recent Projects</h2>
                <div className="space-y-3">
                  {sortedProjects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4 hover:border-[var(--accent)] cursor-pointer transition-all group"
                      onClick={() => onSelectProject(project)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <FolderOpen size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)] truncate">{project.path}</p>
                        </div>
                        <div className="text-sm text-[var(--text-tertiary)]">
                          {formatLastAccessed(project.lastAccessed)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Path Input Modal */}
      {showPathSelector && (
        <div className="drop-zone active">
          <div className="drop-zone-content">
            <div className="bg-[var(--bg-primary)] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[var(--border)]">
              <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Enter Project Path</h3>
              <input
                type="text"
                placeholder="/path/to/your/project"
                className="w-full p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] mb-4 focus:border-[var(--accent)] outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePathInput((e.target as HTMLInputElement).value)
                  }
                }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPathSelector(false)}
                  className="flex-1 py-3 px-4 border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const input = document.querySelector('.drop-zone input') as HTMLInputElement
                    if (input?.value) {
                      handlePathInput(input.value)
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}