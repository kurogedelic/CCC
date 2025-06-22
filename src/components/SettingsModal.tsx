import React, { useState } from 'react'
import { X, User, Palette, Globe, Shield, Database } from '@phosphor-icons/react'
import { useSettings } from '../contexts/SettingsContext'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type SettingsTab = 'general' | 'appearance' | 'privacy' | 'advanced' | 'about'

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const { tempSettings, updateTempSetting, saveSettings, discardChanges, resetSettings, hasUnsavedChanges } = useSettings()

  const systemFonts = [
    { value: 'system-ui', label: 'System UI' },
    { value: '-apple-system, BlinkMacSystemFont', label: 'San Francisco (macOS)' },
    { value: '"Segoe UI"', label: 'Segoe UI (Windows)' },
    { value: 'Inter', label: 'Inter' },
    { value: '"Helvetica Neue", Helvetica', label: 'Helvetica' },
    { value: 'Arial', label: 'Arial' },
    { value: '"SF Mono", Monaco', label: 'SF Mono (macOS)' },
    { value: '"Cascadia Code"', label: 'Cascadia Code (Windows)' },
    { value: '"JetBrains Mono"', label: 'JetBrains Mono' }
  ]

  const colorPresets = [
    { value: '#ff6b35', label: 'Claude Orange', color: '#ff6b35' },
    { value: '#007AFF', label: 'Apple Blue', color: '#007AFF' },
    { value: '#34C759', label: 'Apple Green', color: '#34C759' },
    { value: '#FF3B30', label: 'Apple Red', color: '#FF3B30' },
    { value: '#AF52DE', label: 'Apple Purple', color: '#AF52DE' },
    { value: '#FF9500', label: 'Apple Orange', color: '#FF9500' },
    { value: '#64D2FF', label: 'Twitter Blue', color: '#64D2FF' },
    { value: '#FF6B6B', label: 'Coral', color: '#FF6B6B' }
  ]

  if (!isOpen) return null

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: User, disabled: false },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette, disabled: false },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: Shield, disabled: false },
    { id: 'advanced' as SettingsTab, label: 'Advanced', icon: Database, disabled: true },
    { id: 'about' as SettingsTab, label: 'About', icon: Globe, disabled: false }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-content">
            <h2 className="settings-section-title">General Settings</h2>
            <div className="settings-section">
              <label className="settings-label">Default Working Directory</label>
              <input 
                type="text" 
                className="settings-input" 
                placeholder="/Users/username/projects"
                value={tempSettings.defaultWorkingDirectory}
                onChange={(e) => updateTempSetting('defaultWorkingDirectory', e.target.value)}
              />
            </div>
            <div className="settings-section">
              <label className="settings-label">Auto-save Conversations</label>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={tempSettings.autoSave}
                  onChange={(e) => updateTempSetting('autoSave', e.target.checked)}
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
            <div className="settings-section">
              <label className="settings-label">Verbose Mode</label>
              <p className="settings-description">Show detailed JSON metadata and streaming information</p>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={tempSettings.verbose}
                  onChange={(e) => updateTempSetting('verbose', e.target.checked)}
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
            <div className="settings-section">
              <div className="settings-actions">
                <button 
                  className="settings-button"
                  onClick={saveSettings}
                  disabled={!hasUnsavedChanges}
                >
                  Save Changes
                </button>
                <button 
                  className="settings-button-secondary"
                  onClick={discardChanges}
                  disabled={!hasUnsavedChanges}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )
      case 'appearance':
        return (
          <div className="settings-content">
            <h2 className="settings-section-title">Appearance</h2>
            <div className="settings-section">
              <label className="settings-label">Theme</label>
              <select 
                className="settings-select"
                value={tempSettings.theme}
                onChange={(e) => updateTempSetting('theme', e.target.value as 'auto' | 'light' | 'dark')}
              >
                <option value="auto">Auto (System)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="settings-section">
              <label className="settings-label">Font Size (pt)</label>
              <p className="settings-description">Set custom font size in points</p>
              <input 
                type="number" 
                className="settings-input"
                min="8"
                max="24"
                step="1"
                value={tempSettings.fontSizePt}
                onChange={(e) => updateTempSetting('fontSizePt', parseInt(e.target.value) || 14)}
              />
            </div>
            <div className="settings-section">
              <label className="settings-label">Body Font Family</label>
              <p className="settings-description">Choose system font for body text display</p>
              <select 
                className="settings-select"
                value={tempSettings.bodyFontFamily}
                onChange={(e) => updateTempSetting('bodyFontFamily', e.target.value)}
              >
                {systemFonts.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
            <div className="settings-section">
              <label className="settings-label">Code Font Family</label>
              <p className="settings-description">Choose monospace font for code and messages</p>
              <select 
                className="settings-select"
                value={tempSettings.fontFamily}
                onChange={(e) => updateTempSetting('fontFamily', e.target.value)}
              >
                {systemFonts.filter(font => font.value.includes('Mono') || font.value.includes('Monaco') || font.value.includes('Cascadia')).map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
            <div className="settings-section">
              <label className="settings-label">Accent Color</label>
              <p className="settings-description">Choose theme accent color</p>
              <div className="color-preset-grid">
                {colorPresets.map(preset => (
                  <button
                    key={preset.value}
                    className={`color-preset ${tempSettings.accentColor === preset.value ? 'active' : ''}`}
                    style={{ backgroundColor: preset.color }}
                    onClick={() => updateTempSetting('accentColor', preset.value)}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
            <div className="settings-section">
              <label className="settings-label">Legacy Font Size</label>
              <select 
                className="settings-select"
                value={tempSettings.fontSize}
                onChange={(e) => updateTempSetting('fontSize', e.target.value as 'small' | 'medium' | 'large')}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        )
      case 'privacy':
        return (
          <div className="settings-content">
            <h2 className="settings-section-title">Privacy & Security</h2>
            <div className="settings-section">
              <label className="settings-label">Send Usage Analytics</label>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={tempSettings.sendAnalytics}
                  onChange={(e) => updateTempSetting('sendAnalytics', e.target.checked)}
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
            <div className="settings-section">
              <label className="settings-label">Clear Chat History</label>
              <button className="settings-button-danger">Clear All Conversations</button>
            </div>
          </div>
        )
      case 'advanced':
        return (
          <div className="settings-content">
            <h2 className="settings-section-title">Advanced Settings</h2>
            <div className="settings-section">
              <label className="settings-label">API Endpoint</label>
              <input 
                type="text" 
                className="settings-input" 
                placeholder="http://localhost:3001"
                value={tempSettings.apiEndpoint}
                onChange={(e) => updateTempSetting('apiEndpoint', e.target.value)}
              />
            </div>
            <div className="settings-section">
              <label className="settings-label">Debug Mode</label>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={tempSettings.debugMode}
                  onChange={(e) => updateTempSetting('debugMode', e.target.checked)}
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
            <div className="settings-section">
              <label className="settings-label">Reset All Settings</label>
              <button 
                className="settings-button-danger"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all settings to default?')) {
                    resetSettings()
                  }
                }}
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )
      case 'about':
        return (
          <div className="settings-content">
            <h2 className="settings-section-title">About CCC</h2>
            <div className="settings-section">
              <div className="about-info">
                <h3>Claude Code Client</h3>
                <p>Version 1.0.0</p>
                <p>A modern web interface for Claude Code CLI</p>
              </div>
            </div>
            <div className="settings-section">
              <button className="settings-button">Check for Updates</button>
            </div>
          </div>
        )
      default:
        return <div>Settings content</div>
    }
  }

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <button className="settings-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="settings-body">
          <div className="settings-sidebar">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
          
          <div className="settings-main">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal