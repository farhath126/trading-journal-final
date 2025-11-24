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
        <div className="glass-panel rounded-2xl h-full flex flex-col">
            {/* Header with Tabs */}
            <div className="flex items-center border-b border-white/5">
                <button
                    onClick={() => setActiveTab('open')}
                    className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'open' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Open Positions
                    {activeTab === 'open' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('recent')}
                    className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'recent' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Recent Trades
                    {activeTab === 'recent' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-0 overflow-auto custom-scrollbar">
                <table className="w-full">
                    <thead className="bg-white/5 sticky top-0 backdrop-blur-sm">
                        <tr>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Open Date</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Symbol</th>
                            <th className="text-right py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Net P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {(activeTab === 'recent' ? recentTrades : openPositions).map((trade) => (
                            <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-6 text-sm text-gray-400">
                                    {new Date(trade.entryDate).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-6 text-sm font-medium text-white">
                                    {trade.symbol}
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border ${trade.type === 'long'
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                                        }`}>
                                        {trade.type.toUpperCase()}
                                    </span>
                                </td>
                                <td className={`py-3 px-6 text-sm font-semibold text-right ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {formatCurrency(trade.pnl || 0)}
                                </td>
                            </tr>
                        ))}
                        {(activeTab === 'recent' ? recentTrades : openPositions).length === 0 && (
                            <tr>
                                <td colSpan="3" className="py-8 text-center text-gray-500 text-sm">
                                    No {activeTab === 'recent' ? 'recent trades' : 'open positions'} found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination Mock */}
            <div className="p-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button className="p-1 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-50 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-50 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

export default RecentTradesWidget
