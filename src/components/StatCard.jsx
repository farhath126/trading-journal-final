import { Info } from 'lucide-react'

function StatCard({ title, value, type = 'simple', data = {}, subValue, subLabel }) {
    // Helper for Gauge Chart (Profit Factor)
    const renderGauge = (val) => {
        // Normalize value: 0 to 3+
        const normalized = Math.min(Math.max(val, 0), 3) / 3
        const circumference = 50 * Math.PI // r=25
        const strokeDasharray = `${circumference} ${circumference}`
        const strokeDashoffset = circumference - (normalized * circumference) / 2 // Half circle

        return (
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                    {/* Background Arc */}
                    <circle
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="6"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={circumference / 2}
                        strokeLinecap="round"
                    />
                    {/* Value Arc */}
                    <circle
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        stroke={val >= 1 ? "#10b981" : "#ef4444"}
                        strokeWidth="6"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={circumference - (normalized * circumference) / 2}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
            </div>
        )
    }

    // Helper for Donut Chart (Win %)
    const renderDonut = (percent) => {
        const circumference = 2 * Math.PI * 20 // r=20
        const strokeDasharray = `${circumference} ${circumference}`
        const strokeDashoffset = circumference - (percent / 100) * circumference

        return (
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="5"
                    />
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="5"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
            </div>
        )
    }

    // Helper for Bar Comparison (Avg Win/Loss)
    const renderBarComparison = (win, loss) => {
        const total = win + loss || 1
        const winWidth = (win / total) * 100
        const lossWidth = (loss / total) * 100

        return (
            <div className="w-24 flex flex-col gap-1">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${winWidth}%` }} className="h-full bg-green-500" />
                    <div style={{ width: `${lossWidth}%` }} className="h-full bg-red-500" />
                </div>
                <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-green-600">${win.toFixed(0)}</span>
                    <span className="text-red-600">${loss.toFixed(0)}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {title}
                    <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                </div>
                {type === 'simple' && (
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                        {data.icon}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-bold text-slate-800 tracking-tight">
                        {value}
                    </div>
                    {subValue && (
                        <div className="text-xs font-medium text-slate-400 mt-1">
                            {subLabel}: <span className={data.subColor}>{subValue}</span>
                        </div>
                    )}
                </div>

                {type === 'gauge' && renderGauge(data.value)}
                {type === 'donut' && renderDonut(data.value)}
                {type === 'bar' && renderBarComparison(data.win, data.loss)}
            </div>
        </div>
    )
}

export default StatCard
