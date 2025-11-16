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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-slate-800">Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Currency Selection */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Currency Settings</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Currency *
            </label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Selected: {selectedCurrency.symbol} {selectedCurrency.name}
            </p>
          </div>
        </div>

        {/* Starting Capital */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Capital Settings</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Starting Capital *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600">
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
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              This is your initial capital when you started trading. Used for ROI calculations.
            </p>
          </div>
        </div>

        {/* Current Settings Display */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Current Settings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Currency:</span>
              <span className="font-medium text-slate-800">
                {selectedCurrency.symbol} {settings.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Starting Capital:</span>
              <span className="font-medium text-slate-800">
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
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </form>

      {/* Capital Management Section */}
      <div className="mt-8 pt-8 border-t border-slate-200">
        <CapitalManagement settings={settings} onCapitalChange={onCapitalChange} />
      </div>
    </div>
  )
}

export default Settings

