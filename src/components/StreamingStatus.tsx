import { useState, useEffect } from 'react'

interface StreamingStatusProps {
  statusData: string
}

interface StatusInfo {
  type: string
  session_id?: string
  model?: string
  tools?: number
  mcp_servers?: Array<{name: string, status: string}>
  permission_mode?: string
  content?: string
  usage?: {
    input_tokens?: number
    output_tokens?: number
    cache_read_input_tokens?: number
    cache_creation_input_tokens?: number
  }
  duration_ms?: number
  duration_api_ms?: number
  num_turns?: number
  total_cost_usd?: number
  subtype?: string
}

export function StreamingStatus({ statusData }: StreamingStatusProps) {
  const [status, setStatus] = useState<StatusInfo | null>(null)
  // const [history, setHistory] = useState<StatusInfo[]>([])

  useEffect(() => {
    if (!statusData) return

    try {
      const parsed = JSON.parse(statusData)
      setStatus(parsed)
      // setHistory(prev => [...prev, parsed].slice(-5)) // Keep last 5 statuses
    } catch (error) {
      console.warn('Failed to parse status data:', error)
    }
  }, [statusData])

  if (!status) return null

  // const formatTokens = (tokens: number) => 
  //   tokens > 1000 ? `${(tokens / 1000).toFixed(1)}K` : tokens.toString()

  const formatCost = (cost: number) => 
    cost < 0.01 ? `$${(cost * 1000).toFixed(1)}m` : `$${cost.toFixed(3)}`

  const formatDuration = (ms: number) => 
    ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`

  return (
    <div className="streaming-status">
      {/* System initialization */}
      {status.type === 'system' && status.subtype === 'init' && (
        <div className="text-xs text-[var(--text-secondary)] mb-2 opacity-75">
          ⚡ Session started • Model: {status.model} • Tools: {(status as any).tools?.length || 0} • Session ID: {status.session_id?.substring(0, 8)}...
        </div>
      )}

      {/* Assistant message processing */}
      {status.type === 'assistant' && (status as any).message && (
        <div className="text-xs text-[var(--text-secondary)] mb-2 opacity-75 flex items-center gap-2">
          <span>🤖 Processing:</span>
          <span className="italic">
            {(() => {
              const content = (status as any).message.content
              if (Array.isArray(content)) {
                const textContent = content
                  .filter((item: any) => item.type === 'text')
                  .map((item: any) => item.text)
                  .join('')
                const toolUse = content.find((item: any) => item.type === 'tool_use')
                if (textContent) {
                  return textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent
                } else if (toolUse) {
                  return `Using ${toolUse.name} tool...`
                }
                return 'Processing...'
              }
              return typeof content === 'string' ? (content.length > 50 ? content.substring(0, 50) + '...' : content) : 'Processing...'
            })()}
          </span>
        </div>
      )}

      {/* User/Tool result */}
      {status.type === 'user' && (status as any).message && (
        <div className="text-xs text-[var(--text-secondary)] mb-2 opacity-75 flex items-center gap-2">
          <span>🔧 Tool result:</span>
          <span className="italic">
            {(() => {
              const content = (status as any).message.content
              if (Array.isArray(content)) {
                const toolResult = content.find((item: any) => item.type === 'tool_result')
                if (toolResult) {
                  const resultText = typeof toolResult.content === 'string' ? toolResult.content : 'Tool executed'
                  return resultText.length > 50 ? resultText.substring(0, 50) + '...' : resultText
                }
              }
              return 'Tool completed'
            })()}
          </span>
        </div>
      )}

      {/* Result summary */}
      {status.type === 'result' && (
        <div className="text-xs text-[var(--text-secondary)] mb-2 opacity-75 flex items-center gap-2">
          <span>✅ Completed {status.subtype === 'success' ? 'successfully' : 'with issues'}</span>
          {status.duration_ms && (
            <span>• {formatDuration(status.duration_ms)}</span>
          )}
          {status.total_cost_usd && (
            <span>• {formatCost(status.total_cost_usd)}</span>
          )}
          {status.num_turns && (
            <span>• {status.num_turns} turns</span>
          )}
        </div>
      )}
    </div>
  )
}