import { Info } from 'lucide-react'

function TradeScore({ score = 0, metrics = {} }) {
    // Radar Chart Logic
    const renderRadarChart = () => {
        const size = 200
        const center = size / 2
        const radius = 70

        // 3 axes: Win %, Profit Factor, Avg Win/Loss
        // Angles: 0 (top), 120 (bottom right), 240 (bottom left)
        const points = [
            { angle: -90, value: metrics.winRate / 100 }, // Top
            { angle: 30, value: Math.min(metrics.profitFactor / 3, 1) }, // Bottom Right
            { angle: 150, value: Math.min(metrics.avgWin / (metrics.avgLoss || 1) / 3, 1) } // Bottom Left
        ]

        const getCoordinates = (angle, value) => {
            const x = center + radius * value * Math.cos((angle * Math.PI) / 180)
            const y = center + radius * value * Math.sin((angle * Math.PI) / 180)
            return `${x},${y}`
        }

        const polyPoints = points.map(p => getCoordinates(p.angle, p.value)).join(' ')
        const bgPoints = points.map(p => getCoordinates(p.angle, 1)).join(' ')

        return (
            <div className="relative w-full h-48 flex items-center justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background Triangle */}
                    <polygon
                        points={bgPoints}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                    />
                    {/* Axes */}
                    {points.map((p, i) => {
                        const coords = getCoordinates(p.angle, 1)
                        return (
                            <line
                                key={i}
                                x1={center}
                                y1={center}
                                x2={coords.split(',')[0]}
                                y2={coords.split(',')[1]}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                            />
                        )
                    })}

                    {/* Data Polygon */}
                    <polygon
                        points={polyPoints}
                        fill="rgba(139, 92, 246, 0.2)" // Purple-500 with opacity
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {points.map((p, i) => {
                        const [x, y] = getCoordinates(p.angle, p.value).split(',')
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#8b5cf6"
                                stroke="white"
                                strokeWidth="1.5"
                            />
                        )
                    })}
                </svg>

                {/* Labels */}
                <div className="absolute top-2 text-[10px] font-medium text-slate-400">Win %</div>
                <div className="absolute bottom-8 right-8 text-[10px] font-medium text-slate-400">Profit factor</div>
                <div className="absolute bottom-8 left-8 text-[10px] font-medium text-slate-400">Avg win/loss</div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm h-full">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-4">
                Trade Score
                <Info className="w-4 h-4 text-slate-300" />
            </div>

            {renderRadarChart()}

            <div className="text-center mt-2">
                <div className="text-sm text-slate-500 mb-1">Your Trade Score:</div>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-slate-800">{score}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        +1
                    </span>
                </div>
            </div>
        </div>
    )
}

export default TradeScore
