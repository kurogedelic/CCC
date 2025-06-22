// Extract user-facing content from Claude Code SDK responses
export interface ExtractedContent {
  hasContent: boolean
  content: string
  shouldDisplay: boolean
  type?: string  // Add type for styling
}

export function extractContentFromStreamData(jsonData: string): ExtractedContent {
  try {
    const parsed = JSON.parse(jsonData)
    
    switch (parsed.type) {
      case 'system':
        // System messages - show simple initialization for verbose=false
        if (parsed.subtype === 'init') {
          return {
            hasContent: true,
            content: '🔧 Initializing Claude Code session...',
            shouldDisplay: true,
            type: 'system'
          }
        }
        // Show other system messages too
        return {
          hasContent: true,
          content: `📋 System: ${parsed.subtype || 'message'}`,
          shouldDisplay: true,
          type: 'system'
        }
      
      case 'assistant':
        // Assistant messages with actual text content
        if (parsed.message?.content) {
          const textContent = parsed.message.content
            .filter((item: any) => item.type === 'text')
            .map((item: any) => item.text)
            .join(' ')
          
          if (textContent.trim()) {
            return {
              hasContent: true,
              content: textContent,
              shouldDisplay: true,
              type: 'assistant'
            }
          }
          
          // Tool use - show simple indicator
          const hasToolUse = parsed.message.content.some((item: any) => item.type === 'tool_use')
          if (hasToolUse) {
            const toolNames = parsed.message.content
              .filter((item: any) => item.type === 'tool_use')
              .map((item: any) => item.name)
              .join(', ')
            return {
              hasContent: true,
              content: `⚙️ Using tools: ${toolNames}`,
              shouldDisplay: true,
              type: 'assistant'
            }
          }
        }
        return { hasContent: false, content: '', shouldDisplay: false }
      
      case 'user':
        // Tool results - show simplified version
        if (parsed.message?.content) {
          // Look for tool_result content
          const toolResults = parsed.message.content.filter((item: any) => item.type === 'tool_result')
          if (toolResults.length > 0) {
            return {
              hasContent: true,
              content: `📄 Tool completed (${toolResults.length} result${toolResults.length > 1 ? 's' : ''})`,
              shouldDisplay: true,
              type: 'user'
            }
          }
        }
        return { hasContent: false, content: '', shouldDisplay: false }
      
      case 'result':
        // Final result from Claude Code - show summary
        if (parsed.result && typeof parsed.result === 'string') {
          return {
            hasContent: true,
            content: `✅ Task completed: ${parsed.result.substring(0, 100)}${parsed.result.length > 100 ? '...' : ''}`,
            shouldDisplay: true,
            type: 'result'
          }
        }
        return {
          hasContent: true,
          content: `✅ Task completed (${parsed.duration_ms}ms, $${parsed.total_cost_usd?.toFixed(4) || '0'})`,
          shouldDisplay: true,
          type: 'result'
        }
      
      case 'final_result':
        // Final user-facing result - show full content
        if (parsed.message?.content) {
          // Handle both string and array content formats
          let finalContent = parsed.message.content
          if (Array.isArray(parsed.message.content)) {
            finalContent = parsed.message.content
              .filter((item: any) => item.type === 'text')
              .map((item: any) => item.text)
              .join(' ')
          }
          return {
            hasContent: true,
            content: finalContent,
            shouldDisplay: true,
            type: 'final_result'
          }
        }
        return { hasContent: false, content: '', shouldDisplay: false }
      
      default:
        return { hasContent: false, content: '', shouldDisplay: false }
    }
  } catch (error) {
    return { hasContent: false, content: '', shouldDisplay: false }
  }
}

// Extract final content from completed message
export function extractFinalContent(message: any): string {
  if (!message || !message.content) return ''
  
  // If content is a string, return it directly
  if (typeof message.content === 'string') {
    return message.content
  }
  
  // If content is an array, extract text from text nodes
  if (Array.isArray(message.content)) {
    return message.content
      .filter((item: any) => item.type === 'text')
      .map((item: any) => item.text)
      .join(' ')
  }
  
  return ''
}