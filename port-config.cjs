const net = require('net')

// 使いたくないポート（よく使われるポート）
const AVOID_PORTS = [3000, 3001, 8080, 8000, 5000, 5173, 4173]

// ポートが利用可能かチェック
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.once('close', () => resolve(true))
      server.close()
    })
    server.on('error', () => resolve(false))
  })
}

// 利用可能なポートを見つける
async function findAvailablePort(startPort = 3010) {
  for (let port = startPort; port < startPort + 100; port++) {
    if (AVOID_PORTS.includes(port)) continue
    
    if (await checkPort(port)) {
      return port
    }
  }
  throw new Error('No available port found')
}

// フロントエンドとバックエンドのポート割り当て
async function allocatePorts() {
  const backendPort = await findAvailablePort(3010)
  const frontendPort = await findAvailablePort(backendPort + 1)
  
  return { backendPort, frontendPort }
}

module.exports = { findAvailablePort, allocatePorts, checkPort }

// CLIで実行された場合
if (require.main === module) {
  allocatePorts().then(({ backendPort, frontendPort }) => {
    console.log(JSON.stringify({ backendPort, frontendPort }))
  }).catch(console.error)
}