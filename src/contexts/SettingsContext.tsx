import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Settings {
  verbose: boolean
  theme: 'auto' | 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  fontSizePt: number
  fontFamily: string
  bodyFontFamily: string
  accentColor: string
  autoSave: boolean
  sendAnalytics: boolean
  debugMode: boolean
  apiEndpoint: string
  defaultWorkingDirectory: string
}

interface SettingsContextType {
  settings: Settings
  tempSettings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  updateTempSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  saveSettings: () => void
  discardChanges: () => void
  resetSettings: () => void
  hasUnsavedChanges: boolean
}

const defaultSettings: Settings = {
  verbose: false, // Default to false as requested
  theme: 'auto',
  fontSize: 'medium',
  fontSizePt: 9,
  fontFamily: 'system-ui',
  bodyFontFamily: 'system-ui',
  accentColor: '#ff6b35', // Claude Orange
  autoSave: true,
  sendAnalytics: false,
  debugMode: false,
  apiEndpoint: '',
  defaultWorkingDirectory: ''
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [tempSettings, setTempSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('ccc-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        const loadedSettings = { ...defaultSettings, ...parsed }
        setSettings(loadedSettings)
        setTempSettings(loadedSettings)
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ccc-settings', JSON.stringify(settings))
  }, [settings])

  // Apply dynamic CSS variables whenever settings change
  useEffect(() => {
    const root = document.documentElement
    
    // Apply accent color
    root.style.setProperty('--accent', settings.accentColor)
    root.style.setProperty('--accent-hover', adjustColorBrightness(settings.accentColor, -10))
    
    // Apply font settings
    root.style.setProperty('--font-size-pt', `${settings.fontSizePt}px`)
    root.style.setProperty('--font-family-body', settings.bodyFontFamily)
    root.style.setProperty('--font-family-mono', settings.fontFamily)
    
  }, [settings])

  // Helper function to adjust color brightness
  const adjustColorBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateTempSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setTempSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    setSettings(tempSettings)
  }

  const discardChanges = () => {
    setTempSettings(settings)
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setTempSettings(defaultSettings)
    localStorage.removeItem('ccc-settings')
  }

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(tempSettings)

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      tempSettings, 
      updateSetting, 
      updateTempSetting, 
      saveSettings, 
      discardChanges, 
      resetSettings, 
      hasUnsavedChanges 
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}