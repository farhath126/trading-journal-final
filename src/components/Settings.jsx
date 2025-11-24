import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, DollarSign } from 'lucide-react'
import { getSettings, saveSettings } from '../utils/storage'
import CapitalManagement from './CapitalManagement'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
  { code: 'ETH', symbol: 'Ξ', name: 'Ethereum' },
]

function Settings({ onSettingsChange, onCapitalChange }) {
  const [settings, setSettings] = useState({
    currency: 'USD',
    startingCapital: 10000,
  })

  useEffect(() => {
    const savedSettings = getSettings()
    setSettings(savedSettings)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: name === 'startingCapital' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveSettings(settings)
    if (onSettingsChange) {
      onSettingsChange(settings)
    }
    alert('Settings saved successfully!')
  }

  const selectedCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <SettingsIcon className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Currency Selection */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Currency Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Currency *
            </label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              required
              className="glass-input w-full"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code} className="bg-gray-900">
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedCurrency.symbol} {selectedCurrency.name}
            </p>
          </div>
        </div>

        {/* Starting Capital */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Capital Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Starting Capital *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                {selectedCurrency.symbol}
              </span>
              <input
                type="number"
                name="startingCapital"
                value={settings.startingCapital}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                placeholder="10000"
                className="glass-input w-full pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This is your initial capital when you started trading. Used for ROI calculations.
            </p>
          </div>
        </div>

        {/* Current Settings Display */}
        <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
          <h3 className="text-lg font-bold text-white mb-4">Current Settings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Currency:</span>
              <span className="font-medium text-white">
                {selectedCurrency.symbol} {settings.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Starting Capital:</span>
              <span className="font-medium text-white">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: settings.currency,
                  minimumFractionDigits: 2,
                }).format(settings.startingCapital)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3 btn-primary rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </form>

      {/* Capital Management Section */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <CapitalManagement settings={settings} onCapitalChange={onCapitalChange} />
      </div>
    </div>
  )
}

export default Settings

