import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';

// Keep a global reference of the window object
let mainWindow: BrowserWindow;

async function createWindow(): Promise<void> {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    icon: undefined // You can add an icon path here
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    // Try different ports in case 3000 is taken
    const tryPorts = ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'];
    let loaded = false;
    
    for (const url of tryPorts) {
      try {
        await mainWindow.loadURL(url);
        loaded = true;
        console.log(`Loaded app from ${url}`);
        break;
      } catch (error) {
        console.log(`Failed to load from ${url}, trying next...`);
      }
    }
    
    if (!loaded) {
      console.error('Could not load app from any development server');
    }
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'));
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
}

// Handle directory selection
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Project Directory'
  });
  
  return result;
});

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS re-create a window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !parsedUrl.protocol.startsWith('file:')) {
      event.preventDefault();
    }
  });
});