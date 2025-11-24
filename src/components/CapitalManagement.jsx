import { useState, useEffect } from 'react'
import { DollarSign, Plus, Minus, Trash2, Save, Calendar } from 'lucide-react'
import { getCapitalAdjustments, saveCapitalAdjustments } from '../utils/storage'

function CapitalManagement({ settings, onCapitalChange }) {
  const [adjustments, setAdjustments] = useState([])
  const [formData, setFormData] = useState({
    type: 'deposit', // deposit or withdrawal
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    const savedAdjustments = getCapitalAdjustments()
    setAdjustments(savedAdjustments)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (parseFloat(value) || '') : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const adjustment = {
      id: Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString(),
    }

    const updatedAdjustments = [adjustment, ...adjustments]
    setAdjustments(updatedAdjustments)
    saveCapitalAdjustments(updatedAdjustments)

    if (onCapitalChange) {
      onCapitalChange(updatedAdjustments)
    }

    // Reset form
    setFormData({
      type: 'deposit',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    })

    alert(`Capital ${formData.type === 'deposit' ? 'deposited' : 'withdrawn'} successfully!`)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this capital adjustment?')) {
      const updatedAdjustments = adjustments.filter(a => a.id !== id)
      setAdjustments(updatedAdjustments)
      saveCapitalAdjustments(updatedAdjustments)

      if (onCapitalChange) {
        onCapitalChange(updatedAdjustments)
      }
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Calculate total adjustments
  const totalDeposits = adjustments
    .filter(a => a.type === 'deposit')
    .reduce((sum, a) => sum + (a.amount || 0), 0)

  const totalWithdrawals = adjustments
    .filter(a => a.type === 'withdrawal')
    .reduce((sum, a) => sum + (a.amount || 0), 0)

  const netAdjustments = totalDeposits - totalWithdrawals

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <DollarSign className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Capital Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-4 border border-green-500/20 bg-green-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-400">Total Deposits</span>
            <Plus className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalDeposits)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-400">Total Withdrawals</span>
            <Minus className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalWithdrawals)}</p>
        </div>
        <div className={`glass-card rounded-2xl p-4 border ${netAdjustments >= 0
            ? 'border-blue-500/20 bg-blue-500/5'
            : 'border-orange-500/20 bg-orange-500/5'
          }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${netAdjustments >= 0 ? 'text-blue-400' : 'text-orange-400'
              }`}>
              Net Adjustments
            </span>
            <DollarSign className={`w-4 h-4 ${netAdjustments >= 0 ? 'text-blue-400' : 'text-orange-400'
              }`} />
          </div>
          <p className={`text-2xl font-bold ${netAdjustments >= 0 ? 'text-blue-400' : 'text-orange-400'
            }`}>
            {formatCurrency(netAdjustments)}
          </p>
        </div>
      </div>

      {/* Add Adjustment Form */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Add Capital Adjustment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="glass-input w-full"
              >
                <option value="deposit" className="bg-gray-900">Deposit (Add Capital)</option>
                <option value="withdrawal" className="bg-gray-900">Withdrawal (Remove Capital)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {settings?.currency === 'USD' ? '$' :
                    settings?.currency === 'EUR' ? '€' :
                      settings?.currency === 'GBP' ? '£' :
                        settings?.currency === 'JPY' ? '¥' :
                          settings?.currency === 'INR' ? '₹' :
                            settings?.currency === 'BTC' ? '₿' :
                              settings?.currency === 'ETH' ? 'Ξ' : '$'}
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="glass-input w-full pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes about this adjustment"
                className="glass-input w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 btn-primary rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {formData.type === 'deposit' ? 'Add Deposit' : 'Record Withdrawal'}
          </button>
        </form>
      </div>

      {/* Adjustments History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Adjustment History ({adjustments.length})
        </h3>
        {adjustments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 glass-panel rounded-2xl border border-white/5">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">No capital adjustments yet.</p>
            <p className="text-sm mt-2">Add your first deposit or withdrawal above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar glass-panel rounded-2xl border border-white/10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-3 px-4 font-semibold text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-400">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-400">Notes</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adjustment) => (
                  <tr
                    key={adjustment.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-300">
                      {formatDate(adjustment.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium border ${adjustment.type === 'deposit'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                      >
                        {adjustment.type === 'deposit' ? (
                          <span className="flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            Deposit
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Minus className="w-3 h-3" />
                            Withdrawal
                          </span>
                        )}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${adjustment.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                      {adjustment.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(adjustment.amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {adjustment.notes || <span className="text-gray-600">-</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(adjustment.id)}
                        className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                        title="Delete adjustment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CapitalManagement



