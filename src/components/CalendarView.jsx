import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function CalendarView({ trades, settings }) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: settings?.currency || 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        return { days, firstDay }
    }

    const dailyStats = useMemo(() => {
        const stats = {}
        trades.forEach(trade => {
            const date = new Date(trade.exitDate || trade.entryDate || trade.createdAt)
            const dateKey = date.toISOString().split('T')[0]

            if (!stats[dateKey]) {
                stats[dateKey] = { pnl: 0, count: 0, wins: 0, losses: 0 }
            }

            stats[dateKey].pnl += trade.pnl || 0
            stats[dateKey].count += 1
            if ((trade.pnl || 0) > 0) stats[dateKey].wins += 1
            else if ((trade.pnl || 0) < 0) stats[dateKey].losses += 1
        })
        return stats
    }, [trades])

    const { days, firstDay } = getDaysInMonth(currentDate)
    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    const year = currentDate.getFullYear()

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const renderCalendarDays = () => {
        const calendarDays = []

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-white/5 border border-white/5"></div>)
        }

        // Days of the month
        for (let day = 1; day <= days; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dateKey = date.toISOString().split('T')[0]
            const stats = dailyStats[dateKey]
            const isToday = new Date().toISOString().split('T')[0] === dateKey

            calendarDays.push(
                <div
                    key={day}
                    className={`h-24 border border-white/5 p-2 relative group transition-all ${stats
                        ? stats.pnl > 0
                            ? 'bg-green-500/10 hover:bg-green-500/20'
                            : stats.pnl < 0
                                ? 'bg-red-500/10 hover:bg-red-500/20'
                                : 'bg-white/5 hover:bg-white/10'
                        : 'bg-transparent hover:bg-white/5'
                        } ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                >
                    <span className={`text-sm font-medium ${isToday ? 'text-blue-400' : 'text-gray-500'
                        }`}>
                        {day}
                    </span>

                    {stats && (
                        <div className="mt-1">
                            <div className={`text-sm font-bold ${stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {formatCurrency(stats.pnl)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {stats.count} trade{stats.count !== 1 ? 's' : ''}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-black/90 backdrop-blur-md border border-white/10 text-white text-xs rounded-xl p-3 shadow-2xl animate-fade-in">
                                <div className="font-semibold mb-1 border-b border-white/10 pb-1 text-gray-300">
                                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Net P/L:</span>
                                        <span className={stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {formatCurrency(stats.pnl)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Trades:</span>
                                        <span className="text-white">{stats.count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Win Rate:</span>
                                        <span className="text-blue-400">{Math.round((stats.wins / stats.count) * 100)}%</span>
                                    </div>
                                </div>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                            </div>
                        </div>
                    )}
                </div>
            )
        }

        return calendarDays
    }

    return (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                    Performance Calendar
                </h3>
                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                    <span className="font-medium text-gray-300 min-w-[140px] text-center">
                        {monthName} {year}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 bg-black/20 gap-px border-b border-white/10">
                {renderCalendarDays()}
            </div>

            <div className="p-4 bg-white/5 flex items-center justify-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded"></div>
                    <span>Profitable Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
                    <span>Loss Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white/5 border border-white/10 rounded"></div>
                    <span>No Trades</span>
                </div>
            </div>
        </div>
    )
}

// Helper icon component
const CalendarIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
)

export default CalendarView
