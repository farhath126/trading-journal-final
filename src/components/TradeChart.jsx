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
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            grid: {
                vertLines: { color: '#f0f3fa' },
                horzLines: { color: '#f0f3fa' },
            },
            rightPriceScale: {
                borderColor: '#d1d4dc',
            },
            timeScale: {
                borderColor: '#d1d4dc',
            },
        });

        // Create Series ONCE using v5 API
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
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
                color: '#2962FF',
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
                color: isWin ? '#00E676' : '#FF1744',
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
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <p className="text-red-500 font-medium">{error}</p>
                </div>
            )}
            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    );
}

export default memo(TradeChart);
