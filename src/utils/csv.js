// CSV Export Function
export const exportTradesToCSV = (trades, settings) => {
  if (trades.length === 0) {
    alert('No trades to export')
    return
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Symbol',
    'Type',
    'Entry Price',
    'Exit Price',
    'Quantity',
    'Entry Date',
    'Exit Date',
    'Strategy',
    'Tags',
    'Conviction',
    'P/L',
    'P/L %',
    'Notes',
    'URLs',
    'Created At'
  ]

  // Convert trades to CSV rows
  const rows = trades.map(trade => {
    const urls = trade.urls && trade.urls.length > 0 ? trade.urls.join('; ') : ''
    const tags = trade.tags && trade.tags.length > 0 ? trade.tags.join(', ') : ''
    return [
      trade.id || '',
      trade.symbol || '',
      trade.type || '',
      trade.entryPrice || '',
      trade.exitPrice || '',
      trade.quantity || '',
      trade.entryDate || '',
      trade.exitDate || '',
      trade.strategy || '',
      tags,
      trade.conviction || '',
      trade.pnl || '',
      trade.pnlPercent || '',
      (trade.notes || '').replace(/"/g, '""'), // Escape quotes in notes
      urls,
      trade.createdAt || ''
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => {
        // Wrap in quotes if contains comma, newline, or quote
        const cellStr = String(cell || '')
        if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `trades_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// CSV Import Function
import { TradeIngestionService } from './TradeIngestionService';

export const importTradesFromCSV = async (file, onImport) => {
  try {
    const { trades, errors } = await TradeIngestionService.ingest(file);
    onImport(trades, errors);
  } catch (error) {
    console.error("Import failed:", error);
    onImport([], [`Fatal Error: ${error.message}`]);
  }
}



