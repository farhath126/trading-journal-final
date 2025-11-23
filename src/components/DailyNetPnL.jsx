import { Info } from 'lucide-react'

function DailyNetPnL({ data = [] }) {
    const renderBarChart = () => {
        if (data.length === 0) return null

        const height = 200
        const width = 500 // Viewbox width
        const padding = 20
        const barWidth = 12
        const gap = 8

        // Find min/max for scaling
        const maxVal = Math.max(...data.map(d => Math.abs(d.pnl)), 100)
        const scaleY = (height - padding * 2) / (maxVal * 2) // *2 because we have positive and negative
        const zeroY = height / 2

        return (
            <div className="w-full h-64 overflow-x-auto">
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${Math.max(width, data.length * (barWidth + gap))} ${height}`}
                    preserveAspectRatio="none"
                >
                    {/* Zero Line */}
                    <line
                        x1="0"
                        y1={zeroY}
                        x2="100%"
                        y2={zeroY}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />

                    {/* Bars */}
                    {data.map((d, i) => {
                        const barHeight = Math.abs(d.pnl) * scaleY
                        const x = i * (barWidth + gap) + padding
                        const y = d.pnl >= 0 ? zeroY - barHeight : zeroY
                        const color = d.pnl >= 0 ? '#10b981' : '#ef4444' // Green-500 : Red-500

                        return (
                            <g key={i} className="group">
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight || 1} // Min height 1px
                                    fill={color}
                                    rx="2"
                                    className="transition-all duration-300 hover:opacity-80"
                                />
                                {/* Tooltip (Simple SVG title for now) */}
                                <title>{`${d.date}: $${d.pnl}`}</title>
                            </g>
                        )
                    })}
                </svg>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    Net Daily P&L
                    <Info className="w-4 h-4 text-slate-300" />
                </div>
            </div>

            {data.length > 0 ? (
                renderBarChart()
            ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                    No data available
                </div>
            )}

            {/* X-Axis Labels (Simplified) */}
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-2">
                {data.length > 0 && (
                    <>
                        <span>{data[0]?.date}</span>
                        <span>{data[Math.floor(data.length / 2)]?.date}</span>
                        <span>{data[data.length - 1]?.date}</span>
                    </>
                )}
            </div>
        </div>
    )
}

export default DailyNetPnL
