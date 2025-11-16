import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { importTradesFromCSV } from '../utils/csv'

function CSVImport({ onImport, existingTradesCount }) {
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

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Import Trades from CSV</h2>

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">CSV Format Requirements</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Required columns: Symbol, Entry Price, Exit Price, Quantity, Entry Date, Exit Date</li>
            <li>Optional columns: Type (long/short), Strategy, Tags (comma-separated), Conviction (A+, A, B), Notes, URLs (semicolon-separated), ID, Created At</li>
            <li>Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
            <li>Tags should be separated by commas (,)</li>
            <li>URLs should be separated by semicolons (;)</li>
          </ul>
      </div>

      {/* Import Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600">Importing trades...</p>
          </div>
        ) : (
          <label
            htmlFor="csv-import-input"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <Upload className="w-12 h-12 text-slate-600" />
            <div>
              <p className="text-lg font-medium text-slate-700">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-slate-500 mt-1">
                CSV file only
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`mt-6 rounded-lg p-4 border ${
          importResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.success
                    ? `Successfully imported ${importResult.count} trade${importResult.count !== 1 ? 's' : ''}`
                    : 'Import failed'}
                </h3>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Warnings ({importResult.errors.length}):
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
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
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sample CSV Template */}
      <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Sample CSV Format
        </h3>
        <div className="overflow-x-auto">
          <pre className="text-xs text-slate-600 font-mono">
{`Symbol,Type,Entry Price,Exit Price,Quantity,Entry Date,Exit Date,Strategy,Tags,Conviction,Notes,URLs
AAPL,long,150.00,155.50,10,2024-01-15,2024-01-20,Breakout Trading,breakout,momentum,A+,Good trade,https://example.com
BTC/USD,short,45000,44000,0.5,2024-01-10,2024-01-12,Mean Reversion,swing,reversal,A,Short position,https://example.com;https://example2.com`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default CSVImport


