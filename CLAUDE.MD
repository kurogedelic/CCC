# CCC - Claude Code Client

A modern web interface for Claude Code CLI with real-time streaming, advanced settings, and cross-platform desktop support.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install
cd server && npm install

# Start development servers
npm run dev:full
```

### Production Build
```bash
npm run build
npm run server:build
```

### Electron Desktop Build
```bash
npm run electron:build
```

## 📋 プロジェクト概要

Claude Code ClientはターミナルベースのClaude Codeに対してモダンなWebUIを提供するマルチプラットフォームアプリケーションです。

## 🛠️ 技術スタック

### Frontend Stack
- **React 18** - Modern hooks-based UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling (minimal usage)
- **Custom CSS Variables** - Dynamic theming system
- **Phosphor Icons** - Consistent iconography

### Backend Stack  
- **Express.js** - Lightweight HTTP server
- **Claude Code CLI Integration** - Direct subprocess spawning
- **Server-Sent Events** - Real-time streaming
- **CORS** - Cross-origin resource sharing

### Desktop Integration
- **Capacitor Community Electron** - Desktop wrapper
- **Electron Builder** - Cross-platform packaging
- **Auto-updater Ready** - GitHub releases integration

### Build & Deploy
- **Vite** - Fast frontend bundling
- **TypeScript Compiler** - Server-side compilation
- **GitHub Actions** - Automated CI/CD
- **Multi-platform Builds** - macOS, Linux, Windows support

## ✨ 実装済み機能

### Core Features
- ✅ **Real-time Chat Interface** - ChatGPT-style UI with typewriter animations
- ✅ **Streaming Response** - Live Claude Code output parsing
- ✅ **Project Management** - Easy workspace selection and switching
- ✅ **Auto Dark/Light Mode** - System preference detection
- ✅ **Conversation History** - Persistent chat sessions
- ✅ **Cost Tracking** - Real-time API usage display ($-0.000123 format)

### Advanced UI Features
- ✅ **Verbose/Non-verbose Modes** - Toggle between detailed JSON vs clean content
- ✅ **Type-specific Styling** - Color-coded content based on JSON type
- ✅ **Custom CSS Support** - User-editable styling via `src/styles/custom.css`
- ✅ **Content Preservation** - Tool usage and assistant messages never disappear
- ✅ **Smart Chat Previews** - 45-char truncated excerpts with monospace styling

### Settings & Customization
- ✅ **Advanced Settings Modal** - Tabbed interface with save/discard functionality
- ✅ **Font Customization** - Separate body and code font selection
- ✅ **Dynamic Font Sizing** - Point-based size input (8-24pt)
- ✅ **Color Theme Presets** - 8 built-in accent colors beyond Claude Orange
- ✅ **Real-time Preview** - Settings apply immediately via CSS variables

## 🚀 Release Process

### Automated GitHub Releases

#### Setup Repository
```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit"

# Add remote origin  
git remote add origin https://github.com/username/CCC.git
git push -u origin main
```

#### Create Release
```bash
# Create and push version tag
git tag v1.0.0
git push origin v1.0.0
```

#### GitHub Actions Build
- Automatically triggers on version tags (`v*.*.*`)
- Builds for macOS (Intel + Apple Silicon) and Linux (x64)
- Creates GitHub release with downloadable assets

### Manual Release Process
```bash
# Prepare release build
npm run build
npm run server:build

# Build Electron apps
npm run electron:build

# Distribution (from electron directory)
cd electron
npm run dist
```

### Build Targets

| Platform | Architecture | Output Format | Status |
|----------|-------------|---------------|---------|
| macOS    | x64, arm64  | .dmg, .zip    | ✅ Ready |
| Linux    | x64         | .deb, .tar.gz | ✅ Ready |
| Windows  | x64         | .exe, .zip    | 🔄 Configured |

## 🧪 開発・テスト手順

### Development Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ../electron && npm install
   ```

2. **Start Development Servers**
   ```bash
   # Full stack development
   npm run dev:full

   # Individual servers (for debugging)
   npm run server:dev  # Backend only
   npm run dev         # Frontend only
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file (optional)
   echo "REACT_APP_API_BASE_URL=http://localhost:3002" > .env
   ```

### Testing Procedures

#### 1. Core Functionality Tests
- ✅ Project folder selection and initialization
- ✅ Claude Code CLI integration and communication
- ✅ Real-time streaming response display
- ✅ Chat history persistence and navigation

