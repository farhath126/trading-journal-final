import { useState } from 'react'
import { Info, ChevronLeft, ChevronRight } from 'lucide-react'

function RecentTradesWidget({ trades = [], settings }) {
    const [activeTab, setActiveTab] = useState('recent') // 'open' or 'recent'

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: settings?.currency || 'USD',
            minimumFractionDigits: 2,
        }).format(value)
    }

    const recentTrades = [...trades]
        .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
        .slice(0, 5)

    // Mock Open Positions (since we don't track open status explicitly yet, assuming all with no exit date are open)
    const openPositions = trades.filter(t => !t.exitDate)

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
            {/* Header with Tabs */}
            <div className="flex items-center border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('open')}
                    className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'open' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Open Positions
                    {activeTab === 'open' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('recent')}
                    className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'recent' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Recent Trades
                    {activeTab === 'recent' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-0 overflow-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Date</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Symbol</th>
                            <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Net P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {(activeTab === 'recent' ? recentTrades : openPositions).map((trade) => (
                            <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-6 text-sm text-slate-600">
                                    {new Date(trade.entryDate).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-6 text-sm font-medium text-slate-800">
                                    {trade.symbol}
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${trade.type === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {trade.type.toUpperCase()}
                                    </span>
                                </td>
                                <td className={`py-3 px-6 text-sm font-semibold text-right ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {formatCurrency(trade.pnl || 0)}
                                </td>
                            </tr>
                        ))}
                        {(activeTab === 'recent' ? recentTrades : openPositions).length === 0 && (
                            <tr>
                                <td colSpan="3" className="py-8 text-center text-slate-400 text-sm">
                                    No {activeTab === 'recent' ? 'recent trades' : 'open positions'} found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination Mock */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-50">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

export default RecentTradesWidget
