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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-slate-800">Capital Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Total Deposits</span>
            <Plus className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDeposits)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Total Withdrawals</span>
            <Minus className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalWithdrawals)}</p>
        </div>
        <div className={`rounded-lg p-4 border ${
          netAdjustments >= 0
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              netAdjustments >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              Net Adjustments
            </span>
            <DollarSign className={`w-4 h-4 ${
              netAdjustments >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            netAdjustments >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {formatCurrency(netAdjustments)}
          </p>
        </div>
      </div>

      {/* Add Adjustment Form */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Capital Adjustment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="deposit">Deposit (Add Capital)</option>
                <option value="withdrawal">Withdrawal (Remove Capital)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600">
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
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes about this adjustment"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {formData.type === 'deposit' ? 'Add Deposit' : 'Record Withdrawal'}
          </button>
        </form>
      </div>

      {/* Adjustments History */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Adjustment History ({adjustments.length})
        </h3>
        {adjustments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg">No capital adjustments yet.</p>
            <p className="text-sm mt-2">Add your first deposit or withdrawal above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Notes</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adjustment) => (
                  <tr
                    key={adjustment.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(adjustment.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          adjustment.type === 'deposit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
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
                      className={`py-3 px-4 text-right font-medium ${
                        adjustment.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {adjustment.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(adjustment.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {adjustment.notes || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(adjustment.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
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