#### 2. Streaming Display Tests
- ✅ JSON type color coding verification:
  - **system**: Gray border
  - **assistant**: Green border  
  - **user**: Blue border
  - **result**: Orange border
  - **final_result**: Red border

#### 3. Settings Functionality Tests
- ✅ Accent color changes apply immediately
- ✅ Font size and family changes affect UI
- ✅ Save/Discard button functionality
- ✅ Verbose/Non-verbose mode switching

#### 4. Cross-platform Compatibility Tests
- ✅ macOS: Intel and Apple Silicon support
- ✅ Linux: Ubuntu/Debian compatibility
- 🔄 Windows: Basic functionality (in progress)

## 🏆 実装上の成功点

### ✅ Advanced Streaming Architecture
- **Full Claude Code Integration** - Complete `--output-format stream-json` support
- **Real-time JSON Processing** - Live parsing and type-based routing
- **Content Preservation** - Tool usage and assistant messages never disappear
- **Dual Mode Display** - Verbose JSON view + clean non-verbose extraction

### ✅ Dynamic Theming System  
- **CSS Variables** - Real-time theme changes via JavaScript
- **8 Color Presets** - Beyond Claude Orange with instant preview
- **Font Customization** - Separate body/code font selection with pt sizing
- **User Stylesheet** - Custom CSS support via `src/styles/custom.css`

### ✅ Settings Management
- **Temporary Changes** - Save/Discard workflow with change detection
- **LocalStorage Persistence** - Settings survive browser restarts
- **Real-time Application** - Changes apply immediately via CSS variables
- **Type Safety** - Full TypeScript coverage for settings

### ✅ Cross-platform Desktop
- **Electron Integration** - Native desktop experience via Capacitor
- **Auto-build System** - GitHub Actions for macOS + Linux releases
- **Universal Binaries** - Apple Silicon + Intel support

## 🔄 課題・改善エリア

### Performance Optimization
- **Memory Management** - Large JSON stream handling optimization needed
- **Long Session Stability** - Multi-hour conversation support
- **Mobile Responsiveness** - Sidebar toggle implementation pending

### Error Handling Enhancement
- **Network Recovery** - Automatic reconnection on connection loss
- **CLI Error Recovery** - Better handling of Claude Code crashes
- **User Feedback** - More descriptive error messages

### Feature Expansion  
- **File Upload** - Drag & drop file integration
- **Export Functionality** - Chat history export to various formats
- **Advanced Search** - Cross-conversation search capabilities

## 🏗️ Architecture Deep Dive

### Project Structure
```
CCC/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── ChatInterface.tsx     # Main chat UI with streaming
│   │   ├── Sidebar.tsx           # Project navigation + chat list
│   │   ├── SettingsModal.tsx     # Advanced settings with tabs
│   │   └── TypewriterText.tsx    # Animated text display
│   ├── contexts/                 # React contexts
│   │   └── SettingsContext.tsx   # Settings management + CSS variables
│   ├── services/                 # API services  
│   │   ├── claudeService.ts      # Claude Code CLI integration
│   │   └── projectManager.ts     # Local project management
│   ├── styles/                   # Styling
│   │   ├── custom.css            # User-editable customizations
│   │   └── index.css             # Core styling with CSS variables
│   ├── types/                    # TypeScript definitions
│   └── utils/                    # Utility functions
│       └── contentExtractor.ts   # JSON parsing for non-verbose mode
├── server/                       # Backend Express server
│   └── src/                      # Server source with Claude Code spawning
├── electron/                     # Electron desktop app
│   ├── package.json              # Electron Builder configuration
│   └── assets/                   # Application icons
└── .github/workflows/            # CI/CD automation
    └── release.yml               # Automated builds on tags
```

### Data Flow Architecture
1. **User Input** → ChatInterface component
2. **API Request** → claudeService with subprocess spawning
3. **Claude Code CLI** → `--output-format stream-json --verbose`
4. **Raw JSON Stream** → Real-time parsing and type detection
5. **Content Processing** → Verbose vs non-verbose extraction
6. **UI Updates** → React state + CSS variable application
7. **Persistence** → LocalStorage for settings + chat history

