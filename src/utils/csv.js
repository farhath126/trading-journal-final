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
export const importTradesFromCSV = (file, onImport) => {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim() !== '')
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row')
      }

      // Parse header
      const headers = parseCSVLine(lines[0])
      const headerMap = {}
      headers.forEach((header, index) => {
        headerMap[header.trim().toLowerCase()] = index
      })

      // Validate required headers
      const requiredHeaders = ['symbol', 'entry price', 'exit price', 'quantity', 'entry date', 'exit date']
      const missingHeaders = requiredHeaders.filter(h => !headerMap[h])
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      // Parse data rows
      const importedTrades = []
      const errors = []

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i])
          
          if (values.length === 0 || values.every(v => !v.trim())) {
            continue // Skip empty rows
          }

          const symbol = getValue(values, headerMap, 'symbol')
          const entryPrice = parseFloat(getValue(values, headerMap, 'entry price'))
          const exitPrice = parseFloat(getValue(values, headerMap, 'exit price'))
          const quantity = parseFloat(getValue(values, headerMap, 'quantity'))
          const entryDate = getValue(values, headerMap, 'entry date')
          const exitDate = getValue(values, headerMap, 'exit date')
          const type = (getValue(values, headerMap, 'type') || 'long').toLowerCase()
          const strategy = getValue(values, headerMap, 'strategy') || ''
          const tagsStr = getValue(values, headerMap, 'tags') || ''
          const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : []
          const conviction = getValue(values, headerMap, 'conviction') || ''
          const notes = getValue(values, headerMap, 'notes') || ''
          const urlsStr = getValue(values, headerMap, 'urls') || ''
          const urls = urlsStr ? urlsStr.split(';').map(u => u.trim()).filter(u => u) : []

          // Validate required fields
          if (!symbol || isNaN(entryPrice) || isNaN(exitPrice) || isNaN(quantity) || !entryDate || !exitDate) {
            errors.push(`Row ${i + 1}: Missing required fields`)
            continue
          }

          // Calculate P/L
          let pnl = 0
          if (type === 'long') {
            pnl = (exitPrice - entryPrice) * quantity
          } else {
            pnl = (entryPrice - exitPrice) * quantity
          }

          const trade = {
            symbol: symbol.trim(),
            type: type === 'short' ? 'short' : 'long',
            entryPrice: entryPrice,
            exitPrice: exitPrice,
            quantity: quantity,
            entryDate: formatDate(entryDate),
            exitDate: formatDate(exitDate),
            strategy: strategy.trim(),
            tags: tags,
            conviction: conviction.trim(),
            notes: notes.trim(),
            urls: urls,
            pnl: pnl,
            pnlPercent: ((pnl / (entryPrice * quantity)) * 100).toFixed(2),
            id: getValue(values, headerMap, 'id') || Date.now().toString() + '_' + i,
            createdAt: getValue(values, headerMap, 'created at') || new Date().toISOString(),
          }

          importedTrades.push(trade)
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`)
        }
      }

      if (importedTrades.length === 0) {
        throw new Error('No valid trades found in CSV file')
      }

      // Call the import callback
      onImport(importedTrades, errors)
    } catch (error) {
      alert(`Error importing CSV: ${error.message}`)
    }
  }

  reader.onerror = () => {
    alert('Error reading file')
  }

  reader.readAsText(file)
}

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  values.push(current)
  
  return values
}

// Helper function to get value from CSV row
function getValue(values, headerMap, headerName) {
  const index = headerMap[headerName]
  if (index !== undefined && values[index] !== undefined) {
    return values[index].trim()
  }
  return ''
}

// Helper function to format date (handles various formats)
function formatDate(dateStr) {
  if (!dateStr) return ''
  
  // Try to parse various date formats
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    // If parsing fails, try to handle common formats
    const parts = dateStr.split(/[-\/]/)
    if (parts.length === 3) {
      // Try YYYY-MM-DD or MM/DD/YYYY
      if (parts[0].length === 4) {
        return dateStr // Assume YYYY-MM-DD
      } else {
        // MM/DD/YYYY -> YYYY-MM-DD
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
      }
    }
    return dateStr // Return as-is if can't parse
  }
  
  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0]
}


