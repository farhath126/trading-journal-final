import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, DollarSign, User, LogOut, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react'
import { getSettings, saveSettings, getTrades } from '../utils/storage'
import { useAuth } from '../context/AuthContext'
import { saveUserTrade } from '../services/firestore'
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
  const { currentUser, logout } = useAuth()
  const [settings, setSettings] = useState({
    currency: 'USD',
    startingCapital: 10000,
  })
  const [syncStatus, setSyncStatus] = useState({ type: '', message: '' })
  const [isSyncing, setIsSyncing] = useState(false)

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

  const handleSyncData = async () => {
    if (!currentUser) return

    try {
      setIsSyncing(true)
      setSyncStatus({ type: '', message: '' })

      const localTrades = getTrades()
      if (localTrades.length === 0) {
        setSyncStatus({ type: 'info', message: 'No local trades found to sync.' })
        return
      }

      let count = 0
      for (const trade of localTrades) {
        await saveUserTrade(currentUser.uid, trade)
        count++
      }

      setSyncStatus({ type: 'success', message: `Successfully synced ${count} trades to the cloud!` })
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus({ type: 'error', message: 'Failed to sync data: ' + error.message })
    } finally {
      setIsSyncing(false)
    }
  }

  const selectedCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0]

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <SettingsIcon className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Account Section */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Account
          </h3>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div>
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="font-medium text-white">{currentUser?.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Data Synchronization</h4>
            <p className="text-xs text-gray-500 mb-4">
              Upload your locally stored trades to the cloud. Use this if you have data from before logging in.
            </p>

            {syncStatus.message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${syncStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                syncStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                {syncStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                  syncStatus.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                    <AlertCircle className="w-4 h-4" />}
                {syncStatus.message}
              </div>
            )}

            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSyncing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Local Data to Cloud'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="mt-2 pt-8 border-t border-white/10">
          <CapitalManagement settings={settings} onCapitalChange={onCapitalChange} />
        </div>
      </div>
    </div>
  )
}

export default Settings

