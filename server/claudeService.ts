import { spawn } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export interface ClaudeMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  files?: FileItem[]
}

export interface FileItem {
  name: string
  size: string
  type: 'code' | 'image' | 'document'
}

export interface ProjectInfo {
  hasClaudeConfig: boolean
  claudeConfigPath?: string
  needsInit: boolean
}

export class ClaudeService {
  private currentProcess: any = null

  async sendMessage(
    message: string,
    workingDirectory: string,
    mode: 'static' | 'streaming' = 'static',
    onProgress?: (content: string) => void,
    isExistingChat: boolean = false
  ): Promise<ClaudeMessage> {
    
    if (mode === 'streaming') {
      return this.sendMessageStreaming(message, workingDirectory, onProgress, isExistingChat)
    } else {
      return this.sendMessageStatic(message, workingDirectory, onProgress, isExistingChat)
    }
  }

  private async sendMessageStatic(
    message: string,
    workingDirectory: string,
    onProgress?: (content: string) => void,
    isExistingChat: boolean = false
  ): Promise<ClaudeMessage> {
    try {
      let fullResponse = ''

      return new Promise((resolve, reject) => {
        // Execute claude command with simple text output
        const args = ['-p', '--permission-mode', 'bypassPermissions']
        if (isExistingChat) {
          args.push('--continue')
        }
        args.push(message)
        
        this.currentProcess = spawn('claude', args, {
          cwd: workingDirectory,
          stdio: ['ignore', 'pipe', 'pipe']
        })

        this.currentProcess.stdout.on('data', (data: Buffer) => {
          const chunk = data.toString()
          fullResponse += chunk
          
          // Call progress callback if provided
          if (onProgress) {
            onProgress(fullResponse)
          }
        })

        this.currentProcess.stderr.on('data', (data: Buffer) => {
          console.error('Claude error:', data.toString())
        })

        this.currentProcess.on('close', (code: number) => {
          this.currentProcess = null
          
          if (code === 0) {
            // Extract files from the response if any
            const files = this.extractFilesFromResponse(fullResponse)

            resolve({
              id: Date.now().toString(),
              content: fullResponse || 'Command completed successfully.',
              role: 'assistant',
              timestamp: new Date(),
              files: files.length > 0 ? files : undefined
            })
          } else {
            reject(new Error(`Claude command failed with exit code ${code}`))
          }
        })

        this.currentProcess.on('error', (error: Error) => {
          console.error('Claude process error:', error)
          this.currentProcess = null
          reject(error)
        })
      })
    } catch (error) {
      console.error('Claude Code execution error:', error)
      
      // Return error message
      return {
        id: Date.now().toString(),
        content: `Error executing Claude Code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant',
        timestamp: new Date()
      }
    }
  }

  private async sendMessageStreaming(
    message: string,
    workingDirectory: string,
    onProgress?: (content: string) => void,
    isExistingChat: boolean = false
  ): Promise<ClaudeMessage> {
    try {
      let fullResponse = ''
      let finalResult = ''

      return new Promise((resolve, reject) => {
        // Execute claude command with streaming JSON output
        const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'bypassPermissions']
        if (isExistingChat) {
          args.push('--continue')
        }
        args.push(message)
        
        this.currentProcess = spawn('claude', args, {
          cwd: workingDirectory,
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let buffer = ''
        this.currentProcess.stdout.on('data', (data: Buffer) => {
          const chunk = data.toString()
          buffer += chunk
          
          // Process complete lines for stream-json format
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.trim()) {
              
              try {
                const json = JSON.parse(line)
                
                // Forward the raw JSON line directly to frontend
                if (onProgress) {
                  onProgress(line + '\n')
                }
                
                // Also extract content for local processing
                if (json.type === 'assistant' && json.message?.content) {
                  const textContent = Array.isArray(json.message.content)
                    ? json.message.content
                        .filter((item: any) => item.type === 'text')
                        .map((item: any) => item.text)
                        .join('')
                    : json.message.content
                  
                  if (textContent) {
                    fullResponse = textContent
                  }
                } else if (json.type === 'result') {
                  if (json.result) {
                    finalResult = json.result
                  }
                }
              } catch (parseError) {
                // Skip unparseable JSON
              }
            }
          }
        })

        this.currentProcess.stderr.on('data', (data: Buffer) => {
          console.error('Claude streaming error:', data.toString())
        })

        this.currentProcess.on('close', (code: number) => {
          this.currentProcess = null
          
          if (code === 0) {
            // Use final result if available, otherwise use last response content
            const content = finalResult || fullResponse || 'Streaming completed but no content received.'
            const files = this.extractFilesFromResponse(content)

            resolve({
              id: Date.now().toString(),
              content,
              role: 'assistant',
              timestamp: new Date(),
              files: files.length > 0 ? files : undefined
            })
          } else {
            reject(new Error(`Claude streaming command failed with exit code ${code}`))
          }
        })

        this.currentProcess.on('error', (error: Error) => {
          console.error('Claude streaming process error:', error)
          this.currentProcess = null
          reject(error)
        })
      })
    } catch (error) {
      console.error('Claude Code streaming execution error:', error)
      
      // Return error message
      return {
        id: Date.now().toString(),
        content: `Error executing Claude Code streaming: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant',
        timestamp: new Date()
      }
    }
  }

  private extractFilesFromResponse(content: string): FileItem[] {
    const files: FileItem[] = []
    
    // Look for code blocks and file references
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    let match
    let fileIndex = 1
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text'
      const code = match[2]
      
      // Generate filename based on language
      const extension = this.getFileExtension(language)
      const filename = `generated_${fileIndex}.${extension}`
      
      files.push({
        name: filename,
        size: `${Math.round(code.length / 1024 * 10) / 10} KB`,
        type: 'code'
      })
      
      fileIndex++
    }
    
    return files
  }

  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      jsx: 'jsx',
      tsx: 'tsx',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yml',
      yml: 'yml',
      markdown: 'md',
      sql: 'sql',
      bash: 'sh',
      shell: 'sh'
    }
    
    return extensions[language.toLowerCase()] || 'txt'
  }

  checkProject(workingDirectory: string): ProjectInfo {
    const claudeConfigPaths = [
      join(workingDirectory, 'CLAUDE.md'),
      join(workingDirectory, 'Claude.md'),
      join(workingDirectory, 'claude.md'),
      join(workingDirectory, '.claude.md')
    ]

    for (const configPath of claudeConfigPaths) {
      if (existsSync(configPath)) {
        return {
          hasClaudeConfig: true,
          claudeConfigPath: configPath,
          needsInit: false
        }
      }
    }

    return {
      hasClaudeConfig: false,
      needsInit: true
    }
  }

  async initProject(workingDirectory: string): Promise<ClaudeMessage> {
    try {
      let fullResponse = ''

      return new Promise((resolve, reject) => {
        // Execute claude init command with JSON output
        this.currentProcess = spawn('claude', ['init', '--output-format', 'json'], {
          cwd: workingDirectory,
          stdio: ['pipe', 'pipe', 'pipe']
        })

        this.currentProcess.stdout.on('data', (data: Buffer) => {
          fullResponse += data.toString()
        })

        this.currentProcess.stderr.on('data', (data: Buffer) => {
          console.error('Claude init error:', data.toString())
        })

        this.currentProcess.on('close', (code: number) => {
          this.currentProcess = null
          
          if (code === 0) {
            resolve({
              id: Date.now().toString(),
              content: fullResponse || 'Project initialized successfully! Claude Code is now ready to assist with your project.',
              role: 'assistant',
              timestamp: new Date()
            })
          } else {
            reject(new Error(`Claude init failed with exit code ${code}`))
          }
        })

        this.currentProcess.on('error', (error: Error) => {
          this.currentProcess = null
          reject(error)
        })
      })
    } catch (error) {
      console.error('Claude init execution error:', error)
      
      return {
        id: Date.now().toString(),
        content: `Error initializing project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant',
        timestamp: new Date()
      }
    }
  }

  abort(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM')
      this.currentProcess = null
    }
  }
}

// Export singleton instance
export const claudeService = new ClaudeService()