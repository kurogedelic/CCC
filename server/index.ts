import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { claudeService, type ClaudeMessage, type ProjectInfo } from './claudeService'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'file://'],
  credentials: true
}))
app.use(express.json())

// Store active requests to allow cancellation
const activeRequests = new Map<string, () => void>()

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Chat endpoint with streaming support
app.post('/api/chat', async (req: any, res: any) => {
  try {
    const { message, requestId, workingDirectory, mode = 'static', isExistingChat = false } = req.body
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    if (!workingDirectory || typeof workingDirectory !== 'string') {
      return res.status(400).json({ error: 'Working directory is required' })
    }

    // Set up headers for JSON streaming
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    })

    let currentContent = ''
    
    // Store abort function for this request
    const abortFn = () => {
      claudeService.abort()
      res.end()
    }
    
    if (requestId) {
      activeRequests.set(requestId, abortFn)
    }

    try {
      const response = await claudeService.sendMessage(
        message,
        workingDirectory,
        mode,
        (streamData) => {
          // Forward raw streaming data directly
          res.write(streamData)
        },
        isExistingChat
      )

      // Send final response as JSON line (if not already sent via streaming)
      if (!response.content.includes('stream')) {
        res.write(JSON.stringify({
          type: 'final_result',
          message: response
        }) + '\n')
      }
      
    } catch (error) {
      console.error('Error in chat endpoint:', error)
      
      const errorMessage: ClaudeMessage = {
        id: Date.now().toString(),
        content: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant',
        timestamp: new Date()
      }
      
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: errorMessage 
      })}\\n\\n`)
    } finally {
      // Clean up
      if (requestId) {
        activeRequests.delete(requestId)
      }
      res.end()
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Cancel request endpoint
app.post('/api/chat/cancel', (req: any, res: any) => {
  const { requestId } = req.body
  
  if (requestId && activeRequests.has(requestId)) {
    const abortFn = activeRequests.get(requestId)!
    abortFn()
    activeRequests.delete(requestId)
    res.json({ success: true })
  } else {
    res.status(404).json({ error: 'Request not found' })
  }
})

// Check project for Claude.md
app.post('/api/project/check', (req: any, res: any) => {
  const { workingDirectory } = req.body
  
  if (!workingDirectory || typeof workingDirectory !== 'string') {
    return res.status(400).json({ error: 'Working directory is required' })
  }
  
  try {
    const projectInfo = claudeService.checkProject(workingDirectory)
    res.json(projectInfo)
  } catch (error) {
    console.error('Error checking project:', error)
    res.status(500).json({ 
      error: 'Failed to check project',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Initialize project with Claude Code
app.post('/api/project/init', async (req: any, res: any) => {
  const { workingDirectory } = req.body
  
  if (!workingDirectory || typeof workingDirectory !== 'string') {
    return res.status(400).json({ error: 'Working directory is required' })
  }
  
  try {
    const result = await claudeService.initProject(workingDirectory)
    res.json({ message: result })
  } catch (error) {
    console.error('Error initializing project:', error)
    res.status(500).json({ 
      error: 'Failed to initialize project',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})