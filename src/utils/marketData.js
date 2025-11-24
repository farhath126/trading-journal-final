// Utility to fetch market data
// Supports Binance (Crypto) and Yahoo Finance (Stocks/Forex)

// Helper to fetch Crypto data from Binance
const fetchBinanceData = async (symbol) => {
    try {
        // Clean symbol (remove slash, e.g. BTC/USDT -> BTCUSDT)
        const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        // Try exact symbol first, then append USDT
        const pairsToTry = [cleanSymbol, `${cleanSymbol}USDT`];

        for (const pair of pairsToTry) {
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1d&limit=1000`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data.map(d => ({
                        time: d[0] / 1000,
                        open: parseFloat(d[1]),
                        high: parseFloat(d[2]),
                        low: parseFloat(d[3]),
                        close: parseFloat(d[4]),
                    }));
                }
            }
        }
    } catch (error) {
        console.warn('Binance fetch failed:', error);
    }
    return null;
};

// Helper to fetch Stock/Forex data from Yahoo Finance (via Proxy)
const fetchYahooData = async (symbol) => {
    try {
        // Yahoo symbols often need conversion (e.g. BTC-USD for crypto on Yahoo, but we use Binance for that)
        // For stocks, usually just the ticker (AAPL, TSLA) works.

        // Using allorigins proxy to bypass CORS
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) return null;

        const data = await response.json();
        const result = data?.chart?.result?.[0];

        if (result) {
            const timestamps = result.timestamp;
            const quote = result.indicators.quote[0];

            if (!timestamps || !quote) return null;

            const candles = [];
            for (let i = 0; i < timestamps.length; i++) {
                // Skip incomplete candles
                if (quote.open[i] === null || quote.close[i] === null) continue;

                candles.push({
                    time: timestamps[i],
                    open: quote.open[i],
                    high: quote.high[i],
                    low: quote.low[i],
                    close: quote.close[i],
                });
            }
            return candles;
        }
    } catch (error) {
        console.warn('Yahoo fetch failed:', error);
    }
    return null;
};

export const fetchCandleData = async (symbol) => {
    if (!symbol) return [];

    // 1. Try Binance (Best for Crypto)
    const binanceData = await fetchBinanceData(symbol);
    if (binanceData) return binanceData;

    // 2. Try Yahoo Finance (Best for Stocks/Forex)
    const yahooData = await fetchYahooData(symbol);
    if (yahooData) return yahooData;

    console.error(`No data found for ${symbol} on Binance or Yahoo`);
    return [];
};
