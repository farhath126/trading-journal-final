import { useState, useEffect } from 'react'
import { TrendingUp, Plus, BarChart3, List, LayoutDashboard, Settings, Target, FileUp, Calendar, Menu, X, ChevronRight } from 'lucide-react'
import TradeForm from './components/TradeForm'
import TradeList from './components/TradeList'
import Statistics from './components/Statistics'
import Dashboard from './components/Dashboard'
import SettingsComponent from './components/Settings'
import StrategyManager from './components/StrategyManager'
import CSVManager from './components/CSVManager'
import TradePlanner from './components/TradePlanner'
import { getTrades, saveTrades, getSettings, getStrategies } from './utils/storage'

function App() {
  const [trades, setTrades] = useState([])
  const [settings, setSettings] = useState({ currency: 'USD', startingCapital: 10000 })
  const [strategies, setStrategies] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingTrade, setEditingTrade] = useState(null)
  const [plannedTrade, setPlannedTrade] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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

  const NavItem = ({ id, icon: Icon, label, onClick }) => (
    <button
      onClick={() => {
        setActiveTab(id)
        if (window.innerWidth < 768) setIsSidebarOpen(false)
        if (onClick) onClick()
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === id
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
      <span className="font-medium">{label}</span>
      {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen bg-white border-r border-slate-200 z-30 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
          }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-xl text-slate-800 whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'
              }`}>
              TradeJournal
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto md:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem
            id="add"
            icon={Plus}
            label={editingTrade ? 'Edit Trade' : 'Add Trade'}
            onClick={() => {
              setEditingTrade(null)
              setPlannedTrade(null)
            }}
          />
          <NavItem id="planner" icon={Calendar} label="Trade Planner" />
          <NavItem id="list" icon={List} label="Trade History" />
          <NavItem id="stats" icon={BarChart2} label="Statistics" />
          <NavItem id="strategies" icon={Target} label="Strategies" />
          <NavItem id="import" icon={FileUp} label="Data Management" />

          <div className="my-4 border-t border-slate-100 mx-2" />

          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>

        {/* User/Footer Area */}
        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'md:justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-sm">
              TJ
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 md:hidden'}`}>
              <p className="text-sm font-medium text-slate-700">Trader</p>
              <p className="text-xs text-slate-500">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'add' && (editingTrade ? 'Edit Trade' : 'Add Trade')}
              {activeTab === 'planner' && 'Trade Planner'}
              {activeTab === 'list' && 'Trade History'}
              {activeTab === 'stats' && 'Statistics'}
              {activeTab === 'strategies' && 'Strategies'}
              {activeTab === 'import' && 'Data Management'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
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
              <CSVManager onImport={handleImportTrades} trades={trades} settings={settings} />
            )}
            {activeTab === 'settings' && (
              <SettingsComponent
                onSettingsChange={handleSettingsChange}
                onCapitalChange={handleCapitalChange}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper for BarChart2 since it was renamed in import but used as Icon
const BarChart2 = ({ className }) => (
  <BarChart3 className={className} />
)

export default App
