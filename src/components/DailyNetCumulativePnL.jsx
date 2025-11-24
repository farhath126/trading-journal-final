import { Info } from 'lucide-react'

function DailyNetCumulativePnL({ data = [] }) {
    const renderAreaChart = () => {
        if (data.length === 0) return null

        const height = 200
        const width = 500
        const padding = 20

        // Find min/max for scaling
        const maxVal = Math.max(...data.map(d => d.cumulativePnl), 100)
        const minVal = Math.min(...data.map(d => d.cumulativePnl), -100)
        const range = maxVal - minVal

        // X-axis scale
        const scaleX = (width - padding * 2) / (data.length - 1 || 1)

        // Y-axis scale (invert Y because SVG 0 is top)
        const scaleY = (height - padding * 2) / range

        const points = data.map((d, i) => {
            const x = padding + i * scaleX
            const y = padding + (maxVal - d.cumulativePnl) * scaleY
            return `${x},${y}`
        }).join(' ')

        // Create area path (close the loop to the zero line or bottom)
        const zeroY = padding + maxVal * scaleY
        const areaPath = `${points} L ${padding + (data.length - 1) * scaleX},${zeroY} L ${padding},${zeroY} Z`

        return (
            <div className="w-full h-64 overflow-hidden">
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                >
                    {/* Zero Line */}
                    <line
                        x1={padding}
                        y1={zeroY}
                        x2={width - padding}
                        y2={zeroY}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />

                    {/* Area Fill */}
                    <defs>
                        <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={areaPath}
                        fill="url(#cumulativeGradient)"
                    />

                    {/* Line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data Points (optional, maybe just on hover in future) */}
                    {data.length < 20 && data.map((d, i) => {
                        const x = padding + i * scaleX
                        const y = padding + (maxVal - d.cumulativePnl) * scaleY
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#10b981"
                                stroke="#030712"
                                strokeWidth="1.5"
                            >
                                <title>{`${d.date}: $${d.cumulativePnl}`}</title>
                            </circle>
                        )
                    })}
                </svg>
            </div>
        )
    }

    return (
        <div className="glass-panel rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-300">
                    Daily Net Cumulative P&L
                    <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 transition-colors cursor-help" />
                </div>
            </div>

            {data.length > 0 ? (
                renderAreaChart()
            ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                    No data available
                </div>
            )}

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-2">
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

export default DailyNetCumulativePnL
