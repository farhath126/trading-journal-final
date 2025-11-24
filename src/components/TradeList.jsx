import { useState, useMemo } from 'react'
import { Trash2, Edit2, Image as ImageIcon, Link as LinkIcon, X, ExternalLink, Download, AlertTriangle, ArrowUp, ArrowDown, ArrowUpDown, Tag, TrendingUp, BarChart2 } from 'lucide-react'
import { exportTradesToCSV } from '../utils/csv'
import TradeChart from './TradeChart'
import ErrorBoundary from './ErrorBoundary'

function TradeList({ trades, onDeleteTrade, onEditTrade, onDeleteAll, settings }) {
  const [expandedTrade, setExpandedTrade] = useState(null)
  const [viewingImage, setViewingImage] = useState(null)
  const [viewingChart, setViewingChart] = useState(null)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

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
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Trade History</h2>
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No trades recorded yet.</p>
          <p className="text-sm mt-2">Add your first trade to get started!</p>
        </div>
      </div>
    )
  }

  const handleExport = () => {
    exportTradesToCSV(trades, settings)
  }

  const handleDeleteAllClick = () => {
    setShowDeleteAllConfirm(true)
  }

  const handleDeleteAllConfirm = () => {
    if (onDeleteAll) {
      onDeleteAll()
    }
    setShowDeleteAllConfirm(false)
  }

  const handleDeleteAllCancel = () => {
    setShowDeleteAllConfirm(false)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedTrades = useMemo(() => {
    if (!sortConfig.key) return trades

    return [...trades].sort((a, b) => {
      let aValue, bValue

      switch (sortConfig.key) {
        case 'date':
          aValue = new Date(a.exitDate || a.entryDate || a.createdAt || 0)
          bValue = new Date(b.exitDate || b.entryDate || b.createdAt || 0)
          break
        case 'symbol':
          aValue = (a.symbol || '').toLowerCase()
          bValue = (b.symbol || '').toLowerCase()
          break
        case 'type':
          aValue = a.type || ''
          bValue = b.type || ''
          break
        case 'strategy':
          aValue = (a.strategy || '').toLowerCase()
          bValue = (b.strategy || '').toLowerCase()
          break
        case 'entryPrice':
          aValue = parseFloat(a.entryPrice) || 0
          bValue = parseFloat(b.entryPrice) || 0
          break
        case 'exitPrice':
          aValue = parseFloat(a.exitPrice) || 0
          bValue = parseFloat(b.exitPrice) || 0
          break
        case 'quantity':
          aValue = parseFloat(a.quantity) || 0
          bValue = parseFloat(b.quantity) || 0
          break
        case 'pnl':
          aValue = parseFloat(a.pnl) || 0
          bValue = parseFloat(b.pnl) || 0
          break
        case 'pnlPercent':
          aValue = parseFloat(a.pnlPercent) || 0
          bValue = parseFloat(b.pnlPercent) || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [trades, sortConfig])

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400" />
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Trade History <span className="text-gray-500 text-lg font-normal ml-2">({trades.length} {trades.length === 1 ? 'trade' : 'trades'})</span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 font-medium rounded-xl hover:bg-green-600/30 transition-all"
            title="Export trades to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {trades.length > 0 && (
            <button
              onClick={handleDeleteAllClick}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 font-medium rounded-xl hover:bg-red-600/30 transition-all"
              title="Delete all trades"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 border-red-500/30">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  Delete All Trades?
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  This will permanently delete all {trades.length} trade{trades.length !== 1 ? 's' : ''}. This action cannot be undone.
                </p>
                <p className="text-sm font-medium text-red-400 mb-4">
                  Are you absolutely sure you want to continue?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAllConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={handleDeleteAllCancel}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th
                  className="text-left py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none first:pl-6"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {getSortIcon('date')}
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-2">
                    Symbol
                    {getSortIcon('symbol')}
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {getSortIcon('type')}
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('strategy')}
                >
                  <div className="flex items-center gap-2">
                    Strategy
                    {getSortIcon('strategy')}
                  </div>
                </th>
                <th
                  className="text-right py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('entryPrice')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Entry
                    {getSortIcon('entryPrice')}
                  </div>
                </th>
                <th
                  className="text-right py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('exitPrice')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Exit
                    {getSortIcon('exitPrice')}
                  </div>
                </th>
                <th
                  className="text-right py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Quantity
                    {getSortIcon('quantity')}
                  </div>
                </th>
                <th
                  className="text-right py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('pnl')}
                >
                  <div className="flex items-center justify-end gap-2">
                    P/L
                    {getSortIcon('pnl')}
                  </div>
                </th>
                <th
                  className="text-right py-4 px-6 font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('pnlPercent')}
                >
                  <div className="flex items-center justify-end gap-2">
                    P/L %
                    {getSortIcon('pnlPercent')}
                  </div>
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.map((trade) => (
                <>
                  <tr
                    key={trade.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6 text-gray-400">
                      {formatDate(trade.exitDate || trade.entryDate)}
                    </td>
                    <td className="py-4 px-6 font-medium text-white">{trade.symbol}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${trade.type === 'long'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                      >
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      <div className="flex flex-col gap-1">
                        {trade.strategy && <span>{trade.strategy}</span>}
                        {trade.conviction && (
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold w-fit border ${trade.conviction === 'A+' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                            trade.conviction === 'A' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }`}>
                            {trade.conviction}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400 font-mono">
                      {formatCurrency(trade.entryPrice)}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400 font-mono">
                      {formatCurrency(trade.exitPrice)}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400 font-mono">{trade.quantity}</td>
                    <td
                      className={`py-4 px-6 text-right font-bold font-mono ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                      {formatCurrency(trade.pnl)}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-bold font-mono ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                      {trade.pnlPercent}%
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            if (onEditTrade) {
                              onEditTrade(trade)
                            }
                          }}
                          className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                          title="Edit trade"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this trade?')) {
                              onDeleteTrade(trade.id)
                            }
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                          title="Delete trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingChart(trade)}
                          className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-400 transition-colors"
                          title="View Chart"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>
                        {(trade.screenshots?.length > 0 || trade.urls?.length > 0) && (
                          <button
                            onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="View details"
                          >
                            {expandedTrade === trade.id ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <ImageIcon className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Details Row */}
                  {expandedTrade === trade.id && (
                    <tr key={`${trade.id}-expanded`}>
                      <td colSpan="10" className="px-6 py-6 bg-black/20 border-b border-white/5">
                        <div className="space-y-6 animate-slide-up">
                          {/* Tags */}
                          {trade.tags && trade.tags.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-blue-400" />
                                Tags
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {trade.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                  >
                                    <Tag className="w-3 h-3 opacity-50" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {trade.notes && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-300 mb-2">Notes</h4>
                              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{trade.notes}</p>
                              </div>
                            </div>
                          )}

                          {/* URLs */}
                          {trade.urls && trade.urls.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-blue-400" />
                                Relevant URLs
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {trade.urls.map((url, index) => (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                                  >
                                    {url}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Screenshots */}
                          {trade.screenshots && trade.screenshots.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-blue-400" />
                                Screenshots ({trade.screenshots.length})
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {trade.screenshots.map((screenshot, index) => (
                                  <div
                                    key={screenshot.id || index}
                                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10"
                                    onClick={() => setViewingImage(screenshot.data)}
                                  >
                                    <img
                                      src={screenshot.data}
                                      alt={screenshot.name || `Screenshot ${index + 1}`}
                                      className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                      <span className="text-white text-xs font-medium px-3 py-1.5 bg-black/40 rounded-full border border-white/20">
                                        Click to view
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-6xl max-h-full animate-fade-in">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={viewingImage}
              alt="Screenshot"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Chart Modal */}
      {viewingChart && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingChart(null)}
        >
          <div className="relative w-full max-w-6xl h-[80vh] glass-panel rounded-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-400" />
                Chart Analysis: <span className="text-blue-400">{viewingChart.symbol}</span>
              </h3>
              <button
                onClick={() => setViewingChart(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-900/50">
              <ErrorBoundary>
                <TradeChart
                  symbol={viewingChart.symbol}
                  entryPrice={viewingChart.entryPrice}
                  exitPrice={viewingChart.exitPrice}
                  type={viewingChart.type}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradeList

