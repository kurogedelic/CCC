import { useState, useEffect, useRef } from 'react'

interface TypewriterTextProps {
  text: string
  messageId: string
  isStreaming?: boolean
  isProgressPreview?: boolean
  speed?: number
}

export function TypewriterText({ text, messageId, isStreaming = false, isProgressPreview = false, speed = 20 }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // const [shouldAnimate, setShouldAnimate] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousTextRef = useRef('')

  useEffect(() => {
    // Progress preview shows immediately without animation
    if (isProgressPreview) {
      setDisplayedText(text)
      setIsTyping(false)
      // setShouldAnimate(false)
      previousTextRef.current = text
      return
    }

    // Only animate for new messages or when text changes significantly
    const textChanged = text !== previousTextRef.current
    const isNewMessage = displayedText === ''
    
    if (textChanged && (isNewMessage || isStreaming)) {
      // setShouldAnimate(true)
      setIsTyping(true)
      
      // If streaming, show text immediately for better UX
      if (isStreaming) {
        setDisplayedText(text)
        setIsTyping(false)
        // setShouldAnimate(false)
      } else {
        // Typewriter effect for completed messages
        setDisplayedText('')
        let index = 0
        
        const typeNext = () => {
          if (index < text.length) {
            setDisplayedText(text.slice(0, index + 1))
            index++
            timeoutRef.current = setTimeout(typeNext, speed)
          } else {
            setIsTyping(false)
            // setShouldAnimate(false)
          }
        }
        
        // Start typing after a brief delay
        timeoutRef.current = setTimeout(typeNext, 100)
      }
    } else if (!isStreaming && text === previousTextRef.current) {
      // For static text that hasn't changed, show immediately
      setDisplayedText(text)
      setIsTyping(false)
      // setShouldAnimate(false)
    }

    previousTextRef.current = text

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, isStreaming, isProgressPreview, speed])

  const renderMarkdown = (content: string, key: string) => {
    let processed = content
    
    // Code blocks
    processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, __, code) => {
      return `<pre style="background-color: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin: 8px 0; font-family: 'SF Mono', Monaco, monospace; font-size: 13px; overflow-x: auto;"><code>${code.trim()}</code></pre>`
    })
    
    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '<code style="background-color: var(--bg-tertiary); padding: 2px 4px; border-radius: 3px; font-family: \'SF Mono\', Monaco, monospace; font-size: 13px;">$1</code>')
    
    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
    
    // Italic
    processed = processed.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
    
    // Headers
    processed = processed.replace(/^### (.*$)/gm, '<h3 style="font-size: 16px; font-weight: 600; margin: 12px 0 8px 0; color: var(--text-primary);">$1</h3>')
    processed = processed.replace(/^## (.*$)/gm, '<h2 style="font-size: 18px; font-weight: 600; margin: 16px 0 8px 0; color: var(--text-primary);">$1</h2>')
    processed = processed.replace(/^# (.*$)/gm, '<h1 style="font-size: 20px; font-weight: 600; margin: 16px 0 8px 0; color: var(--text-primary);">$1</h1>')
    
    // Lists
    processed = processed.replace(/^- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
    processed = processed.replace(/^(\d+)\. (.*$)/gm, '<li style="margin: 4px 0;">$2</li>')
    
    // Wrap consecutive list items in ul
    processed = processed.replace(/(<li.*?<\/li>\s*)+/g, (match) => {
      return `<ul style="margin: 8px 0; padding-left: 20px;">${match}</ul>`
    })

    return (
      <div 
        key={key}
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    )
  }

  return (
    <div 
      className={`typewriter-container ${isTyping ? 'typewriter' : 'typewriter-finished'} ${isProgressPreview ? 'progress-preview' : ''}`}
      style={{ 
        fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
        fontSize: '15px',
        lineHeight: '1.6'
      }}
    >
      {renderMarkdown(displayedText, messageId)}
      {isTyping && !isProgressPreview && (
        <span className="typewriter-cursor" style={{ 
          borderRight: '2px solid var(--accent)', 
          animation: 'typing 1s infinite' 
        }}></span>
      )}
    </div>
  )
}