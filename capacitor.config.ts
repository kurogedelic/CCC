import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.claudecode.client',
  appName: 'Claude Code Client',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000'
  },
  plugins: {
    Filesystem: {
      iosScheme: 'file',
      androidScheme: 'https'
    }
  }
};

export default config;
