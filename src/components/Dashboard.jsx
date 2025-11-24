import { useState } from 'react'
import { DollarSign, Target, TrendingUp, TrendingDown, Calendar as CalendarIcon, Filter, Download, Bell, Plus } from 'lucide-react'
import { getCapitalAdjustments } from '../utils/storage'
import CalendarView from './CalendarView'
import StatCard from './StatCard'
import TradeScore from './TradeScore'
import DailyNetPnL from './DailyNetPnL'
import DailyNetCumulativePnL from './DailyNetCumulativePnL'
import RecentTradesWidget from './RecentTradesWidget'

function Dashboard({ trades, settings }) {
  const [viewMode, setViewMode] = useState('overview') // 'overview' or 'calendar'

  // --- Data Calculation Logic ---
  const capitalAdjustments = getCapitalAdjustments()
  const netAdjustments = capitalAdjustments.reduce((sum, adj) => {
    return sum + (adj.type === 'deposit' ? adj.amount : -adj.amount)
  }, 0)

  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const winningTrades = trades.filter((trade) => (trade.pnl || 0) > 0)
  const losingTrades = trades.filter((trade) => (trade.pnl || 0) < 0)

  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0
  const totalWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0))

  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0

  const expectancy = trades.length > 0
    ? ((winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss).toFixed(2)
    : 0

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Daily PnL Data for Chart
  const dailyPnLMap = {}
  trades.forEach(trade => {
    const date = new Date(trade.exitDate || trade.entryDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    if (!dailyPnLMap[date]) dailyPnLMap[date] = 0
    dailyPnLMap[date] += (trade.pnl || 0)
  })

  const dailyPnLData = Object.entries(dailyPnLMap)
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30) // Last 30 days

  // Calculate Cumulative PnL Data
  let runningTotal = 0
  const dailyCumulativeData = dailyPnLData.map(d => {
    runningTotal += d.pnl
    return {
      date: d.date,
      cumulativePnl: runningTotal
    }
  })

  // Calculate Trade Score (Mock Formula)
  // Base 50 + WinRate/4 + ProfitFactor*5
  const tradeScore = Math.min(Math.round(50 + (winRate / 4) + (profitFactor * 5)), 100)

  // --- Render ---
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Good morning Trader!</h2>
          <p className="text-sm text-gray-400 mt-1">Here's what's happening with your account today.</p>
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Net P&L"
          value={formatCurrency(totalPnL)}
          type="simple"
          data={{
            icon: <DollarSign className="w-4 h-4 text-blue-400" />,
            subColor: 'text-gray-400'
          }}
          subLabel="12 trades"
          subValue=""
        />
        <StatCard
          title="Trade Expectancy"
          value={formatCurrency(expectancy)}
          type="simple"
          data={{
            icon: <Target className="w-4 h-4 text-purple-400" />,
            subColor: 'text-gray-400'
          }}
        />
        <StatCard
          title="Profit Factor"
          value={profitFactor.toFixed(2)}
          type="gauge"
          data={{ value: profitFactor }}
        />
        <StatCard
          title="Win %"
          value={`${winRate.toFixed(2)}%`}
          type="donut"
          data={{ value: winRate }}
          subLabel="W/L"
          subValue={`${winningTrades.length}/${losingTrades.length}`}
        />
        <StatCard
          title="Avg win/loss trade"
          value={profitFactor.toFixed(1)}
          type="bar"
          data={{ win: avgWin, loss: avgLoss }}
        />
      </div>

      {/* Row 2: Main Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Trade Score */}
        <div className="lg:col-span-1 h-full">
          <TradeScore
            score={tradeScore}
            metrics={{ winRate, profitFactor, avgWin, avgLoss }}
          />
        </div>

        {/* Daily Net Cumulative P&L */}
        <div className="lg:col-span-1 h-full">
          <DailyNetCumulativePnL data={dailyCumulativeData} />
        </div>

        {/* Net Daily P&L */}
        <div className="lg:col-span-1 h-full">
          <DailyNetPnL data={dailyPnLData} />
        </div>
      </div>

      {/* Row 3: Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        {/* Recent Trades / Open Positions */}
        <div className="h-full">
          <RecentTradesWidget trades={trades} settings={settings} />
        </div>

        {/* Calendar View */}
        <div className="h-full overflow-hidden rounded-2xl glass-panel">
          <CalendarView trades={trades} settings={settings} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
