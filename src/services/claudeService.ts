import { API_BASE_URL } from '../config/api'

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

export type ResponseMode = 'static' | 'streaming'

export class ClaudeService {
  private baseUrl: string = API_BASE_URL
  private currentRequestId: string | null = null
  private responseMode: ResponseMode = 'static'

  setResponseMode(mode: ResponseMode) {
    this.responseMode = mode
  }

  getResponseMode(): ResponseMode {
    return this.responseMode
  }


  async sendMessage(
    message: string,
    workingDirectory: string,
    onProgress?: (content: string) => void,
    isExistingChat: boolean = false
  ): Promise<ClaudeMessage> {
    if (this.responseMode === 'streaming') {
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
      // Generate unique request ID
      this.currentRequestId = Date.now().toString()
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          workingDirectory,
          requestId: this.currentRequestId,
          isExistingChat
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let finalMessage: ClaudeMessage | null = null
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          buffer += chunk
          
          // Debug: Check buffer contents byte by byte
          console.log('Buffer bytes:', Array.from(buffer).map(c => c.charCodeAt(0)))
          console.log('Looking for \\n\\n (10,10):', buffer.indexOf('\n\n'))
          
          // Try different splitting approaches
          console.log('Split by \\r\\n\\r\\n:', buffer.split('\r\n\r\n').length)
          console.log('Split by \\n\\n:', buffer.split('\n\n').length)
          
          // Process complete SSE messages
          const messages = buffer.split('\n\n')
          console.log('Split messages:', messages.length, messages)
          
          // If no proper split, try manual processing
          if (messages.length === 1 && buffer.includes('data: ')) {
            console.log('Manual processing single buffer')
            
            // Split by escaped newlines \\n\\n
            const escapedMessages = buffer.split('\\n\\n')
            console.log('Escaped split messages:', escapedMessages.length)
            
            for (const msg of escapedMessages) {
              if (msg.trim().startsWith('data: ')) {
                let jsonString = msg.trim().slice(6).trim()
                // Remove any trailing escaped newlines
                jsonString = jsonString.replace(/\\n+$/, '')
                
                try {
                  const data = JSON.parse(jsonString)
                  console.log('Manually parsed SSE data:', data)
                  
                  if (data.type === 'progress' && onProgress) {
                    onProgress(data.content)
                  } else if (data.type === 'complete') {
                    finalMessage = {
                      ...data.message,
                      timestamp: new Date(data.message.timestamp)
                    }
                  }
                } catch (parseError) {
                  // Skip unparseable content
                }
              }
            }
            buffer = '' // Clear buffer after manual processing
          } else {
            buffer = messages.pop() || '' // Keep the incomplete message in buffer
          }
          
          // Only process messages if we have multiple parts
          if (messages.length > 1) {
            for (const message of messages) {
              console.log('Processing message:', JSON.stringify(message))
              
              if (message.trim().startsWith('data: ')) {
                let jsonString = message.trim().slice(6).trim()
                if (!jsonString) continue
                
                console.log('JSON string:', jsonString)
                
                try {
                  const data = JSON.parse(jsonString)
                  console.log('Parsed SSE data:', data)
                  
                  if (data.type === 'progress' && onProgress) {
                    console.log('Calling progress callback with:', data.content)
                    onProgress(data.content)
                  } else if (data.type === 'complete') {
                    console.log('Received complete message:', data.message)
                    finalMessage = {
                      ...data.message,
                      timestamp: new Date(data.message.timestamp)
                    }
                  } else if (data.type === 'error') {
                    console.log('Received error message:', data.message)
                    finalMessage = {
                      ...data.message,
                      timestamp: new Date(data.message.timestamp)
                    }
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', parseError)
                  console.warn('Raw JSON string:', jsonString)
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
        console.log('SSE reader finished')
      }

      return finalMessage || {
        id: Date.now().toString(),
        content: 'No response received',
        role: 'assistant',
        timestamp: new Date()
      }
    } catch (error) {
      console.error('API error:', error)
      
      // Return error message
      return {
        id: Date.now().toString(),
        content: `Error communicating with server: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    console.log('Using streaming mode')
    try {
      this.currentRequestId = Date.now().toString()
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          workingDirectory,
          requestId: this.currentRequestId,
          mode: 'streaming',
          isExistingChat
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let finalMessage: ClaudeMessage | null = null
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          console.log('📦 Raw chunk:', JSON.stringify(chunk))
          buffer += chunk
          console.log('📋 Buffer length:', buffer.length)
          
          // Process JSON lines (stream-json format)
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer
          console.log('📋 Processing', lines.length, 'JSON lines')
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line.trim())
                console.log('📨 Received JSON:', data.type, data.subtype || '')
                
                // Send raw JSON for StreamingStatus display
                if (onProgress) {
                  onProgress(line.trim())
                }
                
                // Extract content for message display
                if (data.type === 'assistant' && data.message?.content) {
                  const textContent = Array.isArray(data.message.content)
                    ? data.message.content
                        .filter((item: any) => item.type === 'text')
                        .map((item: any) => item.text)
                        .join('')
                    : data.message.content
                  
                  if (textContent) {
                    finalMessage = {
                      id: data.message.id || Date.now().toString(),
                      content: textContent,
                      role: 'assistant',
                      timestamp: new Date()
                    }
                    console.log('✅ Assistant message set:', textContent.substring(0, 50) + '...')
                  }
                } else if (data.type === 'result' && data.result) {
                  // If no assistant message received yet, use result
                  if (!finalMessage) {
                    finalMessage = {
                      id: Date.now().toString(),
                      content: data.result,
                      role: 'assistant',
                      timestamp: new Date()
                    }
                    console.log('✅ Result message set:', data.result.substring(0, 50) + '...')
                  }
                }
              } catch (parseError) {
                console.warn('❌ JSON Parse error:', parseError)
                console.warn('❌ Failed line:', line.substring(0, 100))
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
        console.log('Streaming reader finished')
      }

      console.log('🏁 Returning final message:', finalMessage ? 'FOUND' : 'NOT FOUND')
      if (finalMessage) {
        console.log('🏁 Final content:', finalMessage.content.substring(0, 100) + '...')
      }
      
      return finalMessage || {
        id: Date.now().toString(),
        content: 'No streaming response received - finalMessage was null',
        role: 'assistant',
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Streaming API error:', error)
      
      return {
        id: Date.now().toString(),
        content: `Streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant',
        timestamp: new Date()
      }
    }
  }

  // private extractFilesFromResponse(content: string): FileItem[] {
  //   const files: FileItem[] = []
  //   
  //   // Look for code blocks and file references
  //   const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  //   let match
  //   let fileIndex = 1
  //   
  //   while ((match = codeBlockRegex.exec(content)) !== null) {
  //     const language = match[1] || 'text'
  //     const code = match[2]
  //     
  //     // Generate filename based on language
  //     const extension = this.getFileExtension(language)
  //     const filename = `generated_${fileIndex}.${extension}`
  //     
  //     files.push({
  //       name: filename,
  //       size: `${Math.round(code.length / 1024 * 10) / 10} KB`,
  //       type: 'code'
  //     })
  //     
  //     fileIndex++
  //   }
  //   
  //   return files
  // }

  // private getFileExtension(language: string): string {
  //   const extensions: Record<string, string> = {
  //     javascript: 'js',
  //     typescript: 'ts',
  //     jsx: 'jsx',
  //     tsx: 'tsx',
  //     python: 'py',
  //     java: 'java',
  //     cpp: 'cpp',
  //     c: 'c',
  //     html: 'html',
  //     css: 'css',
  //     json: 'json',
  //     yaml: 'yml',
  //     yml: 'yml',
  //     markdown: 'md',
  //     sql: 'sql',
  //     bash: 'sh',
  //     shell: 'sh'
  //   }
  //   
  //   return extensions[language.toLowerCase()] || 'txt'
  // }

  async checkProject(workingDirectory: string): Promise<ProjectInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/api/project/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workingDirectory
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking project:', error)
      throw error
    }
  }

  async initProject(workingDirectory: string): Promise<ClaudeMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/api/project/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workingDirectory
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        ...result.message,
        timestamp: new Date(result.message.timestamp)
      }
    } catch (error) {
      console.error('Error initializing project:', error)
      throw error
    }
  }

  async abort(): Promise<void> {
    if (this.currentRequestId) {
      try {
        await fetch(`${this.baseUrl}/api/chat/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestId: this.currentRequestId
          }),
        })
      } catch (error) {
        console.warn('Failed to cancel request:', error)
      } finally {
        this.currentRequestId = null
      }
    }
  }
}

// Export singleton instance
export const claudeService = new ClaudeService()