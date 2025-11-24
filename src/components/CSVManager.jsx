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
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <FileText className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Data Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Export Data</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Download your trading journal data as a CSV file. This includes all your trades,
            strategies, and settings.
          </p>
          <button
            onClick={handleExport}
            disabled={trades.length === 0}
            className={`w-full px-4 py-3 btn-primary rounded-xl font-medium flex items-center justify-center gap-2 ${trades.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <Download className="w-5 h-5" />
            Export to CSV
          </button>
        </div>

        {/* Import Section */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Import Data</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Upload a CSV file to restore your trading data.
            <span className="block mt-2 text-sm text-yellow-400/80">
              Warning: This will merge with your existing data.
            </span>
          </p>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-upload"
              disabled={importing}
            />
            {importing ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-400">Importing trades...</p>
              </div>
            ) : (
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-400' : 'text-gray-500'}`} />
                <span className="text-sm font-medium text-gray-300">
                  {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                </span>
                <span className="text-xs text-gray-500">CSV files only</span>
              </label>
            )}
          </div>

          {importResult && (
            <div className={`mt-4 rounded-xl p-3 border ${importResult.success
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
              }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {importResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${importResult.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {importResult.success
                        ? `Imported ${importResult.count} trades`
                        : 'Import failed'}
                    </h4>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-yellow-400 mb-1">
                          Warnings:
                        </p>
                        <ul className="text-xs text-yellow-500 space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
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
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSV Format Instructions */}
      <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">CSV Format Guide</h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 text-sm mb-4">
            If you're creating a CSV file manually, please ensure it follows this structure.
            The header row is required.
          </p>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-white/5">
                <tr>
                  <th className="px-4 py-2 rounded-tl-lg">Column</th>
                  <th className="px-4 py-2">Required</th>
                  <th className="px-4 py-2">Format</th>
                  <th className="px-4 py-2 rounded-tr-lg">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="bg-transparent">
                  <td className="px-4 py-2 font-medium text-white">symbol</td>
                  <td className="px-4 py-2 text-green-400">Yes</td>
                  <td className="px-4 py-2 text-gray-400">Text</td>
                  <td className="px-4 py-2 text-gray-400">Trading pair or stock symbol (e.g., BTC/USD, AAPL)</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="px-4 py-2 font-medium text-white">entryDate</td>
                  <td className="px-4 py-2 text-green-400">Yes</td>
                  <td className="px-4 py-2 text-gray-400">YYYY-MM-DD</td>
                  <td className="px-4 py-2 text-gray-400">Date the trade was opened</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="px-4 py-2 font-medium text-white">type</td>
                  <td className="px-4 py-2 text-green-400">Yes</td>
                  <td className="px-4 py-2 text-gray-400">long/short</td>
                  <td className="px-4 py-2 text-gray-400">Direction of the trade</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="px-4 py-2 font-medium text-white">entryPrice</td>
                  <td className="px-4 py-2 text-green-400">Yes</td>
                  <td className="px-4 py-2 text-gray-400">Number</td>
                  <td className="px-4 py-2 text-gray-400">Price at entry</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="px-4 py-2 font-medium text-white">exitPrice</td>
                  <td className="px-4 py-2 text-yellow-400">No</td>
                  <td className="px-4 py-2 text-gray-400">Number</td>
                  <td className="px-4 py-2 text-gray-400">Price at exit (leave empty if open)</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="px-4 py-2 font-medium text-white">quantity</td>
                  <td className="px-4 py-2 text-green-400">Yes</td>
                  <td className="px-4 py-2 text-gray-400">Number</td>
                  <td className="px-4 py-2 text-gray-400">Size of the position</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="px-4 py-2 font-medium text-white">status</td>
                  <td className="px-4 py-2 text-green-400">Yes</td>
                  <td className="px-4 py-2 text-gray-400">WIN/LOSS/OPEN/BE</td>
                  <td className="px-4 py-2 text-gray-400">Outcome of the trade</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSVManager
