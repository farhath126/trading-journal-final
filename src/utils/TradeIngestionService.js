import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

/**
 * Trade Ingestion Service
 * Handles parsing, normalization, and validation of trade data from various brokers.
 */

// Keyword mappings for column detection
const KEYWORDS = {
    symbol: ['symbol', 'instrument', 'script', 'ticker', 'scrip', 'description', 'stock', 'contract', 'tradingsymbol', 'item', 'security', 'name'],
    type: ['type', 'direction', 'transaction', 'action', 'buy/sell', 'side', 'nature', 'product'],
    quantity: ['quantity', 'qty', 'volume', 'size', 'net qty', 'quantity(number)'],
    price: ['price', 'rate', 'avg', 'average', 'avg. price', 'fill price', 'trade price'], // Generic price (for fills)
    entryPrice: ['entry price', 'buy avg', 'buy average', 'avg buy', 'buy rate', 'purchase price', 'buy price', 'average cost', 'buy avg pr'],
    exitPrice: ['exit price', 'sell avg', 'sell average', 'avg sell', 'sell rate', 'sale price', 'sell price', 'current val', 'sell avg pr'],
    date: ['date', 'time', 'trade date', 'order date', 'timestamp', 'txn date', 'datetime'], // Generic date
    entryDate: ['entry date', 'open date', 'buy date'],
    exitDate: ['exit date', 'close date', 'sell date'],
    pnl: ['p/l', 'pnl', 'profit', 'loss', 'net p&l', 'unrealized', 'realized', 'net profit', 'realised', 'p&l'],
    strategy: ['strategy', 'setup', 'system', 'method'], // Optional
    tags: ['tags', 'labels'], // Optional
};

export class TradeIngestionService {

    /**
     * Main entry point: Ingests a CSV file string and returns normalized trades.
     * @param {File|string} fileOrContent 
     * @returns {Promise<{trades: Array, errors: Array}>}
     */
    static async ingest(fileOrContent) {
        let content = fileOrContent;

        if (typeof fileOrContent !== 'string') {
            content = await this.readFile(fileOrContent);
        }

        // 1. Parse without headers initially to find the structure
        const { data } = Papa.parse(content, {
            header: false,
            skipEmptyLines: true,
            dynamicTyping: false
        });

        if (data.length === 0) {
            throw new Error("CSV is empty");
        }

        // 2. Find the Header Row (Scan first 20 lines)
        let headerRowIndex = -1;
        let maxMatches = 0;

        const allKeywords = Object.values(KEYWORDS).flat();

        console.group('CSV Ingestion Debug');

        for (let i = 0; i < Math.min(data.length, 20); i++) {
            const row = data[i].map(c => String(c || '').toLowerCase().trim());
            let matches = 0;
            row.forEach(cell => {
                if (allKeywords.some(k => cell.includes(k))) matches++;
            });

            // Simple heuristic: If we match at least 2 known columns, it's a candidate
            if (matches > maxMatches && matches >= 1) { // Relaxed to 1 for basic CSVs
                maxMatches = matches;
                headerRowIndex = i;
            }
        }

        console.log(`Header detection: Selected row ${headerRowIndex} with ${maxMatches} matches`);

        if (headerRowIndex === -1) {
            console.warn("No clear header row found. Defaulting to row 0.");
            headerRowIndex = 0;
        }

        // 3. Extract Headers and Data
        const headers = data[headerRowIndex].map(h => String(h || '').trim().toLowerCase());
        console.log("Headers found:", headers);

        const rawRows = data.slice(headerRowIndex + 1);

        // Convert to Objects for processing
        const objectRows = rawRows.map(row => {
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = row[i];
            });
            return obj;
        });

        const columnMap = this.mapColumns(headers);
        console.log("Column Mapping:", columnMap);

        if (!columnMap.symbol) {
            console.error("CRITICAL: 'Symbol' column not identified.");
            alert("Could not identify a Symbol/Stock Name column. Please check your CSV info.");
        }

        // Determine Mode
        const isSummary = (columnMap.entryPrice && columnMap.exitPrice) || (columnMap.pnl && !columnMap.date);
        console.log(`Mode Detection: ${isSummary ? 'Summary (P&L)' : 'Fills (Tradebook)'}`);


        let trades = [];
        let errors = [];

        try {
            if (isSummary) {
                ({ trades, errors } = this.processSummaryMode(objectRows, columnMap));
            } else {
                ({ trades, errors } = this.processFillsMode(objectRows, columnMap));
            }
        } catch (err) {
            errors.push(`Critical Processing Error: ${err.message}`);
        }

        // Final Validation & Cleanup
        const finalTrades = trades.filter(t => {
            const issues = this.validateTrade(t);
            if (issues.length > 0) {
                console.warn(`Validation skipped trade ${t.symbol}:`, issues);
                errors.push(`Dropped Trade ${t.symbol}: ${issues.join(', ')}`);
                return false;
            }
            return true;
        });

        console.log(`Ingestion Complete. Raw: ${trades.length}, Final: ${finalTrades.length}, Errors: ${errors.length}`);
        console.groupEnd();

        return { trades: finalTrades, errors };
    }

    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * Maps CSV headers to internal keys using keyword matching.
     */
    static mapColumns(headers) {
        const map = {};
        console.log("Attempting to map columns from headers:", headers);

        const findCol = (keys) => {
            for (const key of keys) {
                const exact = headers.find(h => h === key);
                if (exact) {
                    console.debug(`  Found exact match for '${key}': ${exact}`);
                    return exact;
                }
                const partial = headers.find(h => h.includes(key));
                if (partial) {
                    console.debug(`  Found partial match for '${key}': ${partial}`);
                    return partial;
                }
            }
            return null;
        };

        map.symbol = findCol(KEYWORDS.symbol);
        map.type = findCol(KEYWORDS.type);
        map.quantity = findCol(KEYWORDS.quantity);

        map.entryPrice = findCol(KEYWORDS.entryPrice);
        map.exitPrice = findCol(KEYWORDS.exitPrice);
        map.entryDate = findCol(KEYWORDS.entryDate) || findCol(KEYWORDS.date);
        map.exitDate = findCol(KEYWORDS.exitDate) || (map.entryDate ? map.entryDate : findCol(KEYWORDS.date));

        if (!map.entryPrice && !map.exitPrice) {
            map.price = findCol(KEYWORDS.price);
            map.date = findCol(KEYWORDS.date);
        }

        map.pnl = findCol(KEYWORDS.pnl);
        map.strategy = findCol(KEYWORDS.strategy);
        map.tags = findCol(KEYWORDS.tags);

        console.log("Finished column mapping:", map);
        return map;
    }

    /**
     * Process "Closed Positions" or "P&L Report" style CSVs.
     * Row = Completed Trade.
     */
    static processSummaryMode(data, map) {
        const trades = [];
        const errors = [];
        console.log(`Processing ${data.length} rows in Summary Mode.`);

        data.forEach((row, idx) => {
            try {
                const raw = (field) => row[map[field]];

                if (!raw('symbol')) {
                    // Only log if it's not a completely empty row
                    if (Object.values(row).some(v => v)) console.log(`Row ${idx}: Skipping due to missing symbol`, row);
                    return;
                }

                const quantity = this.parseNumber(raw('quantity'));
                const entryPrice = this.parseNumber(raw('entryPrice'));
                const exitPrice = this.parseNumber(raw('exitPrice'));

                const rawPnl = raw('pnl');
                let pnl = this.parseNumber(rawPnl);

                // Auto-fix: If Quantity, Entry, Exit exist but PNL missing, calc it.
                // If Entry missing but PNL exists, we can't fully reconstruct but we can store PNL.

                if (!quantity && !pnl && !rawPnl) {
                    console.log(`Row ${idx}: Skipping due to missing quantity and PNL`, row);
                    return; // Likely garbage row
                }

                let type = 'Long';
                const typeStr = raw('type') ? raw('type').toLowerCase() : '';
                if (typeStr.includes('short') || typeStr.includes('pe') || typeStr.includes('put')) {
                    if (entryPrice > exitPrice && pnl > 0) type = 'Short';
                }

                // Calculate PnL if missing OR if it's 0 but the prices indicate otherwise
                const priceDiff = Math.abs(exitPrice - entryPrice);
                const calcPnlAbs = priceDiff * quantity;

                if (!rawPnl || (pnl === 0 && calcPnlAbs > 1)) {
                    pnl = (exitPrice - entryPrice) * quantity;
                    if (type === 'Short') pnl = (entryPrice - exitPrice) * quantity;
                }

                if (!typeStr) {
                    const longPnL = (exitPrice - entryPrice) * quantity;
                    const shortPnL = (entryPrice - exitPrice) * quantity;
                    // Fuzzy match (within 0.5 tolerance)
                    if (Math.abs(pnl - shortPnL) < 0.5) {
                        type = 'Short';
                    } else if (Math.abs(pnl - longPnL) < 0.5) {
                        type = 'Long';
                    }
                    // Default to Long if it matches neither or both roughly (standard for Options Buying)
                }

                const entryDate = this.parseDate(raw('entryDate'));
                const exitDate = this.parseDate(raw('exitDate')) || entryDate;
                const inferredTags = this.inferTags(raw('symbol'), entryDate, exitDate);

                trades.push({
                    id: uuidv4(),
                    symbol: this.cleanSymbol(raw('symbol')),
                    type: type,
                    entryPrice: entryPrice,
                    exitPrice: exitPrice,
                    quantity: Math.abs(quantity),
                    entryDate: entryDate.toISOString(),
                    exitDate: exitDate.toISOString(),
                    strategy: '',
                    tags: inferredTags,
                    conviction: '',
                    pnl: pnl,
                    pnlPercent: entryPrice > 0 ? ((pnl / (entryPrice * quantity)) * 100).toFixed(2) : 0,
                    notes: '',
                    urls: [],
                    createdAt: new Date().toISOString()
                });

            } catch (err) {
                errors.push(`Row ${idx + 1}: ${err.message}`);
            }
        });

        return { trades, errors };
    }

    /**
     * Process "Tradebook" / "Order History" style CSVs.
     * Matches buy/sell fills to create trades.
     * FIFO Logic.
     */
    static processFillsMode(data, map) {
        const fills = [];
        const errors = [];

        // 1. Normalize Fills
        data.forEach((row, idx) => {
            try {
                const raw = (field) => row[map[field]];
                if (!raw('symbol')) return;

                const date = this.parseDate(raw('date'));
                const price = this.parseNumber(raw('price'));
                const qty = this.parseNumber(raw('quantity'));

                let type = 'Buy';
                const typeRaw = raw('type') ? raw('type').toLowerCase() : '';
                if (typeRaw.includes('sell') || typeRaw.includes('short')) type = 'Sell';

                fills.push({
                    symbol: this.cleanSymbol(raw('symbol')),
                    date: date,
                    timestamp: date.getTime(),
                    type: type, // 'Buy' or 'Sell'
                    price: price,
                    quantity: Math.abs(qty),
                    originalRow: idx
                });
            } catch (err) {
                errors.push(`Row ${idx + 1}: ${err.message}`);
            }
        });

        // 2. Sort by Time
        fills.sort((a, b) => a.timestamp - b.timestamp);

        // 3. FIFO Matcher
        const trades = [];
        const positionMap = {}; // symbol -> { buys: [], sells: [] }

        fills.forEach(fill => {
            if (!positionMap[fill.symbol]) positionMap[fill.symbol] = { buys: [], sells: [] };
            const bucket = positionMap[fill.symbol];

            let matchBucket = fill.type === 'Buy' ? bucket.sells : bucket.buys;
            let openQty = fill.quantity;

            while (openQty > 0 && matchBucket.length > 0) {
                const match = matchBucket[0]; // FIFO
                const matchedQty = Math.min(openQty, match.quantity);

                // Create Trade
                const isLong = match.type === 'Buy';
                const entry = match;
                const exit = fill;

                const pnl = isLong
                    ? (exit.price - entry.price) * matchedQty
                    : (entry.price - exit.price) * matchedQty;

                trades.push({
                    id: uuidv4(),
                    symbol: fill.symbol,
                    type: isLong ? 'Long' : 'Short',
                    entryPrice: entry.price,
                    exitPrice: exit.price,
                    quantity: matchedQty,
                    entryDate: entry.date.toISOString(),
                    exitDate: exit.date.toISOString(),
                    strategy: '',
                    tags: this.inferTags(fill.symbol, entry.date, exit.date),
                    conviction: '',
                    pnl: pnl,
                    pnlPercent: (pnl / (entry.price * matchedQty) * 100).toFixed(2),
                    notes: 'Auto-matched fill',
                    urls: [],
                    createdAt: new Date().toISOString()
                });

                openQty -= matchedQty;
                match.quantity -= matchedQty;

                if (match.quantity <= 0.0001) {
                    matchBucket.shift(); // Remove exhausted fill
                }
            }

            // If quantity remains, add to own bucket (Open Position)
            if (openQty > 0) {
                const myBucket = fill.type === 'Buy' ? bucket.buys : bucket.sells;
                fill.quantity = openQty;
                myBucket.push(fill);
            }
        });

        return { trades, errors };
    }

    // --- Helpers ---

    static parseNumber(val) {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const clean = val.replace(/,/g, '').replace(/[₹$€]/g, '').trim();
        return parseFloat(clean);
    }

    static parseDate(val) {
        if (!val) return new Date();
        let d = new Date(val);
        if (!isNaN(d.getTime())) return d;

        // Try DD-MM-YYYY
        const parts = val.split(/[/-]/);
        if (parts.length === 3) {
            if (parseInt(parts[0]) > 12) {
                d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
                d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
        }

        if (!isNaN(d.getTime())) return d;
        return new Date();
    }

    static cleanSymbol(sym) {
        if (!sym) return 'Unknown';
        return sym.trim().toUpperCase();
    }

    static inferTags(symbol, entryDate, exitDate) {
        const tags = [];
        const sym = symbol ? symbol.toUpperCase() : '';

        // Asset Class
        if (sym.includes('NIFTY') || sym.includes('BANKNIFTY')) {
            if (sym.match(/\d{2}[A-Z]{3}\d+/) || sym.includes(' CE ') || sym.includes(' PE ') || sym.includes(' CALL ') || sym.includes(' PUT ')) {
                tags.push('Options');

                if (sym.includes(' CE ') || sym.includes(' CALL')) tags.push('Call');
                if (sym.includes(' PE ') || sym.includes(' PUT')) tags.push('Put');
            }
            else tags.push('Index');
        } else {
            tags.push('Equity');
        }

        // Duration
        const isIntraday = entryDate.toDateString() === exitDate.toDateString();
        tags.push(isIntraday ? 'Intraday' : 'Swing');

        return tags;
    }

    static validateTrade(trade) {
        const issues = [];
        if (trade.entryPrice <= 0) issues.push('Invalid Entry Price');
        if (trade.exitPrice <= 0 && trade.type !== 'Open') issues.push('Invalid Exit Price');
        if (trade.quantity <= 0) issues.push('Invalid Quantity');
        return issues;
    }
}
