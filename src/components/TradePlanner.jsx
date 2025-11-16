import { useState, useEffect } from 'react'
import { Calendar, Save, X, Upload, Image as ImageIcon, Tag, TrendingUp } from 'lucide-react'
import { getPlannedTrades, savePlannedTrades, getStrategies } from '../utils/storage'

function TradePlanner({ onConvertToTrade }) {
  const [plannedTrades, setPlannedTrades] = useState([])
  const [strategies, setStrategies] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'long',
    targetEntry: '',
    targetExit: '',
    stopLoss: '',
    quantity: '',
    plannedDate: '',
    strategy: '',
    tags: '',
    conviction: '',
    notes: '',
    screenshots: [],
  })

  useEffect(() => {
    const savedPlannedTrades = getPlannedTrades()
    setPlannedTrades(savedPlannedTrades)
    const savedStrategies = getStrategies()
    setStrategies(savedStrategies)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            screenshots: [...prev.screenshots, {
              id: Date.now().toString(),
              data: reader.result,
              name: file.name,
              type: file.type,
            }]
          }))
        }
        reader.readAsDataURL(file)
      }
    })
    e.target.value = ''
  }

  const handleRemoveScreenshot = (id) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s.id !== id)
    }))
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      symbol: '',
      type: 'long',
      targetEntry: '',
      targetExit: '',
      stopLoss: '',
      quantity: '',
      plannedDate: '',
      strategy: '',
      tags: '',
      conviction: '',
      notes: '',
      screenshots: [],
    })
  }

  const handleEdit = (plannedTrade) => {
    setEditingId(plannedTrade.id)
    setIsAdding(false)
    setFormData({
      symbol: plannedTrade.symbol || '',
      type: plannedTrade.type || 'long',
      targetEntry: plannedTrade.targetEntry || '',
      targetExit: plannedTrade.targetExit || '',
      stopLoss: plannedTrade.stopLoss || '',
      quantity: plannedTrade.quantity || '',
      plannedDate: plannedTrade.plannedDate || '',
      strategy: plannedTrade.strategy || '',
      tags: plannedTrade.tags ? plannedTrade.tags.join(', ') : '',
      conviction: plannedTrade.conviction || '',
      notes: plannedTrade.notes || '',
      screenshots: plannedTrade.screenshots || [],
    })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      symbol: '',
      type: 'long',
      targetEntry: '',
      targetExit: '',
      stopLoss: '',
      quantity: '',
      plannedDate: '',
      strategy: '',
      tags: '',
      conviction: '',
      notes: '',
      screenshots: [],
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.symbol.trim()) {
      alert('Symbol is required')
      return
    }

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t)
    
    const plannedTrade = {
      ...formData,
      tags: tagsArray,
      id: editingId || Date.now().toString(),
      createdAt: editingId ? plannedTrades.find(t => t.id === editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let updatedPlannedTrades
    if (editingId) {
      updatedPlannedTrades = plannedTrades.map(t =>
        t.id === editingId ? plannedTrade : t
      )
    } else {
      updatedPlannedTrades = [plannedTrade, ...plannedTrades]
    }

    setPlannedTrades(updatedPlannedTrades)
    savePlannedTrades(updatedPlannedTrades)
    handleCancel()
    alert(`Trade plan ${editingId ? 'updated' : 'added'} successfully!`)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this planned trade?')) {
      const updatedPlannedTrades = plannedTrades.filter(t => t.id !== id)
      setPlannedTrades(updatedPlannedTrades)
      savePlannedTrades(updatedPlannedTrades)
    }
  }

  const handleConvertToTrade = (plannedTrade) => {
    if (onConvertToTrade) {
      onConvertToTrade(plannedTrade)
      handleDelete(plannedTrade.id)
    }
  }

  const getConvictionColor = (conviction) => {
    switch (conviction) {
      case 'A+': return 'bg-purple-100 text-purple-800'
      case 'A': return 'bg-blue-100 text-blue-800'
      case 'B': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-slate-800">Trade Planner</h2>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Plan New Trade
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {isAdding ? 'Plan New Trade' : 'Edit Planned Trade'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Entry Price
                </label>
                <input
                  type="number"
                  name="targetEntry"
                  value={formData.targetEntry}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Exit Price
                </label>
                <input
                  type="number"
                  name="targetExit"
                  value={formData.targetExit}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stop Loss
                </label>
                <input
                  type="number"
                  name="stopLoss"
                  value={formData.stopLoss}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Planned Date
                </label>
                <input
                  type="date"
                  name="plannedDate"
                  value={formData.plannedDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Strategy
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
              </div>

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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Add planning notes..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Screenshots */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Screenshots
              </label>
              <label className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-600">Click to upload screenshots</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
              </label>
              {formData.screenshots.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.screenshots.map((screenshot) => (
                    <div key={screenshot.id} className="relative group">
                      <img
                        src={screenshot.data}
                        alt={screenshot.name}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(screenshot.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isAdding ? 'Save Plan' : 'Update Plan'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Planned Trades List */}
      {plannedTrades.length === 0 && !isAdding && !editingId ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg">No planned trades yet.</p>
          <p className="text-sm mt-2">Plan your next trade to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plannedTrades.map((plannedTrade) => (
            <div
              key={plannedTrade.id}
              className="bg-white rounded-lg p-5 border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {plannedTrade.symbol}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        plannedTrade.type === 'long'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {plannedTrade.type.toUpperCase()}
                    </span>
                    {plannedTrade.conviction && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getConvictionColor(plannedTrade.conviction)}`}>
                        {plannedTrade.conviction}
                      </span>
                    )}
                  </div>
                  {plannedTrade.plannedDate && (
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Planned: {new Date(plannedTrade.plannedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConvertToTrade(plannedTrade)}
                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                    title="Convert to actual trade"
                  >
                    Execute
                  </button>
                  <button
                    onClick={() => handleEdit(plannedTrade)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    title="Edit plan"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plannedTrade.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                    title="Delete plan"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                {plannedTrade.targetEntry && (
                  <div>
                    <span className="text-slate-600">Entry: </span>
                    <span className="font-medium">{plannedTrade.targetEntry}</span>
                  </div>
                )}
                {plannedTrade.targetExit && (
                  <div>
                    <span className="text-slate-600">Exit: </span>
                    <span className="font-medium">{plannedTrade.targetExit}</span>
                  </div>
                )}
                {plannedTrade.stopLoss && (
                  <div>
                    <span className="text-slate-600">Stop Loss: </span>
                    <span className="font-medium text-red-600">{plannedTrade.stopLoss}</span>
                  </div>
                )}
                {plannedTrade.quantity && (
                  <div>
                    <span className="text-slate-600">Qty: </span>
                    <span className="font-medium">{plannedTrade.quantity}</span>
                  </div>
                )}
              </div>

              {plannedTrade.strategy && (
                <div className="mb-2 text-sm">
                  <span className="text-slate-600">Strategy: </span>
                  <span className="font-medium">{plannedTrade.strategy}</span>
                </div>
              )}

              {plannedTrade.tags && plannedTrade.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {plannedTrade.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {plannedTrade.notes && (
                <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">
                  {plannedTrade.notes}
                </p>
              )}

              {plannedTrade.screenshots && plannedTrade.screenshots.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {plannedTrade.screenshots.map((screenshot, index) => (
                    <img
                      key={screenshot.id || index}
                      src={screenshot.data}
                      alt={screenshot.name || `Screenshot ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TradePlanner


