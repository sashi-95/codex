import { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Eye,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Waves,
  Fish,
  Target,
  Zap,
  AlertTriangle,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp,
  Star,
  Filter,
} from 'lucide-react';

// Firebase Configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
let db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn('Firebase initialization skipped (no valid config):', e.message);
}

// --- Mock Data Generation ---
const generateMockPrice = (base, volatility = 0.02) => {
  const change = (Math.random() - 0.5) * 2 * volatility * base;
  return base + change;
};

const TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin', basePrice: 67500, color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', basePrice: 3450, color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', basePrice: 178, color: '#9945FF' },
  { symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.165, color: '#C3A634' },
  { symbol: 'AVAX', name: 'Avalanche', basePrice: 42.5, color: '#E84142' },
  { symbol: 'MATIC', name: 'Polygon', basePrice: 0.92, color: '#8247E5' },
  { symbol: 'LINK', name: 'Chainlink', basePrice: 18.7, color: '#2A5ADA' },
  { symbol: 'UNI', name: 'Uniswap', basePrice: 12.3, color: '#FF007A' },
];

const generateWhaleTransaction = () => {
  const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
  const isBuy = Math.random() > 0.45;
  const amount = Math.floor(Math.random() * 5000 + 500) * (token.basePrice < 1 ? 100000 : token.basePrice < 100 ? 1000 : 10);
  const value = amount * token.basePrice;
  return {
    id: Date.now() + Math.random(),
    token: token.symbol,
    tokenName: token.name,
    color: token.color,
    type: isBuy ? 'BUY' : 'SELL',
    amount,
    value,
    time: new Date(),
    wallet: `0x${Math.random().toString(16).substr(2, 6)}...${Math.random().toString(16).substr(2, 4)}`,
    exchange: ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit'][Math.floor(Math.random() * 5)],
  };
};

const generateHeatmapData = () => {
  return TOKENS.map(token => ({
    ...token,
    price: generateMockPrice(token.basePrice),
    change24h: (Math.random() - 0.45) * 15,
    volume: Math.floor(Math.random() * 1000000000 + 100000000),
    whaleActivity: Math.floor(Math.random() * 100),
  }));
};

// --- Components ---

function PriceSparkline({ data, color, width = 120, height = 40 }) {
  const points = useMemo(() => {
    if (!data || data.length === 0) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

function WhaleAlert({ transaction, index }) {
  const isBuy = transaction.type === 'BUY';
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 hover:scale-[1.01] ${
        isBuy
          ? 'border-green-800/50 bg-green-950/30 hover:bg-green-950/50'
          : 'border-red-800/50 bg-red-950/30 hover:bg-red-950/50'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${
            isBuy ? 'bg-green-900/50' : 'bg-red-900/50'
          }`}
        >
          {isBuy ? (
            <ArrowUpRight className="w-4 h-4 text-green-400" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className="font-bold text-sm"
              style={{ color: transaction.color }}
            >
              {transaction.token}
            </span>
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                isBuy
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-red-900/50 text-red-400'
              }`}
            >
              {transaction.type}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {transaction.wallet} via {transaction.exchange}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-white">
          ${transaction.value >= 1000000
            ? `${(transaction.value / 1000000).toFixed(2)}M`
            : `${(transaction.value / 1000).toFixed(1)}K`}
        </div>
        <div className="text-xs text-gray-500">
          {transaction.amount.toLocaleString()} {transaction.token}
        </div>
      </div>
    </div>
  );
}

function HeatmapTile({ data }) {
  const intensity = Math.min(Math.abs(data.change24h) / 10, 1);
  const isPositive = data.change24h >= 0;

  return (
    <div
      className="relative p-4 rounded-xl border border-gray-800/50 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:z-10"
      style={{
        backgroundColor: isPositive
          ? `rgba(34, 197, 94, ${intensity * 0.3})`
          : `rgba(239, 68, 68, ${intensity * 0.3})`,
        borderColor: isPositive
          ? `rgba(34, 197, 94, ${intensity * 0.5})`
          : `rgba(239, 68, 68, ${intensity * 0.5})`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-white" style={{ color: data.color }}>
          {data.symbol}
        </span>
        <div className="flex items-center gap-1">
          {data.whaleActivity > 70 ? (
            <Waves className="w-3 h-3 text-blue-400 animate-pulse" />
          ) : null}
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
        </div>
      </div>
      <div className="text-lg font-bold text-white">
        ${data.price.toLocaleString(undefined, { maximumFractionDigits: data.price < 1 ? 4 : 2 })}
      </div>
      <div
        className={`text-sm font-semibold ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {isPositive ? '+' : ''}
        {data.change24h.toFixed(2)}%
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Vol: ${(data.volume / 1000000).toFixed(0)}M
      </div>
      <div className="mt-1 flex items-center gap-1">
        <div className="text-xs text-gray-500">Whale:</div>
        <div className="flex-1 bg-gray-800 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${data.whaleActivity}%`,
              backgroundColor:
                data.whaleActivity > 70
                  ? '#3B82F6'
                  : data.whaleActivity > 40
                  ? '#F59E0B'
                  : '#6B7280',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, trend, color = '#3B82F6' }) {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              trend >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend >= 0 ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subValue && (
        <div className="text-xs text-gray-500 mt-1">{subValue}</div>
      )}
    </div>
  );
}

// --- Main App ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [heatmapData, setHeatmapData] = useState(generateHeatmapData());
  const [priceHistory, setPriceHistory] = useState({});
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [watchlist, setWatchlist] = useState(['BTC', 'ETH', 'SOL']);

  // Initialize price history
  useEffect(() => {
    const history = {};
    TOKENS.forEach(token => {
      history[token.symbol] = Array.from({ length: 30 }, () =>
        generateMockPrice(token.basePrice)
      );
    });
    setPriceHistory(history);
  }, []);

  // Simulate live whale transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const newTx = generateWhaleTransaction();
      setTransactions(prev => [newTx, ...prev].slice(0, 50));

      // Update heatmap
      setHeatmapData(generateHeatmapData());

      // Update price history
      setPriceHistory(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(symbol => {
          const token = TOKENS.find(t => t.symbol === symbol);
          if (token) {
            updated[symbol] = [
              ...updated[symbol].slice(1),
              generateMockPrice(token.basePrice),
            ];
          }
        });
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Save to Firestore (if configured)
  const saveAlert = useCallback(async (tx) => {
    if (!db) return;
    try {
      await addDoc(collection(db, 'whale_alerts'), {
        ...tx,
        time: tx.time.toISOString(),
        savedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not save to Firestore:', e.message);
    }
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch =
        !searchQuery ||
        tx.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.tokenName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterType === 'all' ||
        tx.type.toLowerCase() === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchQuery, filterType]);

  const stats = useMemo(() => {
    const buyTxs = transactions.filter(tx => tx.type === 'BUY');
    const sellTxs = transactions.filter(tx => tx.type === 'SELL');
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.value, 0);
    const buyVolume = buyTxs.reduce((sum, tx) => sum + tx.value, 0);
    const sellVolume = sellTxs.reduce((sum, tx) => sum + tx.value, 0);
    return {
      totalTransactions: transactions.length,
      totalVolume,
      buyVolume,
      sellVolume,
      buyRatio: transactions.length > 0 ? (buyTxs.length / transactions.length) * 100 : 50,
      largestTx: transactions.length > 0 ? Math.max(...transactions.map(tx => tx.value)) : 0,
    };
  }, [transactions]);

  const toggleWatchlist = useCallback((symbol) => {
    setWatchlist(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'whales', label: 'Whale Feed', icon: Waves },
    { id: 'heatmap', label: 'Heatmap', icon: Activity },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Fish className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Whale Hunter
              </h1>
              <span className="text-xs text-gray-600 font-mono ml-1">ROBIN</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 w-48"
              />
            </div>
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                alertsEnabled
                  ? 'bg-blue-900/50 text-blue-400'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Activity}
                label="Total Transactions"
                value={stats.totalTransactions}
                subValue="Tracked in this session"
                color="#3B82F6"
              />
              <StatCard
                icon={BarChart3}
                label="Total Volume"
                value={`$${(stats.totalVolume / 1000000).toFixed(2)}M`}
                subValue="Combined buy + sell"
                trend={stats.buyRatio - 50}
                color="#8B5CF6"
              />
              <StatCard
                icon={TrendingUp}
                label="Buy Pressure"
                value={`${stats.buyRatio.toFixed(1)}%`}
                subValue={`$${(stats.buyVolume / 1000000).toFixed(2)}M`}
                color="#22C55E"
              />
              <StatCard
                icon={Target}
                label="Largest TX"
                value={`$${(stats.largestTx / 1000000).toFixed(2)}M`}
                subValue="Single transaction"
                color="#F59E0B"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Heatmap Preview */}
              <div className="lg:col-span-2">
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Market Overview
                    </h2>
                    <button
                      onClick={() => setHeatmapData(generateHeatmapData())}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {heatmapData.map(data => (
                      <HeatmapTile key={data.symbol} data={data} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Whale Activity */}
              <div>
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Waves className="w-5 h-5 text-blue-400" />
                      Recent Whales
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-gray-400">
                        {transactions.length} tracked
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {filteredTransactions.slice(0, 10).map((tx, i) => (
                      <WhaleAlert key={tx.id} transaction={tx} index={i} />
                    ))}
                    {filteredTransactions.length === 0 && (
                      <div className="text-center py-8 text-gray-600">
                        <Waves className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Waiting for whale activity...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Whale Feed Tab */}
        {activeTab === 'whales' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Waves className="w-5 h-5 text-blue-400" />
                Live Whale Feed
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-blue-900/50 text-blue-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('buy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'buy'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  Buys
                </button>
                <button
                  onClick={() => setFilterType('sell')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'sell'
                      ? 'bg-red-900/50 text-red-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  Sells
                </button>
                <Filter className="w-4 h-4 text-gray-500 ml-2" />
              </div>
            </div>
            <div className="space-y-2">
              {filteredTransactions.map((tx, i) => (
                <WhaleAlert key={tx.id} transaction={tx} index={i} />
              ))}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-16 text-gray-600">
                  <Waves className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No whale transactions yet. Stay tuned...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Token Heatmap
              </h2>
              <button
                onClick={() => setHeatmapData(generateHeatmapData())}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-xs transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {heatmapData.map(data => (
                <HeatmapTile key={data.symbol} data={data} />
              ))}
            </div>

            {/* Price Sparklines */}
            <div className="mt-8">
              <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Price Trends
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TOKENS.map(token => (
                  <div
                    key={token.symbol}
                    className="bg-gray-900/80 border border-gray-800 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm" style={{ color: token.color }}>
                        {token.symbol}
                      </span>
                      <span className="text-xs text-gray-500">{token.name}</span>
                    </div>
                    <PriceSparkline
                      data={priceHistory[token.symbol] || []}
                      color={token.color}
                      width={200}
                      height={50}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Watchlist
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOKENS.map(token => {
                const data = heatmapData.find(d => d.symbol === token.symbol);
                const isWatched = watchlist.includes(token.symbol);
                const recentTxs = transactions.filter(
                  tx => tx.token === token.symbol
                );
                return (
                  <div
                    key={token.symbol}
                    className={`bg-gray-900/80 border rounded-xl p-4 transition-colors ${
                      isWatched ? 'border-yellow-800/50' : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-lg font-bold"
                          style={{ color: token.color }}
                        >
                          {token.symbol}
                        </span>
                        <span className="text-sm text-gray-500">
                          {token.name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleWatchlist(token.symbol)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isWatched
                            ? 'bg-yellow-900/50 text-yellow-400'
                            : 'bg-gray-800 text-gray-600 hover:text-gray-400'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                    {data && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold text-white">
                            ${data.price.toLocaleString(undefined, {
                              maximumFractionDigits: data.price < 1 ? 4 : 2,
                            })}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              data.change24h >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {data.change24h >= 0 ? '+' : ''}
                            {data.change24h.toFixed(2)}%
                          </span>
                        </div>
                        <PriceSparkline
                          data={priceHistory[token.symbol] || []}
                          color={token.color}
                          width={300}
                          height={60}
                        />
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Vol: ${(data.volume / 1000000).toFixed(0)}M
                          </span>
                          <span>
                            Whale TXs: {recentTxs.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {data.whaleActivity}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950/80 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <AlertTriangle className="w-3 h-3" />
            <span>
              Data is simulated for demonstration purposes. Not financial advice.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Whale Hunter Robin v1.0</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>Connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
