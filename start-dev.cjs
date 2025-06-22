#!/usr/bin/env node

const { spawn } = require('child_process')
const { allocatePorts } = require('./port-config.cjs')
const fs = require('fs')
const path = require('path')

async function startDevelopment() {
  console.log('🔍 Finding available ports...')
  
  try {
    const { backendPort, frontendPort } = await allocatePorts()
    console.log(`✅ Backend: http://localhost:${backendPort}`)
    console.log(`✅ Frontend: http://localhost:${frontendPort}`)
    
    // 環境変数ファイルを作成
    const envContent = `VITE_API_BASE_URL=http://localhost:${backendPort}\nPORT=${backendPort}\nVITE_PORT=${frontendPort}`
    fs.writeFileSync('.env.local', envContent)
    console.log('📝 Created .env.local with port configuration')
    
    // フロントエンドの環境設定を更新
    const configPath = 'src/config/api.ts'
    const configContent = `export const API_BASE_URL = 'http://localhost:${backendPort}'\nexport const FRONTEND_PORT = ${frontendPort}\nexport const BACKEND_PORT = ${backendPort}\n`
    
    // configディレクトリが存在しない場合は作成
    const configDir = path.dirname(configPath)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    
    fs.writeFileSync(configPath, configContent)
    console.log('📝 Updated API configuration')
    
    // バックエンドを起動
    console.log('🚀 Starting backend server...')
    const backend = spawn('npm', ['run', 'dev'], {
      cwd: './server',
      env: { ...process.env, PORT: backendPort },
      stdio: 'inherit'
    })
    
    // 少し待ってからフロントエンドを起動
    setTimeout(() => {
      console.log('🚀 Starting frontend server...')
      const frontend = spawn('npm', ['run', 'dev'], {
        env: { ...process.env, VITE_PORT: frontendPort },
        stdio: 'inherit'
      })
      
      frontend.on('error', (err) => {
        console.error('Frontend error:', err)
        process.exit(1)
      })
    }, 2000)
    
    backend.on('error', (err) => {
      console.error('Backend error:', err)
      process.exit(1)
    })
    
    // Ctrl+Cでクリーンアップ
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down servers...')
      backend.kill()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ Failed to start development servers:', error)
    process.exit(1)
  }
}

startDevelopment()