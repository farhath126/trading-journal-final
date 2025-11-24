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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Strategy Manager</h2>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 btn-primary rounded-xl font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Strategy
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-6 animate-slide-up">
          <h3 className="text-lg font-bold text-white mb-4">
            {isAdding ? 'Add New Strategy' : 'Edit Strategy'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Strategy Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Breakout Trading, Mean Reversion"
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bias *
              </label>
              <select
                name="bias"
                value={formData.bias}
                onChange={handleChange}
                required
                className="glass-input w-full"
              >
                <option value="bullish" className="bg-gray-900">Bullish</option>
                <option value="bearish" className="bg-gray-900">Bearish</option>
                <option value="neutral" className="bg-gray-900">Neutral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe your trading strategy..."
                className="glass-input w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 btn-primary rounded-xl font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isAdding ? 'Add' : 'Update'} Strategy
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-white/5 text-gray-300 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
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
        <div className="text-center py-12 text-gray-500 glass-panel rounded-2xl border border-white/5">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-lg">No strategies created yet.</p>
          <p className="text-sm mt-2">Create your first strategy to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="glass-card rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {strategy.name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${strategy.bias === 'bullish'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : strategy.bias === 'bearish'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-white/10 text-gray-300 border-white/10'
                      }`}
                  >
                    {strategy.bias.charAt(0).toUpperCase() + strategy.bias.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(strategy)}
                    className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                    title="Edit strategy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(strategy.id)}
                    className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                    title="Delete strategy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {strategy.description && (
                <p className="text-sm text-gray-400 mt-2">{strategy.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StrategyManager