### Streaming Implementation
```typescript
// Core streaming processing logic
claudeService.sendMessage(input, projectPath, (jsonData) => {
  const parsed = JSON.parse(jsonData)
  
  // Type-based processing
  switch (parsed.type) {
    case 'system': // Gray border, initialization
    case 'assistant': // Green border, tool usage
    case 'user': // Blue border, tool results  
    case 'result': // Orange border, completion summary
    case 'final_result': // Red border, final response
  }
  
  // Content preservation via refs
  currentNonVerboseContentRef.current.push(extractedContent)
  
  // Immediate UI update
  setCurrentNonVerboseContent(prev => [...prev, extractedContent])
})
```

## 📱 Claude Code Stream JSON Format

CCC processes Claude Code's `--output-format stream-json` output with full type support and real-time parsing.

### Supported Message Types

#### 1. System Initialization
```json
{
  "type": "system",
  "subtype": "init", 
  "cwd": "/path/to/project",
  "session_id": "uuid",
  "tools": ["Task", "Bash", "Glob", "Grep", "LS"],
  "model": "claude-sonnet-4-20250514"
}
```
**UI Treatment**: Gray border, shows "🔧 Initializing Claude Code session..."

#### 2. Assistant Messages  
```json
{
  "type": "assistant",
  "message": {
    "content": [{"type": "text", "text": "Response text"}],
    "usage": {"input_tokens": 123, "output_tokens": 456}
  }
}
```
**UI Treatment**: Green border, full text content + tool usage indicators

#### 3. Tool Results
```json
{
  "type": "user",
  "message": {
    "content": [{"type": "tool_result", "content": "Tool output"}]
  }
}
```
**UI Treatment**: Blue border, shows "📄 Tool completed" summary

#### 4. Completion Summary
```json
{
  "type": "result",
  "total_cost_usd": 0.001234,
  "duration_ms": 3500,
  "usage": {"input_tokens": 100, "output_tokens": 50}
}
```
**UI Treatment**: Orange border, cost and timing information

#### 5. Final Response
```json
{
  "type": "final_result",
  "message": {"content": "Final response to user"}
}
```
**UI Treatment**: Red border, primary user-facing content

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### Settings Changes Not Applying
**Symptoms**: Color/font changes don't affect UI
**Solution**: Check CSS variable application in browser dev tools
```javascript
// Debug CSS variables in console
const root = document.documentElement
console.log(root.style.getPropertyValue('--accent'))
```

#### Content Duplication
**Symptoms**: Messages appear twice in non-verbose mode
**Solution**: Fixed in v1.0+ via ref-based deduplication

#### Streaming Connection Issues
**Symptoms**: "No streaming response received"
**Solution**: 
1. Verify Claude Code CLI: `claude --version`
2. Check server health: `curl http://localhost:3002/health`
3. Restart development servers

#### Electron Build Failures
**Platform-specific Solutions**:
- **macOS**: Install Xcode Command Line Tools
- **Linux**: Install `build-essential` package
- **Windows**: Install Visual Studio Build Tools

## 🚀 Deployment Options

### Development
```bash
npm run dev:full    # Both frontend + backend
```

### Production Web
```bash
npm run build
npm run server:start
```

### Desktop Distribution
```bash
npm run electron:build
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "run", "server:start"]
```

## 📞 Support & Contribution

### Getting Help
- 🐛 **Bug Reports**: GitHub Issues with reproduction steps
- 💬 **Feature Requests**: GitHub Discussions
- 📖 **Documentation**: This CLAUDE.md file

### Contributing
1. **Fork** → Create feature branch
2. **Develop** → Follow TypeScript/React patterns  
3. **Test** → Verify cross-platform compatibility
4. **PR** → Include detailed description

### Development Philosophy
- **Type Safety First** - Full TypeScript coverage
- **User Experience** - Smooth, responsive interactions
- **Performance** - Efficient streaming and memory usage
- **Accessibility** - Keyboard navigation and screen readers

---

**Created for the Claude Code community**  
*Last updated: June 2024*

## 🔖 Quick Reference

| Task | Command |
|------|---------|
| Start Development | `npm run dev:full` |
| Build Production | `npm run build && npm run server:build` |
| Create Release | `git tag v1.0.0 && git push origin v1.0.0` |
| Debug Streaming | Check browser console for 🔍/✅/❌ logs |
| Edit Themes | Modify `src/styles/custom.css` |
| Reset Settings | Settings → General → Reset to Defaults |