import { useState, useEffect } from 'react'
import { Target, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { getStrategies, saveStrategies } from '../utils/storage'

function StrategyManager({ onStrategyChange }) {
  const [strategies, setStrategies] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bias: 'neutral', // bullish, bearish, neutral
  })

  useEffect(() => {
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

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ name: '', description: '', bias: 'neutral' })
  }

  const handleEdit = (strategy) => {
    setEditingId(strategy.id)
    setFormData({
      name: strategy.name,
      description: strategy.description || '',
      bias: strategy.bias || 'neutral',
    })
    setIsAdding(false)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', description: '', bias: 'neutral' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Strategy name is required')
      return
    }

    let updatedStrategies
    
    if (isAdding) {
      const newStrategy = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      updatedStrategies = [...strategies, newStrategy]
    } else if (editingId) {
      updatedStrategies = strategies.map(s =>
        s.id === editingId ? { ...s, ...formData } : s
      )
    }

    setStrategies(updatedStrategies)
    saveStrategies(updatedStrategies)
    
    if (onStrategyChange) {
      onStrategyChange(updatedStrategies)
    }

    handleCancel()
    alert(`Strategy ${isAdding ? 'added' : 'updated'} successfully!`)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this strategy? Trades using this strategy will be unaffected.')) {
      const updatedStrategies = strategies.filter(s => s.id !== id)
      setStrategies(updatedStrategies)
      saveStrategies(updatedStrategies)
      
      if (onStrategyChange) {
        onStrategyChange(updatedStrategies)
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-slate-800">Strategy Manager</h2>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Strategy
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {isAdding ? 'Add New Strategy' : 'Edit Strategy'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Strategy Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Breakout Trading, Mean Reversion"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bias *
              </label>
              <select
                name="bias"
                value={formData.bias}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bullish">Bullish</option>
                <option value="bearish">Bearish</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe your trading strategy..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isAdding ? 'Add' : 'Update'} Strategy
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-400 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Strategies List */}
      {strategies.length === 0 && !isAdding && !editingId ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          <Target className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg">No strategies created yet.</p>
          <p className="text-sm mt-2">Create your first strategy to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-white rounded-lg p-5 border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {strategy.name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      strategy.bias === 'bullish'
                        ? 'bg-green-100 text-green-800'
                        : strategy.bias === 'bearish'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {strategy.bias.charAt(0).toUpperCase() + strategy.bias.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(strategy)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Edit strategy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(strategy.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete strategy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {strategy.description && (
                <p className="text-sm text-slate-600 mt-2">{strategy.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StrategyManager



