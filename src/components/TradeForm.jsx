import { useState, useEffect } from 'react'
import { Save, X, Image as ImageIcon, Link as LinkIcon, Upload, Tag, TrendingUp, AlertTriangle } from 'lucide-react'
import { getStrategies } from '../utils/storage'

const COMMON_MISTAKES = [
  'FOMO',
  'Revenge Trading',
  'Overleveraging',
  'Early Exit',
  'Chasing Price',
  'Ignoring Stop Loss',
  'No Plan',
  'Emotional Entry',
  'Boredom Trading',
  'Counter Trend',
]

function TradeForm({ onAddTrade, editTrade, onCancelEdit, plannedTrade }) {
  const [strategies, setStrategies] = useState([])
  const [screenshots, setScreenshots] = useState([])
  const [urls, setUrls] = useState([''])
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'long',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    entryDate: '',
    exitDate: '',
    strategy: '',
    tags: '',
    mistakes: [],
    conviction: '',
    notes: '',
  })

  useEffect(() => {
    const savedStrategies = getStrategies()
    setStrategies(savedStrategies)
  }, [])

  useEffect(() => {
    if (plannedTrade) {
      // Pre-fill from planned trade
      setFormData({
        symbol: plannedTrade.symbol || '',
        type: plannedTrade.type || 'long',
        entryPrice: plannedTrade.targetEntry || '',
        exitPrice: plannedTrade.targetExit || '',
        quantity: plannedTrade.quantity || '',
        entryDate: plannedTrade.plannedDate || new Date().toISOString().split('T')[0],
        exitDate: '',
        strategy: plannedTrade.strategy || '',
        tags: plannedTrade.tags ? plannedTrade.tags.join(', ') : '',
        mistakes: [],
        conviction: plannedTrade.conviction || '',
        notes: plannedTrade.notes || '',
      })
      setScreenshots(plannedTrade.screenshots || [])
      setUrls([''])
    } else if (editTrade) {
      setFormData({
        symbol: editTrade.symbol || '',
        type: editTrade.type || 'long',
        entryPrice: editTrade.entryPrice || '',
        exitPrice: editTrade.exitPrice || '',
        quantity: editTrade.quantity || '',
        entryDate: editTrade.entryDate || '',
        exitDate: editTrade.exitDate || '',
        strategy: editTrade.strategy || '',
        tags: editTrade.tags ? editTrade.tags.join(', ') : '',
        mistakes: editTrade.mistakes || [],
        conviction: editTrade.conviction || '',
        notes: editTrade.notes || '',
      })
      setScreenshots(editTrade.screenshots || [])
      setUrls(editTrade.urls && editTrade.urls.length > 0 ? editTrade.urls : [''])
    } else {
      // Reset form when not editing
      setFormData({
        symbol: '',
        type: 'long',
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        entryDate: '',
        exitDate: '',
        strategy: '',
        tags: '',
        mistakes: [],
        conviction: '',
        notes: '',
      })
      setScreenshots([])
      setUrls([''])
    }
  }, [editTrade, plannedTrade])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleMistakeToggle = (mistake) => {
    setFormData(prev => {
      const newMistakes = prev.mistakes.includes(mistake)
        ? prev.mistakes.filter(m => m !== mistake)
        : [...prev.mistakes, mistake]
      return { ...prev, mistakes: newMistakes }
    })
  }

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setScreenshots(prev => [...prev, {
            id: Date.now().toString(),
            data: reader.result,
            name: file.name,
            type: file.type,
          }])
        }
        reader.readAsDataURL(file)
      }
    })
    e.target.value = '' // Reset input
  }

  const handleRemoveScreenshot = (id) => {
    setScreenshots(prev => prev.filter(s => s.id !== id))
  }

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const handleAddUrl = () => {
    setUrls([...urls, ''])
  }

  const handleRemoveUrl = (index) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index))
    } else {
      setUrls([''])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Calculate P/L
    const entry = parseFloat(formData.entryPrice)
    const exit = parseFloat(formData.exitPrice)
    const qty = parseFloat(formData.quantity)

    let pnl = 0
    if (formData.type === 'long') {
      pnl = (exit - entry) * qty
    } else {
      pnl = (entry - exit) * qty
    }

    const filteredUrls = urls.filter(url => url.trim() !== '')
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t)

    const trade = {
      ...formData,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      pnl: pnl,
      pnlPercent: ((pnl / (entry * qty)) * 100).toFixed(2),
      tags: tagsArray,
      screenshots: screenshots,
      urls: filteredUrls,
    }

    if (editTrade) {
      trade.id = editTrade.id
      trade.createdAt = editTrade.createdAt
      onAddTrade(trade, true) // true indicates it's an edit
    } else {
      onAddTrade(trade, false)
    }

    // Reset form
    setFormData({
      symbol: '',
      type: 'long',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      entryDate: '',
      exitDate: '',
      strategy: '',
      tags: '',
      mistakes: [],
      conviction: '',
      notes: '',
    })
    setScreenshots([])
    setUrls([''])

    if (editTrade && onCancelEdit) {
      onCancelEdit()
    } else {
      alert(editTrade ? 'Trade updated successfully!' : 'Trade added successfully!')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          {editTrade ? 'Edit Trade' : 'Add New Trade'}
        </h2>
        {editTrade && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
              placeholder="e.g., AAPL, BTC/USD"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          {/* Entry Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Entry Price *
            </label>
            <input
              type="number"
              name="entryPrice"
              value={formData.entryPrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Exit Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Exit Price *
            </label>
            <input
              type="number"
              name="exitPrice"
              value={formData.exitPrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Entry Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Entry Date *
            </label>
            <input
              type="date"
              name="entryDate"
              value={formData.entryDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Exit Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Exit Date *
            </label>
            <input
              type="date"
              name="exitDate"
              value={formData.exitDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Strategy / Bias
            </label>
            <select
              name="strategy"
              value={formData.strategy}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Strategy</option>
              {strategies.map(strategy => (
                <option key={strategy.id} value={strategy.name}>
                  {strategy.name} ({strategy.bias})
                </option>
              ))}
            </select>
            {strategies.length === 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Create strategies in the Strategy Manager tab
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., breakout, momentum, swing"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Conviction Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Conviction Level
            </label>
            <select
              name="conviction"
              value={formData.conviction}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Conviction</option>
              <option value="A+">A+ (Highest)</option>
              <option value="A">A (High)</option>
              <option value="B">B (Medium)</option>
            </select>
          </div>
        </div>

        {/* Mistakes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Mistakes
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_MISTAKES.map(mistake => (
              <button
                key={mistake}
                type="button"
                onClick={() => handleMistakeToggle(mistake)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${formData.mistakes.includes(mistake)
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {mistake}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Add any notes about this trade..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* URLs */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Relevant URLs
          </label>
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove URL"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddUrl}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
            >
              <LinkIcon className="w-4 h-4" />
              Add Another URL
            </button>
          </div>
        </div>

        {/* Screenshots */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Screenshots
          </label>
          <div className="space-y-4">
            {/* Upload Button */}
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-slate-600" />
                <span className="text-sm text-slate-600">Click to upload screenshots</span>
                <span className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </label>

            {/* Screenshot Preview */}
            {screenshots.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {screenshots.map((screenshot) => (
                  <div key={screenshot.id} className="relative group">
                    <img
                      src={screenshot.data}
                      alt={screenshot.name}
                      className="w-full h-32 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(screenshot.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove screenshot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-slate-600 mt-1 truncate" title={screenshot.name}>
                      {screenshot.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {editTrade ? 'Update Trade' : 'Save Trade'}
          </button>
          {editTrade && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 bg-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default TradeForm

