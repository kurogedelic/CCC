# CCC - Claude Code Client

A modern web interface for [Claude Code CLI](https://claude.ai/code) that provides a user-friendly GUI for interacting with Claude Code through a desktop application.

![CCC Interface](https://via.placeholder.com/800x400/ff6b35/white?text=CCC+Interface)

## ✨ Features

- 🎨 **Modern UI** - Clean, intuitive interface with dark/light theme support
- 💬 **Chat Interface** - ChatGPT-style conversation view with typewriter animations
- 🔄 **Real-time Streaming** - Live Claude Code output with JSON stream parsing
- 📁 **Project Management** - Easy project selection and workspace integration
- ⚙️ **Advanced Settings** - Customizable appearance, fonts, and themes
- 💰 **Cost Tracking** - Real-time API usage cost display
- 🖥️ **Cross-platform** - Available for macOS, Windows, and Linux
- 📱 **Responsive** - Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- [Claude Code CLI](https://claude.ai/code) installed and configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/CCC.git
   cd CCC
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev:full
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📦 Building

### Web Application
```bash
npm run build
npm run preview
```

### Desktop Application (Electron)
```bash
npm run electron:build
npm run electron:start
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3002

# Claude Code Configuration  
CLAUDE_CODE_PATH=/usr/local/bin/claude

# Server Configuration
SERVER_PORT=3002
```

### Settings

Access settings through the gear icon in the sidebar:

- **General**: Working directory, auto-save, verbose mode
- **Appearance**: Themes, fonts, colors, custom CSS
- **Privacy**: Analytics, chat history management

## 🎨 Customization

### Custom Styling

Edit `src/styles/custom.css` to customize the appearance:

```css
:root {
  --accent: #007AFF;
  --font-body: 'Inter', system-ui;
  --font-size-base: 16px;
}
```

### Theme Presets

Built-in color themes:
- Claude Orange (Default)
- Apple Blue
- Apple Green
- Apple Red
- Apple Purple
- And more...

## 🔧 Architecture

### Frontend (React + TypeScript)
- **React 18** with hooks and context
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Phosphor Icons** for iconography

### Backend (Express.js)
- **Express.js** server with CORS support
- **Claude Code SDK** integration
- **Real-time streaming** via Server-Sent Events
- **Project management** and file operations

### Desktop (Electron)
- **Capacitor Community Electron** for desktop builds
- **Native file system** access
- **Auto-updater** support

## 📱 Platform Support

| Platform | Status | Download |
|----------|--------|----------|
| 🌐 Web   | ✅ Ready | `npm run dev` |
| 🖥️ macOS | ✅ Ready | [Download](https://github.com/your-username/CCC/releases) |
| 🐧 Linux | ✅ Ready | [Download](https://github.com/your-username/CCC/releases) |
| 🪟 Windows | 🔄 Coming Soon | - |

## 🛠️ Development

### Project Structure
```
CCC/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── contexts/          # React contexts (settings, etc.)
│   ├── services/          # API services
│   ├── styles/            # CSS and styling
│   └── types/             # TypeScript definitions
├── server/                # Backend Express server
│   ├── src/               # Server source code
│   └── dist/              # Compiled server
├── electron/              # Electron desktop app
└── public/                # Static assets
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run server:dev` | Start backend development server |
| `npm run dev:full` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm run electron:dev` | Start Electron development |
| `npm run electron:build` | Build Electron app |

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Requirements

### System Requirements
- **Memory**: 512MB RAM minimum
- **Storage**: 200MB free space
- **Network**: Internet connection for Claude API

### Supported Claude Code Versions
- Claude Code CLI 1.0+
- Compatible with all Claude Code features

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**
- Ensure Claude Code CLI is installed and in PATH
- Check that the backend server is running on port 3002
- Verify API endpoint in settings

**Streaming Not Working**
- Enable verbose mode in settings for debugging
- Check browser console for errors
- Ensure Claude Code has proper permissions

**Desktop App Won't Start**
- Check Electron dependencies are installed
- Verify Node.js version compatibility
- Try rebuilding with `npm run electron:build`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Claude AI](https://claude.ai) for the amazing Claude Code CLI
- [Anthropic](https://anthropic.com) for Claude AI
- [Phosphor Icons](https://phosphoricons.com) for the beautiful icons
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

## 📞 Support

- 🐛 [Report Issues](https://github.com/your-username/CCC/issues)
- 💬 [Discussions](https://github.com/your-username/CCC/discussions)  
- 📧 Email: support@your-domain.com

---

**Made with ❤️ for the Claude Code community**