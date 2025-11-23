import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from 'lucide-react'
import { importTradesFromCSV, exportTradesToCSV } from '../utils/csv'

function CSVManager({ onImport, trades, settings }) {
  const [isDragging, setIsDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const handleFileSelect = (file) => {
    if (!file) return
    
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setImporting(true)
    setImportResult(null)

    importTradesFromCSV(file, (importedTrades, errors) => {
      setImporting(false)
      
      if (errors.length > 0) {
        setImportResult({
          success: true,
          count: importedTrades.length,
          errors: errors,
        })
      } else {
        setImportResult({
          success: true,
          count: importedTrades.length,
          errors: [],
        })
      }

      // Call the parent's import handler
      onImport(importedTrades)
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
    e.target.value = '' // Reset input
  }

  const clearResult = () => {
    setImportResult(null)
  }

  const handleExport = () => {
    exportTradesToCSV(trades, settings)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Data Management</h2>
        <p className="text-slate-600 mb-8">Import trades from other platforms or export your data for backup and analysis.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Export Data</h3>
          </div>
          
          <p className="text-slate-600 mb-6 text-sm">
            Download all your trades as a CSV file. This file can be opened in Excel, Google Sheets, or imported back into the Trading Journal.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Total Trades:</span>
              <span className="font-medium text-slate-900">{trades.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Format:</span>
              <span className="font-medium text-slate-900">CSV</span>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={trades.length === 0}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              trades.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow'
            }`}
          >
            <Download className="w-4 h-4" />
            Export All Trades
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Import Data</h3>
          </div>

          <p className="text-slate-600 mb-6 text-sm">
            Upload a CSV file containing your trade history. Make sure your file matches the required format.
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-import-input"
              disabled={importing}
            />
            
            {importing ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-slate-600">Importing trades...</p>
              </div>
            ) : (
              <label
                htmlFor="csv-import-input"
                className="cursor-pointer flex flex-col items-center gap-2 py-2"
              >
                <Upload className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Click to upload
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    or drag and drop CSV
                  </p>
                </div>
              </label>
            )}
          </div>

          {importResult && (
            <div className={`mt-4 rounded-lg p-3 border ${
              importResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {importResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${
                      importResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {importResult.success
                        ? `Imported ${importResult.count} trades`
                        : 'Import failed'}
                    </h4>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-yellow-800 mb-1">
                          Warnings:
                        </p>
                        <ul className="text-xs text-yellow-700 space-y-1 max-h-20 overflow-y-auto">
                          {importResult.errors.map((error, index) => (
                            <li key={index} className="list-disc list-inside">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={clearResult}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          CSV Format Requirements
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Required Columns</h4>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Symbol (e.g., AAPL, BTC/USD)</li>
              <li>Entry Price (number)</li>
              <li>Exit Price (number)</li>
              <li>Quantity (number)</li>
              <li>Entry Date (YYYY-MM-DD)</li>
              <li>Exit Date (YYYY-MM-DD)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Optional Columns</h4>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Type (long/short)</li>
              <li>Strategy (text)</li>
              <li>Tags (comma-separated)</li>
              <li>Conviction (A+, A, B)</li>
              <li>Notes (text)</li>
              <li>URLs (semicolon-separated)</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Sample CSV</h4>
          <div className="bg-slate-100 rounded border border-slate-200 p-3 overflow-x-auto">
            <pre className="text-xs text-slate-600 font-mono">
{`Symbol,Type,Entry Price,Exit Price,Quantity,Entry Date,Exit Date,Strategy,Tags,Conviction,Notes
AAPL,long,150.00,155.50,10,2024-01-15,2024-01-20,Breakout,tech,A+,Good trade
BTC/USD,short,45000,44000,0.5,2024-01-10,2024-01-12,Reversal,crypto,A,Quick scalp`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSVManager
