# Trading Journal

A modern, feature-rich trading journal application built with React and Vite. Track your trades, analyze performance, and improve your trading strategy.

## Features

- 📊 **Trade Entry**: Record trades with symbol, type (long/short), entry/exit prices, quantity, dates, and notes
- 📈 **Trade History**: View all your trades in a clean, sortable table
- 📉 **Statistics Dashboard**: Analyze your performance with comprehensive statistics including:
  - Total P/L
  - Win rate
  - Profit factor
  - Average win/loss
  - Best/worst trades
- 💾 **Local Storage**: All data is saved locally in your browser
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Add a Trade**: Click on "Add Trade" tab and fill in the trade details:
   - Symbol (e.g., AAPL, BTC/USD)
   - Type (Long or Short)
   - Entry and Exit prices
   - Quantity
   - Entry and Exit dates
   - Optional notes

2. **View History**: Click on "Trade History" to see all your recorded trades in a table format.

3. **View Statistics**: Click on "Statistics" to see your trading performance metrics.

## Data Storage

All trades are stored in your browser's local storage. This means:
- Your data stays on your device
- No account or login required
- Data persists between sessions
- To clear data, clear your browser's local storage

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## License

Farhath B



