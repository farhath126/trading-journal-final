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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${activeTab === id
        ? 'text-white'
        : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
        }`}
    >
      {activeTab === id && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500" />
      )}
      <Icon className={`w-5 h-5 relative z-10 ${activeTab === id ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
      <span className="font-medium relative z-10">{label}</span>
      {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50 relative z-10" />}
    </button>
  )

  return (
    <div className="min-h-screen flex text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen glass-panel border-r-0 border-r-white/5 z-30 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:w-20 md:translate-x-0'
          }`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className={`font-bold text-xl tracking-tight whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'
              }`}>
              <span className="text-white">Trade</span><span className="text-blue-400">Journal</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
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

          <div className="my-6 border-t border-white/5 mx-2" />

          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>

        {/* User/Footer Area */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'md:justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-medium text-sm ring-2 ring-white/10">
              TJ
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 md:hidden'}`}>
              <p className="text-sm font-medium text-white">Trader</p>
              <p className="text-xs text-blue-400">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-6 md:px-8 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">
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
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-400 hidden sm:block font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-fade-in">
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
