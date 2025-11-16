import { TrendingUp, TrendingDown, Target, DollarSign, Calendar, Clock, BarChart2 } from 'lucide-react'
import { getCapitalAdjustments } from '../utils/storage'

function Statistics({ trades, settings }) {
  // Get capital adjustments
  const capitalAdjustments = getCapitalAdjustments()
  const netAdjustments = capitalAdjustments.reduce((sum, adj) => {
    return sum + (adj.type === 'deposit' ? adj.amount : -adj.amount)
  }, 0)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  if (trades.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Statistics</h2>
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No trades to analyze yet.</p>
          <p className="text-sm mt-2">Add some trades to see your statistics!</p>
        </div>
      </div>
    )
  }

  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const winningTrades = trades.filter((trade) => (trade.pnl || 0) > 0)
  const losingTrades = trades.filter((trade) => (trade.pnl || 0) < 0)
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0
  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length
    : 0
  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length)
    : 0
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0

  // Additional metrics
  const totalWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0))
  
  // Calculate average trade duration
  const durations = trades
    .filter(t => t.entryDate && t.exitDate)
    .map(t => {
      const entry = new Date(t.entryDate)
      const exit = new Date(t.exitDate)
      return (exit - entry) / (1000 * 60 * 60 * 24) // days
    })
  const avgDuration = durations.length > 0
    ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
    : 0

  // Calculate max drawdown
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.exitDate || a.entryDate || a.createdAt)
    const dateB = new Date(b.exitDate || b.entryDate || b.createdAt)
    return dateA - dateB
  })

  const adjustedStartingCapital = (settings?.startingCapital || 10000) + netAdjustments
  let peak = adjustedStartingCapital
  let maxDrawdown = 0
  let maxDrawdownPercent = 0
  
  sortedTrades.forEach(trade => {
    const currentCapital = peak + (trade.pnl || 0)
    if (currentCapital > peak) {
      peak = currentCapital
    } else {
      const drawdown = peak - currentCapital
      const drawdownPercent = (drawdown / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownPercent = drawdownPercent
      }
    }
  })

  // Calculate ROI
  const startingCapital = adjustedStartingCapital
  const roi = startingCapital > 0 
    ? ((totalPnL / startingCapital) * 100).toFixed(2)
    : '0.00'

  // Calculate expectancy
  const expectancy = trades.length > 0
    ? ((winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss).toFixed(2)
    : 0

  // Calculate risk-reward ratio
  const riskRewardRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : avgWin > 0 ? '∞' : '0.00'

  const stats = [
    {
      label: 'Total P/L',
      value: formatCurrency(totalPnL),
      icon: DollarSign,
      color: totalPnL >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Total Trades',
      value: trades.length,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Profit Factor',
      value: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2),
      icon: TrendingDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'ROI',
      value: `${roi}%`,
      icon: BarChart2,
      color: totalPnL >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Max Drawdown',
      value: formatCurrency(maxDrawdown),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Avg Duration',
      value: `${avgDuration} days`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Statistics</h2>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-6 border border-slate-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-6 h-6 ${stat.color}`} />
                <span className="text-sm font-medium text-slate-600">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Trade Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Winning Trades</span>
              <span className="font-semibold text-green-600">{winningTrades.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Losing Trades</span>
              <span className="font-semibold text-red-600">{losingTrades.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Average Win</span>
              <span className="font-semibold text-green-600">{formatCurrency(avgWin)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Average Loss</span>
              <span className="font-semibold text-red-600">{formatCurrency(avgLoss)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Winning P/L</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalWins)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Losing P/L</span>
              <span className="font-semibold text-red-600">{formatCurrency(totalLosses)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Best Trade</span>
              <span className="font-semibold text-green-600">
                {trades.length > 0
                  ? formatCurrency(Math.max(...trades.map((t) => t.pnl || 0)))
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Worst Trade</span>
              <span className="font-semibold text-red-600">
                {trades.length > 0
                  ? formatCurrency(Math.min(...trades.map((t) => t.pnl || 0)))
                  : formatCurrency(0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Advanced Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Expectancy</span>
              <span className={`font-semibold ${expectancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(expectancy)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Risk-Reward Ratio</span>
              <span className="font-semibold text-slate-800">{riskRewardRatio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Max Drawdown %</span>
              <span className="font-semibold text-red-600">{maxDrawdownPercent.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Starting Capital</span>
              <span className="font-semibold text-slate-800">{formatCurrency(startingCapital)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics

