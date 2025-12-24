<div align="center">
<img src="banner.png" alt="Midnight Market Banner" width="800"/>
</div>

# Midnight Market

A modern cryptocurrency market dashboard featuring real-time data, interactive charts, and AI-powered insights. Track blue-chip cryptocurrencies and memecoins across multiple blockchains with comprehensive market analysis tools.
//YOU NEED GEMINI API KEY for chatbot features//

## Features

- **Real-time Market Data**: Live cryptocurrency prices and market metrics
- **Multi-blockchain Support**: Track assets on Solana, Ethereum, Base, and BSC
- **Interactive Charts**: Detailed price history with multiple timeframes
- **Market Modes**: Switch between blue-chip cryptocurrencies and memecoins
- **AI-Powered Insights**: Chat assistant for market analysis and information
- **News Feed**: Latest cryptocurrency news and updates
- **Responsive Design**: Modern UI with dark/light theme support
- **Advanced Filtering**: Sort by market cap, price change, volume, and more

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Charts**: Recharts for data visualization
- **AI Integration**: Google Gemini API
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Google Gemini API key

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd midnight-market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

## Build for Production

```bash
npm run build
```

## Development

The application refreshes automatically when you make changes to the source code. The development server runs on port 5173 by default.
