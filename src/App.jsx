import { useState, useEffect } from 'react'
import { TrendingUp, Plus, BarChart3, List, LayoutDashboard, Settings, Target, FileUp, Calendar } from 'lucide-react'
import TradeForm from './components/TradeForm'
import TradeList from './components/TradeList'
import Statistics from './components/Statistics'
import Dashboard from './components/Dashboard'
import SettingsComponent from './components/Settings'
import StrategyManager from './components/StrategyManager'
import CSVImport from './components/CSVImport'
import TradePlanner from './components/TradePlanner'
import { getTrades, saveTrades, getSettings, getStrategies } from './utils/storage'

function App() {
  const [trades, setTrades] = useState([])
  const [settings, setSettings] = useState({ currency: 'USD', startingCapital: 10000 })
  const [strategies, setStrategies] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingTrade, setEditingTrade] = useState(null)
  const [plannedTrade, setPlannedTrade] = useState(null)

  useEffect(() => {
    const savedTrades = getTrades()
    setTrades(savedTrades)
    const savedSettings = getSettings()
    setSettings(savedSettings)
    const savedStrategies = getStrategies()
    setStrategies(savedStrategies)
  }, [])

  const handleAddTrade = (trade, isEdit = false) => {
    if (isEdit) {
      // Update existing trade
      const updatedTrades = trades.map(t => 
        t.id === trade.id ? trade : t
      )
      setTrades(updatedTrades)
      saveTrades(updatedTrades)
      setEditingTrade(null)
      setActiveTab('list') // Switch to list view after editing
    } else {
      // Add new trade
      const newTrade = {
        ...trade,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      const updatedTrades = [newTrade, ...trades]
      setTrades(updatedTrades)
      saveTrades(updatedTrades)
    }
  }

  const handleEditTrade = (trade) => {
    setEditingTrade(trade)
    setActiveTab('add') // Switch to add/edit tab
  }

  const handleCancelEdit = () => {
    setEditingTrade(null)
    setPlannedTrade(null)
  }

  const handleConvertPlannedTrade = (plannedTradeData) => {
    setPlannedTrade(plannedTradeData)
    setEditingTrade(null)
    setActiveTab('add')
  }

  const handleImportTrades = (importedTrades) => {
    // Merge imported trades with existing trades
    // Check for duplicates by ID, or add new IDs if needed
    const existingIds = new Set(trades.map(t => t.id))
    const newTrades = importedTrades.map(trade => {
      // If trade has an ID that already exists, generate a new one
      if (existingIds.has(trade.id)) {
        trade.id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
      }
      return trade
    })
    
    const updatedTrades = [...newTrades, ...trades]
    setTrades(updatedTrades)
    saveTrades(updatedTrades)
  }

  const handleDeleteTrade = (id) => {
    const updatedTrades = trades.filter(trade => trade.id !== id)
    setTrades(updatedTrades)
    saveTrades(updatedTrades)
  }

  const handleDeleteAllTrades = () => {
    setTrades([])
    saveTrades([])
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
  }

  const handleCapitalChange = () => {
    // Force re-render of components that use capital adjustments
    // This is handled by the components reading from storage directly
  }

  const handleStrategyChange = (newStrategies) => {
    setStrategies(newStrategies)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">Trading Journal</h1>
          </div>
          <p className="text-slate-600">Track your trades and analyze your performance</p>
        </header>

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('add')
              setEditingTrade(null) // Clear editing when clicking add tab
              setPlannedTrade(null)
            }}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'add'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            {editingTrade ? 'Edit Trade' : 'Add Trade'}
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'planner'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Trade Planner
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
            Trade History
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('strategies')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'strategies'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            Strategies
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <FileUp className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'dashboard' && <Dashboard trades={trades} settings={settings} />}
          {activeTab === 'add' && (
            <TradeForm
              onAddTrade={handleAddTrade}
              editTrade={editingTrade}
              onCancelEdit={handleCancelEdit}
              plannedTrade={plannedTrade}
            />
          )}
          {activeTab === 'planner' && (
            <TradePlanner onConvertToTrade={handleConvertPlannedTrade} />
          )}
          {activeTab === 'list' && (
            <TradeList
              trades={trades}
              onDeleteTrade={handleDeleteTrade}
              onEditTrade={handleEditTrade}
              onDeleteAll={handleDeleteAllTrades}
              settings={settings}
            />
          )}
          {activeTab === 'stats' && <Statistics trades={trades} settings={settings} />}
          {activeTab === 'strategies' && (
            <StrategyManager onStrategyChange={handleStrategyChange} />
          )}
          {activeTab === 'import' && (
            <CSVImport onImport={handleImportTrades} existingTradesCount={trades.length} />
          )}
          {activeTab === 'settings' && (
            <SettingsComponent 
              onSettingsChange={handleSettingsChange}
              onCapitalChange={handleCapitalChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App

