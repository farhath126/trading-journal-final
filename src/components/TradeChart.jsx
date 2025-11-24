import { useEffect, useRef, useState, memo } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { fetchCandleData } from '../utils/marketData';

function TradeChart({ symbol, entryPrice, exitPrice, type = 'long' }) {
    const chartContainerRef = useRef();
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    // Refs to track price lines so we can remove them
    const entryLineRef = useRef(null);
    const exitLineRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Initialize Chart & Series (Run ONCE)
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create Chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9ca3af', // gray-400
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            grid: {
                vertLines: { color: '#1f2937' }, // gray-800
                horzLines: { color: '#1f2937' },
            },
            rightPriceScale: {
                borderColor: '#374151', // gray-700
            },
            timeScale: {
                borderColor: '#374151',
            },
        });

        // Create Series ONCE using v5 API
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', // green-500
            downColor: '#ef4444', // red-500
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    // 2. Fetch Data (Run when symbol changes)
    useEffect(() => {
        const loadData = async () => {
            if (!symbol) return;

            // Safety check: ensure chart is initialized
            if (!chartRef.current || !seriesRef.current) return;

            setLoading(true);
            setError(null);

            try {
                const data = await fetchCandleData(symbol);

                // Check if component is still mounted
                if (!chartRef.current || !seriesRef.current) return;

                if (data.length > 0) {
                    seriesRef.current.setData(data);
                    chartRef.current.timeScale().fitContent();
                } else {
                    setError('No data found (Crypto only)');
                    seriesRef.current.setData([]);
                }
            } catch (err) {
                console.error("Chart data error:", err);
                setError('Error loading chart data');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(loadData, 500);
        return () => clearTimeout(timeoutId);
    }, [symbol]);

    // 3. Update Markers (Run when prices/type change)
    useEffect(() => {
        if (!seriesRef.current) return;

        // Remove old lines
        if (entryLineRef.current) {
            seriesRef.current.removePriceLine(entryLineRef.current);
            entryLineRef.current = null;
        }
        if (exitLineRef.current) {
            seriesRef.current.removePriceLine(exitLineRef.current);
            exitLineRef.current = null;
        }

        // Add new lines
        if (entryPrice) {
            entryLineRef.current = seriesRef.current.createPriceLine({
                price: parseFloat(entryPrice),
                color: '#3b82f6', // blue-500
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'ENTRY',
            });
        }

        if (exitPrice) {
            const isWin = type === 'long'
                ? parseFloat(exitPrice) > parseFloat(entryPrice)
                : parseFloat(exitPrice) < parseFloat(entryPrice);

            exitLineRef.current = seriesRef.current.createPriceLine({
                price: parseFloat(exitPrice),
                color: isWin ? '#10b981' : '#ef4444', // green-500 : red-500
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'EXIT',
            });
        }

    }, [entryPrice, exitPrice, type]);

    return (
        <div className="relative w-full h-full">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            )}
            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    );
}

export default memo(TradeChart);
