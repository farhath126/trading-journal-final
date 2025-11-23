import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { getCapitalAdjustments } from '../utils/storage'
import CalendarView from './CalendarView'

function Dashboard({ trades, settings }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState('overview') // 'overview' or 'calendar'

  // Get capital adjustments
  const capitalAdjustments = getCapitalAdjustments()
  const netAdjustments = capitalAdjustments.reduce((sum, adj) => {
    return sum + (adj.type === 'deposit' ? adj.amount : -adj.amount)
  }, 0)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  if (trades.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h2>
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No trades to display yet.</p>
          <p className="text-sm mt-2">Add some trades to see your dashboard!</p>
        </div>
      </div>
    )
  }

  // Calculate metrics
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const currentCapital = settings.startingCapital + netAdjustments + totalPnL
  const adjustedStartingCapital = settings.startingCapital + netAdjustments
  const roi = adjustedStartingCapital > 0
    ? ((totalPnL / adjustedStartingCapital) * 100).toFixed(2)
    : '0.00'

  const winningTrades = trades.filter((trade) => (trade.pnl || 0) > 0)
  const losingTrades = trades.filter((trade) => (trade.pnl || 0) < 0)
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0

  const totalWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0))
  const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : totalWins > 0 ? '∞' : '0.00'

  // Calculate equity curve
  const equityCurve = []
  let runningCapital = settings.startingCapital + netAdjustments
  equityCurve.push({ date: 'Start', capital: runningCapital })

  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.exitDate || a.entryDate || a.createdAt)
    const dateB = new Date(b.exitDate || b.entryDate || b.createdAt)
    return dateA - dateB
  })

  sortedTrades.forEach(trade => {
    runningCapital += trade.pnl || 0
    const date = new Date(trade.exitDate || trade.entryDate || trade.createdAt)
    equityCurve.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      capital: runningCapital,
    })
  })

  // Calculate max drawdown
  let peak = adjustedStartingCapital
  let currentCapitalForDrawdown = adjustedStartingCapital
  let maxDrawdown = 0
  let maxDrawdownPercent = 0

  sortedTrades.forEach(trade => {
    currentCapitalForDrawdown += trade.pnl || 0
    if (currentCapitalForDrawdown > peak) {
      peak = currentCapitalForDrawdown
    } else {
      const drawdown = peak - currentCapitalForDrawdown
      const drawdownPercent = (drawdown / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownPercent = drawdownPercent
      }
    }
  })

  // Strategy breakdown
  const strategyStats = {}
  trades.forEach(trade => {
    const strategy = trade.strategy || 'No Strategy'
    if (!strategyStats[strategy]) {
      strategyStats[strategy] = { count: 0, pnl: 0, wins: 0, losses: 0 }
    }
    strategyStats[strategy].count++
    strategyStats[strategy].pnl += trade.pnl || 0
    if (trade.pnl > 0) strategyStats[strategy].wins++
    else if (trade.pnl < 0) strategyStats[strategy].losses++
  })

  // Monthly performance
  const monthlyPerformance = {}
  trades.forEach(trade => {
    const date = new Date(trade.exitDate || trade.entryDate || trade.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyPerformance[monthKey]) {
      monthlyPerformance[monthKey] = { pnl: 0, count: 0 }
    }
    monthlyPerformance[monthKey].pnl += trade.pnl || 0
    monthlyPerformance[monthKey].count++
  })

  const monthlyData = Object.entries(monthlyPerformance)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      pnl: data.pnl,
      count: data.count,
    }))

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

  // Calculate Sharpe-like ratio (simplified)
  const returns = sortedTrades.map(t => (t.pnl || 0) / settings.startingCapital)
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
  const variance = returns.length > 0
    ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    : 0
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev).toFixed(2) : '0.00'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Dashboard</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'overview'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'calendar'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">Current Capital</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentCapital)}</p>
          <p className="text-xs text-slate-600 mt-1">
            Starting: {formatCurrency(settings.startingCapital)}
            {netAdjustments !== 0 && (
              <span className={netAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}>
                {' '}({netAdjustments >= 0 ? '+' : ''}{formatCurrency(netAdjustments)} adjustments)
              </span>
            )}
          </p>
        </div>

        <div className={`bg-gradient-to-br rounded-lg p-6 border ${totalPnL >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'
          }`}>
          <div className="flex items-center justify-between mb-2">
            {totalPnL >= 0 ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
            <span className="text-sm font-medium text-slate-600">Total P/L</span>
          </div>
          <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalPnL)}
          </p>
          <p className={`text-xs mt-1 ${totalPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            ROI: {roi}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-slate-600">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{winRate.toFixed(1)}%</p>
          <p className="text-xs text-slate-600 mt-1">
            {winningTrades.length}W / {losingTrades.length}L
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-slate-600">Profit Factor</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{profitFactor}</p>
          <p className="text-xs text-slate-600 mt-1">
            {formatCurrency(totalWins)} / {formatCurrency(totalLosses)}
          </p>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView trades={trades} settings={settings} />
      ) : (
        <>
          {/* Equity Curve Visualization */}
          {equityCurve.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Equity Curve</h3>
              <div className="relative">
                <svg
                  viewBox="0 0 800 300"
                  className="w-full h-64"
                  preserveAspectRatio="none"
                >
                  {(() => {
                    const maxCapital = Math.max(...equityCurve.map(p => p.capital))
                    const minCapital = Math.min(...equityCurve.map(p => p.capital))
                    const range = maxCapital - minCapital || 1
                    const leftPadding = 80 // Increased for Y-axis labels
                    const rightPadding = 20
                    const topPadding = 20
                    const bottomPadding = 40
                    const width = 800 - leftPadding - rightPadding
                    const height = 300 - topPadding - bottomPadding
                    const pointCount = equityCurve.length

                    // Generate points for the line
                    const points = equityCurve.map((point, index) => {
                      const x = leftPadding + (index / (pointCount - 1 || 1)) * width
                      // Invert Y: higher values at top (smaller Y coordinate in SVG)
                      const normalizedValue = (point.capital - minCapital) / range
                      const y = topPadding + height - (normalizedValue * height)
                      return { x, y, capital: point.capital, date: point.date }
                    })

                    // Create path for the line
                    const pathData = points.map((point, index) => {
                      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                    }).join(' ')

                    // Create area fill path
                    const areaPath = points.length > 0
                      ? `${pathData} L ${points[points.length - 1].x} ${topPadding + height} L ${points[0].x} ${topPadding + height} Z`
                      : ''

                    return (
                      <>
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                          // ratio 0 = min (bottom), ratio 1 = max (top)
                          const y = topPadding + height - (ratio * height)
                          // value increases from min to max as ratio goes from 0 to 1
                          const value = minCapital + (range * ratio)
                          return (
                            <g key={ratio}>
                              <line
                                x1={leftPadding}
                                y1={y}
                                x2={800 - rightPadding}
                                y2={y}
                                stroke="#e2e8f0"
                                strokeWidth="1"
                                strokeDasharray="4,4"
                              />
                              <text
                                x={leftPadding - 10}
                                y={y + 4}
                                textAnchor="end"
                                fontSize="10"
                                fill="#64748b"
                                className="font-medium"
                              >
                                {formatCurrency(value)}
                              </text>
                            </g>
                          )
                        })}

                        {/* Area fill */}
                        <path
                          d={areaPath}
                          fill={currentCapital >= adjustedStartingCapital ? "url(#gradientGreen)" : "url(#gradientRed)"}
                          opacity="0.2"
                        />

                        {/* Line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={currentCapital >= adjustedStartingCapital ? "#10b981" : "#ef4444"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Starting capital reference line */}
                        <line
                          x1={leftPadding}
                          y1={topPadding + height - ((adjustedStartingCapital - minCapital) / range) * height}
                          x2={800 - rightPadding}
                          y2={topPadding + height - ((adjustedStartingCapital - minCapital) / range) * height}
                          stroke="#94a3b8"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />

                        {/* Points */}
                        {points.map((point, index) => (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={hoveredPoint === index ? "6" : "4"}
                              fill={point.capital >= adjustedStartingCapital ? "#10b981" : "#ef4444"}
                              stroke="white"
                              strokeWidth={hoveredPoint === index ? "3" : "2"}
                              className="transition-all cursor-pointer"
                              onMouseEnter={() => {
                                setHoveredPoint(index)
                                setTooltipPosition({
                                  x: point.x,
                                  y: point.y
                                })
                              }}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          </g>
                        ))}

                        {/* Tooltip */}
                        {hoveredPoint !== null && points[hoveredPoint] && (
                          <g>
                            {/* Tooltip background */}
                            <rect
                              x={tooltipPosition.x - 70}
                              y={tooltipPosition.y - 55}
                              width="140"
                              height="45"
                              rx="8"
                              fill="#1e293b"
                              opacity="0.95"
                              stroke="#334155"
                              strokeWidth="1"
                            />
                            {/* Tooltip content */}
                            <text
                              x={tooltipPosition.x}
                              y={tooltipPosition.y - 32}
                              textAnchor="middle"
                              fontSize="12"
                              fill="#ffffff"
                              fontWeight="600"
                            >
                              {equityCurve[hoveredPoint]?.date}
                            </text>
                            <text
                              x={tooltipPosition.x}
                              y={tooltipPosition.y - 18}
                              textAnchor="middle"
                              fontSize="11"
                              fill="#60a5fa"
                              fontWeight="500"
                            >
                              {formatCurrency(points[hoveredPoint].capital)}
                            </text>
                            {/* Tooltip arrow pointing down */}
                            <polygon
                              points={`${tooltipPosition.x - 8},${tooltipPosition.y - 10} ${tooltipPosition.x + 8},${tooltipPosition.y - 10} ${tooltipPosition.x},${tooltipPosition.y}`}
                              fill="#1e293b"
                              opacity="0.95"
                            />
                          </g>
                        )}

                        {/* X-axis labels */}
                        {points.filter((_, index) => index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 4) === 0).map((point, index) => {
                          const originalIndex = points.indexOf(point)
                          return (
                            <text
                              key={index}
                              x={point.x}
                              y={topPadding + height + 20}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#64748b"
                            >
                              {equityCurve[originalIndex]?.date}
                            </text>
                          )
                        })}

                        {/* Gradients */}
                        <defs>
                          <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                          </linearGradient>
                          <linearGradient id="gradientRed" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                      </>
                    )
                  })()}
                </svg>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-600">Above Starting Capital</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-slate-600">Below Starting Capital</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div>
                      <span className="font-medium">Start: </span>
                      <span>{formatCurrency(equityCurve[0]?.capital || adjustedStartingCapital)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Current: </span>
                      <span>{formatCurrency(equityCurve[equityCurve.length - 1]?.capital || currentCapital)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Max Drawdown</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(maxDrawdown)}</p>
              <p className="text-xs text-slate-500">{maxDrawdownPercent.toFixed(2)}%</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Sharpe Ratio</p>
              <p className="text-xl font-bold text-slate-800">{sharpeRatio}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Avg Trade Duration</p>
              <p className="text-xl font-bold text-slate-800">{avgDuration} days</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Total Trades</p>
              <p className="text-xl font-bold text-slate-800">{trades.length}</p>
            </div>
          </div>

          {/* Strategy Performance */}
          {Object.keys(strategyStats).length > 0 && (
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Strategy Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-4 font-semibold text-slate-700">Strategy</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-700">Trades</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-700">Win Rate</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-700">Total P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(strategyStats).map(([strategy, stats]) => (
                      <tr key={strategy} className="border-b border-slate-100">
                        <td className="py-2 px-4 font-medium text-slate-800">{strategy}</td>
                        <td className="py-2 px-4 text-right text-slate-600">{stats.count}</td>
                        <td className="py-2 px-4 text-right text-slate-600">
                          {stats.count > 0 ? ((stats.wins / stats.count) * 100).toFixed(1) : 0}%
                        </td>
                        <td className={`py-2 px-4 text-right font-medium ${stats.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {formatCurrency(stats.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly Performance */}
          {monthlyData.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Performance</h3>
              <div className="space-y-2">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded p-3 border border-slate-200">
                    <span className="font-medium text-slate-800">{data.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">{data.count} trades</span>
                      <span className={`font-semibold ${data.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {formatCurrency(data.pnl)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard

