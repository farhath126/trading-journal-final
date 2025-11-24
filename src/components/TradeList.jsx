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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Trade History ({trades.length} {trades.length === 1 ? 'trade' : 'trades'})
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            title="Export trades to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {trades.length > 0 && (
            <button
              onClick={handleDeleteAllClick}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Delete All Trades?
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  This will permanently delete all {trades.length} trade{trades.length !== 1 ? 's' : ''}. This action cannot be undone.
                </p>
                <p className="text-sm font-medium text-red-600 mb-4">
                  Are you absolutely sure you want to continue?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAllConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={handleDeleteAllCancel}
                    className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th
                className="text-left py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  {getSortIcon('date')}
                </div>
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-2">
                  Symbol
                  {getSortIcon('symbol')}
                </div>
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  {getSortIcon('type')}
                </div>
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('strategy')}
              >
                <div className="flex items-center gap-2">
                  Strategy
                  {getSortIcon('strategy')}
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('entryPrice')}
              >
                <div className="flex items-center justify-end gap-2">
                  Entry
                  {getSortIcon('entryPrice')}
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('exitPrice')}
              >
                <div className="flex items-center justify-end gap-2">
                  Exit
                  {getSortIcon('exitPrice')}
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center justify-end gap-2">
                  Quantity
                  {getSortIcon('quantity')}
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('pnl')}
              >
                <div className="flex items-center justify-end gap-2">
                  P/L
                  {getSortIcon('pnl')}
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => handleSort('pnlPercent')}
              >
                <div className="flex items-center justify-end gap-2">
                  P/L %
                  {getSortIcon('pnlPercent')}
                </div>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => (
              <>
                <tr
                  key={trade.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-600">
                    {formatDate(trade.exitDate || trade.entryDate)}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{trade.symbol}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${trade.type === 'long'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {trade.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex flex-col gap-1">
                      {trade.strategy && <span>{trade.strategy}</span>}
                      {trade.conviction && (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium w-fit ${trade.conviction === 'A+' ? 'bg-purple-100 text-purple-800' :
                          trade.conviction === 'A' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {trade.conviction}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {formatCurrency(trade.entryPrice)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {formatCurrency(trade.exitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">{trade.quantity}</td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {formatCurrency(trade.pnl)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {trade.pnlPercent}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          if (onEditTrade) {
                            onEditTrade(trade)
                          }
                        }}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
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
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete trade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewingChart(trade)}
                        className="text-purple-500 hover:text-purple-700 transition-colors"
                        title="View Chart"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      {(trade.screenshots?.length > 0 || trade.urls?.length > 0) && (
                        <button
                          onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                          className="text-slate-500 hover:text-slate-700 transition-colors"
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
                    <td colSpan="10" className="px-4 py-4 bg-slate-50">
                      <div className="space-y-4">
                        {/* Tags */}
                        {trade.tags && trade.tags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {trade.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium flex items-center gap-1"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {trade.notes && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Notes</h4>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{trade.notes}</p>
                          </div>
                        )}

                        {/* URLs */}
                        {trade.urls && trade.urls.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                              <LinkIcon className="w-4 h-4" />
                              Relevant URLs
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {trade.urls.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
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
                            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Screenshots ({trade.screenshots.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {trade.screenshots.map((screenshot, index) => (
                                <div
                                  key={screenshot.id || index}
                                  className="relative group cursor-pointer"
                                  onClick={() => setViewingImage(screenshot.data)}
                                >
                                  <img
                                    src={screenshot.data}
                                    alt={screenshot.name || `Screenshot ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border border-slate-200 hover:border-blue-500 transition-colors"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs">
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

      {/* Image Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-6 h-6 text-slate-800" />
            </button>
            <img
              src={viewingImage}
              alt="Screenshot"
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Chart Modal */}
      {viewingChart && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingChart(null)}
        >
          <div className="relative w-full max-w-6xl h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Chart Analysis: {viewingChart.symbol}
              </h3>
              <button
                onClick={() => setViewingChart(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 p-4 bg-slate-50">
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

