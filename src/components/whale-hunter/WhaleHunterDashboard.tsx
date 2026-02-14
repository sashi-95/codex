'use client';

import React, { useState, useEffect } from 'react';
import {
  signInAnonymously,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Check,
  Lock,
  Unlock,
  Menu,
  BrainCircuit,
  Eye,
  Home,
  MapPin,
  Plane,
  BookOpen,
  Layers,
  Copy,
  AlertCircle,
  ShieldCheck,
  Building,
  ScrollText,
  DollarSign,
  Sun,
  Waves,
  Flame,
  Calendar,
  Users,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Info,
  Sparkles,
  Crown,
  BarChart3,
  Bitcoin,
  Map as MapIcon,
  PieChart,
  Globe,
  Droplets,
  Hammer,
  Mountain,
  Component,
  Factory,
  Anchor,
  Pickaxe,
  Gem,
  Atom,
  Newspaper,
  Loader2,
  RefreshCw,
  Wallet,
  Thermometer,
  Briefcase,
  Crosshair,
  Scan,
  Radar,
} from 'lucide-react';

// Siren is not available in lucide-react 0.344 — use AlertCircle as fallback
const Siren = AlertCircle;

// --- Constants ---
const COLORS = {
  green: '#00c805',
  red: '#ff5000',
  gold: '#D4AF37',
  blue: '#007AFF',
  rare: '#A855F7',
  bg: '#000000',
  surface: '#1e2124',
  border: '#30363a',
};

const TICKER_DATA = [
  { symbol: 'NQ1!', price: '18,245.20', change: '+1.25%', up: true },
  { symbol: 'ES1!', price: '5,123.50', change: '-0.32%', up: false },
  { symbol: 'BTC', price: '$68,450', change: '+2.40%', up: true },
  { symbol: 'ETH', price: '$3,850', change: '-0.50%', up: false },
  { symbol: 'XAU', price: '$2,034.10', change: '+0.15%', up: true },
  { symbol: 'XAG', price: '$23.12', change: '-0.05%', up: false },
  { symbol: 'WTI', price: '$78.40', change: '+1.20%', up: true },
  { symbol: 'NG', price: '$1.85', change: '-2.30%', up: false },
];

const PROP_ACCOUNTS = [
  { id: 1, name: 'Topstep 150K #1', status: 'Active', equity: '$153,240', buffer: '$3,240', passed: true },
  { id: 2, name: 'Topstep 150K #2', status: 'Active', equity: '$153,240', buffer: '$3,240', passed: true },
  { id: 3, name: 'Apex 50K #1', status: 'Risk', equity: '$50,400', buffer: '$400', passed: true },
  { id: 4, name: 'Apex 50K #2', status: 'Risk', equity: '$50,400', buffer: '$400', passed: true },
];

const MINING_SITES = [
  { id: 1, name: 'Minamitorishima', country: 'JAPAN', x: 86, y: 45, reserves: '16M Tons', type: 'Deep Sea Mud', status: 'Strategic Reserve', strategic: 'Critical', color: '#00c805', depth: '6,000m', concentration: 'High (REY)' },
  { id: 2, name: 'Bayan Obo', country: 'CHINA', x: 74, y: 32, reserves: '48M Tons', type: 'Carbonatite', status: 'Active Dominant', strategic: 'High Risk', color: '#ff5000', depth: 'Surface', concentration: 'Med-High' },
  { id: 3, name: 'Mountain Pass', country: 'USA', x: 18, y: 35, reserves: '1.5M Tons', type: 'Bastnaesite', status: 'Active', strategic: 'Strategic', color: '#007AFF', depth: 'Open Pit', concentration: 'Medium' },
  { id: 4, name: 'Mount Weld', country: 'AUSTRALIA', x: 82, y: 75, reserves: '3.0M Tons', type: 'Carbonatite', status: 'Active', strategic: 'Stable', color: '#A855F7', depth: 'Open Pit', concentration: 'High' },
  { id: 5, name: 'Kvanefjeld', country: 'GREENLAND', x: 42, y: 15, reserves: '10M Tons', type: 'Ilimaussaq', status: 'Pending', strategic: 'Potential', color: '#e2e8f0', depth: 'Surface', concentration: 'Med' },
];

interface OverloadAsset {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  oi: string;
  funding: string;
  type: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

const OVERLOAD_ASSETS: OverloadAsset[] = [
  { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin', price: '68,450.00', change: '+2.4%', oi: '$12.5B', funding: '0.01%', type: 'CRYPTO', Icon: Bitcoin, iconColor: 'text-orange-500' },
  { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum', price: '3,850.25', change: '-0.5%', oi: '$8.2B', funding: '0.008%', type: 'CRYPTO', Icon: Activity, iconColor: 'text-purple-500' },
  { id: 'sol', symbol: 'SOL/USD', name: 'Solana', price: '145.80', change: '+5.1%', oi: '$2.1B', funding: '-0.02%', type: 'CRYPTO', Icon: Zap, iconColor: 'text-cyan-500' },
  { id: 'gold', symbol: 'XAU/USD', name: 'Gold', price: '2,034.10', change: '+0.15%', oi: '450k Lot', funding: 'Swap -', type: 'METAL', Icon: Sun, iconColor: 'text-[#D4AF37]' },
  { id: 'silver', symbol: 'XAG/USD', name: 'Silver', price: '23.12', change: '-0.05%', oi: '120k Lot', funding: 'Swap -', type: 'METAL', Icon: Component, iconColor: 'text-slate-400' },
  { id: 'copper', symbol: 'HG1!', name: 'Copper', price: '3.85', change: '+1.1%', oi: '85k Lot', funding: 'Physical', type: 'METAL', Icon: Hammer, iconColor: 'text-orange-700' },
  { id: 'wti', symbol: 'CL1!', name: 'Crude Oil', price: '78.40', change: '+1.2%', oi: '320k Lot', funding: 'Contango', type: 'ENERGY', Icon: Droplets, iconColor: 'text-zinc-200' },
  { id: 'ng', symbol: 'NG1!', name: 'Nat Gas', price: '1.85', change: '-2.3%', oi: '150k Lot', funding: 'Backward', type: 'ENERGY', Icon: Flame, iconColor: 'text-blue-500' },
];

const RARE_EARTH_NEWS = [
  { id: 1, title: '南鳥島レアアース泥、2025年試験採掘へ', source: 'JOGMEC', impact: 'High' as const, ticker: '5713.T' },
  { id: 2, title: '深海採掘技術の確立に向けた新コンソーシアム発足', source: 'Nikkei', impact: 'Medium' as const, ticker: '6301.T' },
  { id: 3, title: '中国輸出規制に対抗、国産サプライチェーン強化', source: 'METI', impact: 'High' as const, ticker: '8058.T' },
];

type ViewType = 'dashboard' | 'terminal' | 'heatmap' | 'rare_earth' | 'recon' | 'prop' | 'wealth' | 'estate';
type TradeMode = 'long' | 'short';

interface AiSignal {
  action: string;
  confidence: number;
  reason: string;
}

interface ReconReport {
  title: string;
  takeaway: string;
  sentiment_retail: string;
  sentiment_smart: string;
}

interface MiningSite {
  id: number;
  name: string;
  country: string;
  x: number;
  y: number;
  reserves: string;
  type: string;
  status: string;
  strategic: string;
  color: string;
  depth: string;
  concentration: string;
}

// --- Sub-Components ---

function DenseAssetCard({ asset }: { asset: OverloadAsset }) {
  const isUp = asset.change.startsWith('+');
  const IconComponent = asset.Icon;
  return (
    <div className="bg-[#1e2124] p-4 rounded-2xl border border-zinc-800 hover:border-[#D4AF37] transition-all group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${isUp ? 'bg-[#00c805]' : 'bg-[#ff5000]'}`} />
      <div className="flex justify-between items-start mb-2 pl-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${asset.iconColor}`} />
          <span className="font-black text-xs text-zinc-400">{asset.symbol}</span>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isUp ? 'bg-[#00c805]/20 text-[#00c805]' : 'bg-[#ff5000]/20 text-[#ff5000]'}`}>{asset.change}</span>
      </div>
      <div className="pl-2 mb-3">
        <div className="text-xl font-black text-white tracking-tighter">{asset.price}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 pl-2 pt-3 border-t border-zinc-800">
        <div>
          <p className="text-[8px] font-bold text-zinc-600 uppercase">Open Interest</p>
          <p className="text-[10px] font-mono text-zinc-300">{asset.oi}</p>
        </div>
        <div>
          <p className="text-[8px] font-bold text-zinc-600 uppercase">Funding/Basis</p>
          <p className={`text-[10px] font-mono ${asset.funding.includes('-') ? 'text-[#00c805]' : 'text-[#ff5000]'}`}>{asset.funding}</p>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <svg width="60" height="30" viewBox="0 0 60 30">
          <path d={isUp ? 'M0 30 L10 20 L20 25 L30 15 L40 20 L60 0' : 'M0 0 L10 10 L20 5 L30 15 L40 10 L60 30'} fill="none" stroke={isUp ? COLORS.green : COLORS.red} strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

function LiquidityHeatmap() {
  return (
    <div className="bg-[#1e2124] rounded-3xl p-8 border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-6 z-10">
        <div>
          <h2 className="text-2xl font-black italic flex items-center gap-3 text-white">
            <Flame className="text-[#ff5000] w-6 h-6" /> ORDERBOOK HEATMAP
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Historical Liquidity Depth</p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-[#ff5000]" /> Heavy Sell Wall</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-[#00c805]" /> Heavy Buy Wall</div>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full bg-black/50 rounded-2xl overflow-hidden border border-zinc-800/50">
        {/* Sell Side */}
        <div className="absolute top-0 left-0 w-full h-[45%] flex flex-col justify-end">
          <div className="h-1/3 w-full bg-gradient-to-r from-red-900/10 via-red-500/20 to-red-900/10 blur-xl" />
          <div className="h-1/3 w-full bg-gradient-to-r from-orange-900/20 via-orange-500/40 to-orange-900/20 blur-lg mt-2" />
          <div className="absolute top-4 right-0 w-3/4 h-8 bg-red-600/30 blur-md rounded-l-full" />
          <div className="absolute top-12 left-0 w-1/2 h-4 bg-orange-600/20 blur-md rounded-r-full" />
          <div className="absolute bottom-4 right-10 w-1/3 h-6 bg-red-500/20 blur-sm rounded-full" />
        </div>

        {/* Current Price Line */}
        <div className="absolute top-[45%] left-0 w-full h-[10%] flex items-center z-20">
          <div className="w-full h-0.5 bg-white opacity-10" />
          <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity={0.2} />
                <stop offset="100%" stopColor="white" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d="M0,50 Q40,30 80,60 T160,40 T240,65 T320,45 T400,55 T480,35 T560,50 T640,40 V100 H0 Z" fill="url(#gradPrice)" />
            <path d="M0,50 Q40,30 80,60 T160,40 T240,65 T320,45 T400,55 T480,35 T560,50 T640,40" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="640" cy="40" r="4" fill="white" className="animate-pulse" />
          </svg>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-l-md z-30 shadow-lg">
            18,312.50
          </div>
        </div>

        {/* Buy Side */}
        <div className="absolute bottom-0 left-0 w-full h-[45%] flex flex-col justify-start">
          <div className="absolute bottom-8 right-0 w-2/3 h-10 bg-[#00c805]/20 blur-md rounded-l-full" />
          <div className="absolute bottom-2 left-10 w-full h-12 bg-[#00c805]/30 blur-xl rounded-r-full" />
          <div className="absolute top-4 left-20 w-1/4 h-6 bg-emerald-500/20 blur-sm rounded-full" />
          <div className="h-1/3 w-full bg-gradient-to-r from-green-900/10 via-green-500/20 to-green-900/10 blur-xl mb-2" />
          <div className="h-1/3 w-full bg-gradient-to-r from-emerald-900/20 via-emerald-500/40 to-emerald-900/20 blur-lg" />
        </div>

        {/* Price Labels Y-Axis */}
        <div className="absolute right-0 top-0 h-full w-16 flex flex-col justify-between py-6 text-[10px] font-mono text-zinc-500 text-right pr-3 bg-black/20 backdrop-blur-sm border-l border-zinc-800 z-20">
          <span>18,450</span>
          <span>18,400</span>
          <span className="text-[#ff5000]">18,350</span>
          <div className="h-4" />
          <span className="text-[#00c805]">18,300</span>
          <span>18,250</span>
          <span>18,200</span>
        </div>
      </div>

      <div className="flex justify-between mt-4 text-[10px] font-bold text-zinc-600 uppercase px-4 border-t border-zinc-800 pt-2">
        <span>10:30</span>
        <span>10:45</span>
        <span>11:00</span>
        <span>11:15</span>
        <span>11:30 (LIVE)</span>
      </div>
    </div>
  );
}

function GlobalMiningMap() {
  const [activeSite, setActiveSite] = useState<MiningSite | null>(null);

  return (
    <div className="relative w-full h-[500px] bg-[#050508] rounded-[40px] border border-zinc-800 overflow-hidden group shadow-2xl">
      {/* Tactical Grid Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 122, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 122, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* World Map Outline */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <svg viewBox="0 0 1000 500" className="w-full h-full fill-[#1a1a2e] stroke-[#007AFF]" strokeWidth="0.5">
          <path d="M50,150 Q100,50 200,100 T400,150 T600,100 T850,120 V350 Q750,450 550,400 T250,350 T50,300 Z" opacity="0.5" />
          <path d="M750,300 Q800,250 850,280 T950,350 T800,400 Z" opacity="0.5" />
        </svg>
      </div>

      {/* Scanning Line Effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-[#007AFF]/10 to-transparent animate-[scan_4s_linear_infinite] pointer-events-none" />

      {/* Interactive Pins */}
      {MINING_SITES.map((site) => (
        <div
          key={site.id}
          className="absolute cursor-pointer transition-all duration-500"
          style={{ top: `${site.y}%`, left: `${site.x}%` }}
          onMouseEnter={() => setActiveSite(site)}
          onMouseLeave={() => setActiveSite(null)}
        >
          <div className="relative flex items-center justify-center">
            <div className={`w-32 h-32 absolute rounded-full animate-ping opacity-20 ${site.strategic === 'Critical' ? 'border border-emerald-500/20' : 'border border-orange-500/20'}`} />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm ${site.strategic === 'Critical' ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-orange-500/20 border border-orange-500/50'}`}>
              <div className={`w-2 h-2 rounded-full ${site.strategic === 'Critical' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
            </div>
            <div className={`absolute top-full left-1/2 w-[1px] h-10 bg-gradient-to-b ${site.strategic === 'Critical' ? 'from-emerald-500' : 'from-orange-500'} to-transparent`} />
          </div>
        </div>
      ))}

      {/* HUD Overlay */}
      <div className="absolute top-8 left-8 z-20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30 backdrop-blur-md">
            <Globe className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 text-[9px] font-black rounded border border-blue-500/30 uppercase tracking-widest">Live Sat-Feed</span>
            <h2 className="text-3xl font-black text-white italic tracking-tighter mt-1">STRATEGIC <span className="text-blue-500">RESERVES</span></h2>
          </div>
        </div>
      </div>

      {/* Dynamic Detail Panel */}
      {activeSite ? (
        <div className="absolute bottom-8 right-8 w-80 bg-[#0c0c0e]/90 backdrop-blur-xl border border-zinc-700 p-6 rounded-3xl shadow-2xl z-30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{activeSite.country}</p>
              <h3 className="text-xl font-black text-white">{activeSite.name}</h3>
            </div>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Reserves', value: activeSite.reserves, color: 'text-white' },
              { label: 'Type', value: activeSite.type, color: 'text-blue-300' },
              { label: 'Depth', value: activeSite.depth, color: 'text-white' },
              { label: 'Strategic', value: activeSite.strategic, color: activeSite.strategic === 'Critical' ? 'text-emerald-500' : 'text-orange-500' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">{row.label}</span>
                <span className={`text-xs font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute bottom-8 right-8 w-64 p-4 bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl text-right">
          <p className="text-[10px] text-zinc-500 font-mono">HOVER OVER TARGETS FOR INTEL</p>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}

function JudasSwingSVG({ mode }: { mode: TradeMode }) {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full opacity-90">
      <text x="10" y="15" fill={COLORS.gold} fontSize="8" fontWeight="bold">JUDAS SWING (ICT)</text>
      {mode === 'long' ? (
        <>
          <path d="M 10 40 L 60 40 L 70 35 L 90 45 L 110 40" fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 110 40 L 120 75 L 130 70 L 140 85" fill="none" stroke={COLORS.red} strokeWidth="2" />
          <path d="M 140 85 L 160 30 L 190 10" fill="none" stroke={COLORS.green} strokeWidth="2" />
          <circle cx="140" cy="85" r="3" fill={COLORS.red} />
          <text x="145" y="95" fill={COLORS.red} fontSize="7" fontWeight="bold">BEAR TRAP</text>
        </>
      ) : (
        <>
          <path d="M 10 60 L 60 60 L 70 65 L 90 55 L 110 60" fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 110 60 L 120 25 L 130 30 L 140 15" fill="none" stroke={COLORS.green} strokeWidth="2" />
          <path d="M 140 15 L 160 70 L 190 90" fill="none" stroke={COLORS.red} strokeWidth="2" />
          <circle cx="140" cy="15" r="3" fill={COLORS.green} />
          <text x="145" y="10" fill={COLORS.green} fontSize="7" fontWeight="bold">BULL TRAP</text>
        </>
      )}
    </svg>
  );
}

function OrderBlockSVG({ mode }: { mode: TradeMode }) {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full opacity-90">
      <text x="10" y="15" fill={COLORS.gold} fontSize="8" fontWeight="bold">INSTITUTIONAL ORDER BLOCK</text>
      {mode === 'long' ? (
        <>
          <rect x="50" y="60" width="25" height="25" fill={COLORS.green} opacity="0.2" stroke={COLORS.green} strokeDasharray="2 2" />
          <path d="M 20 20 L 50 60" fill="none" stroke={COLORS.red} strokeWidth="1.5" />
          <path d="M 75 60 L 110 10" fill="none" stroke={COLORS.green} strokeWidth="3" />
          <path d="M 110 10 L 130 65" fill="none" stroke="#71717a" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="130" cy="65" r="4" fill={COLORS.green} className="animate-pulse" />
          <text x="135" y="75" fill={COLORS.green} fontSize="7" fontWeight="bold">POI / ENTRY</text>
        </>
      ) : (
        <>
          <rect x="50" y="15" width="25" height="25" fill={COLORS.red} opacity="0.2" stroke={COLORS.red} strokeDasharray="2 2" />
          <path d="M 20 80 L 50 40" fill="none" stroke={COLORS.green} strokeWidth="1.5" />
          <path d="M 75 40 L 110 90" fill="none" stroke={COLORS.red} strokeWidth="3" />
          <path d="M 110 90 L 130 35" fill="none" stroke="#71717a" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="130" cy="35" r="4" fill={COLORS.red} className="animate-pulse" />
          <text x="135" y="30" fill={COLORS.red} fontSize="7" fontWeight="bold">POI / ENTRY</text>
        </>
      )}
    </svg>
  );
}

// --- Firebase Hook ---
function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, setUser);
    signInAnonymously(auth).catch((err) => {
      console.warn('Anonymous sign-in failed:', err.message);
    });
    return () => unsubscribe();
  }, []);

  return user;
}

// --- Main Component ---
export default function WhaleHunterDashboard() {
  const user = useFirebaseAuth();
  const [view, setView] = useState<ViewType>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Terminal states
  const [tradeMode, setTradeMode] = useState<TradeMode>('long');
  const [volumeSpike, setVolumeSpike] = useState(0);
  const [aiSignal, setAiSignal] = useState<AiSignal>({ action: 'WAIT', confidence: 50, reason: 'Monitoring order flow...' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  // Recon state
  const [reconReport, setReconReport] = useState<ReconReport>({
    title: 'Market Awaiting Catalyst',
    takeaway: 'Volume is thin ahead of CPI data. Smart money is flat.',
    sentiment_retail: '88',
    sentiment_smart: '42',
  });
  const [isGeneratingRecon, setIsGeneratingRecon] = useState(false);

  // Estate state
  const [estateAdvice, setEstateAdvice] = useState<string | null>(null);
  const [isAnalyzingEstate, setIsAnalyzingEstate] = useState(false);

  // Wealth state
  const [currentNetWorth, setCurrentNetWorth] = useState(10000000);
  const [monthlyAdd, setMonthlyAdd] = useState(500000);
  const [annualReturn] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const whaleSim = setInterval(() => {
      const spike = Math.random() > 0.85 ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 20);
      setVolumeSpike(spike);
    }, 1500);
    return () => {
      clearInterval(timer);
      clearInterval(whaleSim);
    };
  }, []);

  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  // --- Gemini: AI Judge ---
  const runAiJudge = async () => {
    if (!geminiApiKey) {
      setAiSignal({ action: 'ALERT', confidence: 80, reason: 'Whale activity detected on tape.' });
      return;
    }
    setIsAnalyzing(true);
    const prompt = `Act as a senior momentum trader at a top prop firm.
    Current Asset: NQ/Crypto. Volume Intensity: ${volumeSpike}/100. Pattern Mode: ${tradeMode.toUpperCase()}.
    Time: ${currentTime.toLocaleTimeString()}.
    Determine a trade signal based on ICT concepts (Judas Swing, Order Block).
    Output strictly valid JSON: { "action": "BUY" | "SELL" | "WAIT", "confidence": number (0-100), "reason": "Short punchy reason (max 15 words)." }`;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setAiSignal(result);
    } catch {
      setAiSignal({ action: 'ALERT', confidence: 80, reason: 'Whale activity detected on tape.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Gemini: Recon Report ---
  const generateReconReport = async () => {
    if (!geminiApiKey) return;
    setIsGeneratingRecon(true);
    const prompt = `Generate a 'Morning Recon' report for a professional trading terminal.
    Theme: Institutional Order Flow & Yesterday's 9:30 AM NY Open.
    Output valid JSON:
    { "title": "Short catchy title about market state", "takeaway": "2 sentences describing how Smart Money trapped Retail traders yesterday.", "sentiment_retail": "number 0-100 (high means bullish)", "sentiment_smart": "number 0-100 (high means bullish)" }`;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setReconReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingRecon(false);
    }
  };

  // --- Gemini: Estate Advisor ---
  const analyzeEstate = async () => {
    if (!geminiApiKey) {
      setEstateAdvice('Configure NEXT_PUBLIC_GEMINI_API_KEY to enable AI analysis.');
      return;
    }
    setIsAnalyzingEstate(true);
    const prompt = `Act as a Real Estate Investment Advisor for a wealthy trader.
    Current context: Los Angeles Cap Rate 4.2%, Hawaii Cap 3.8%.
    Question: Where should I park $5M profit for maximum safety?
    Output: A concise 1-sentence recommendation.`;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await response.json();
      setEstateAdvice(data.candidates[0].content.parts[0].text);
    } catch {
      setEstateAdvice('Data unavailable. Proceed with caution.');
    } finally {
      setIsAnalyzingEstate(false);
    }
  };

  const yearsToGoal = () => {
    const goal = 500000000;
    let balance = currentNetWorth;
    let months = 0;
    while (balance < goal && months < 600) {
      balance = balance * (1 + annualReturn / 1200) + (monthlyAdd || 0);
      months++;
    }
    return (months / 12).toFixed(1);
  };

  const steps = [
    { id: '1', text: 'HTF Daily Bias Confirmation' },
    { id: '2', text: 'Asian Range Liquidity Sweep' },
    { id: '3', text: 'Order Block / FVG Alignment' },
    { id: '4', text: 'Absorption Detected (>60%)' },
  ];

  const isReady = Object.keys(checkedSteps).filter((k) => checkedSteps[k]).length === steps.length;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden selection:bg-[#D4AF37]/30">

      {/* HEADER */}
      <header className="flex justify-between items-center p-4 md:px-8 border-b border-zinc-900 bg-black/95 z-50 shadow-2xl shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]">W</div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter italic">WHALEHUNTER <span className="text-[#D4AF37] font-light">ELITE</span></span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00c805] animate-pulse" />
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">SaaS Neural Network Active</span>
              </div>
            </div>
          </div>
          <nav className="hidden lg:flex gap-1 bg-[#1e2124] p-1 rounded-full border border-zinc-800 shadow-inner">
            {(['dashboard', 'terminal', 'heatmap', 'rare_earth', 'recon', 'prop', 'wealth', 'estate'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${view === v ? 'bg-[#D4AF37] text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
              >
                {v.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end border-r border-zinc-800 pr-6">
            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Master PnL</div>
            <div className="text-xs font-black text-[#00c805]">+$12,450.00</div>
          </div>
          <button className="bg-[#1e2124] p-2 rounded-full border border-zinc-800 hover:bg-zinc-800 transition-all"><Menu className="w-5 h-5 text-[#D4AF37]" /></button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-black relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <main className="max-w-[1600px] mx-auto p-4 md:p-8 relative z-10">

          {/* --- DASHBOARD VIEW --- */}
          {view === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Col */}
              <div className="space-y-6">
                <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#00c805]" />
                  <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#00c805]" /> Account Health</h2>
                  <div className="space-y-4">
                    {PROP_ACCOUNTS.map((acc) => (
                      <div key={acc.id} className="flex justify-between items-center p-3 rounded-2xl bg-black/40 border border-zinc-800/50">
                        <div>
                          <p className="text-[10px] font-bold text-white">{acc.name}</p>
                          <p className="text-[9px] text-zinc-500">Buffer: <span className={acc.status === 'Risk' ? 'text-[#ff5000]' : 'text-[#00c805]'}>{acc.buffer}</span></p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${acc.status === 'Active' ? 'bg-[#00c805]' : 'bg-[#ff5000] animate-pulse'}`} />
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors">Detailed Audit</button>
                </div>
                <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                  <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Siren className="w-4 h-4 text-[#ff5000]" /> Risk Radar</h2>
                  <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-2xl">
                    <p className="text-[10px] font-bold text-red-400 mb-1">HIGH IMPACT NEWS</p>
                    <p className="text-sm font-bold text-white">CPI Release in 12m 30s</p>
                    <p className="text-[9px] text-zinc-400 mt-2">Protocol: No entries 5 min before/after.</p>
                  </div>
                </div>
              </div>

              {/* Center Col */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-[#1e2124] to-black rounded-[40px] p-10 border border-zinc-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10"><BrainCircuit className="w-32 h-32" /></div>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Market Context AI</p>
                      <h1 className="text-4xl font-black text-white italic tracking-tighter mt-2">&quot;Wait for Liquidity Sweep&quot;</h1>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Daily Bias</p>
                      <p className="text-2xl font-black text-[#00c805]">BULLISH</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: 'Volatility', value: 'Low', pct: 'w-[20%]', color: 'bg-blue-500' },
                      { label: 'Volume', value: 'Building', pct: 'w-[60%]', color: 'bg-[#D4AF37]' },
                      { label: 'Sentiment', value: 'Fear', pct: 'w-[80%]', color: 'bg-[#ff5000]' },
                    ].map((m) => (
                      <div key={m.label} className="bg-black/30 p-5 rounded-3xl border border-zinc-800">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase mb-2">{m.label}</p>
                        <p className={`text-xl font-black ${m.label === 'Sentiment' ? 'text-[#ff5000]' : 'text-white'}`}>{m.value}</p>
                        <div className="w-full h-1 bg-zinc-800 mt-2 rounded-full"><div className={`${m.pct} h-full ${m.color} rounded-full`} /></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex gap-4">
                    <button onClick={() => setView('terminal')} className="flex-1 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Open Terminal
                    </button>
                    <button onClick={() => setView('recon')} className="px-8 py-4 bg-zinc-800 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all">
                      Read Briefing
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#1e2124] rounded-[32px] p-6 border border-zinc-800 hover:border-[#D4AF37] transition-all cursor-pointer group" onClick={() => setView('wealth')}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-black/30 rounded-xl"><DollarSign className="w-6 h-6 text-[#D4AF37]" /></div>
                      <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Wealth Projection</p>
                    <p className="text-2xl font-black text-white mt-1">¥500M Goal</p>
                    <p className="text-[10px] text-[#00c805] font-bold mt-2">On Track (8.5 Yrs)</p>
                  </div>
                  <div className="bg-[#1e2124] rounded-[32px] p-6 border border-zinc-800 hover:border-blue-500 transition-all cursor-pointer group" onClick={() => setView('rare_earth')}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-black/30 rounded-xl"><Anchor className="w-6 h-6 text-blue-500" /></div>
                      <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Strategic Asset</p>
                    <p className="text-2xl font-black text-white mt-1">Rare Earth</p>
                    <p className="text-[10px] text-blue-400 font-bold mt-2">3 New Reports</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TERMINAL VIEW --- */}
          {view === 'terminal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT: Patterns */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#1e2124] rounded-[32px] p-6 border border-zinc-800 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Target className="w-4 h-4 text-[#D4AF37]" /> Pattern Lab</h2>
                    <div className="flex gap-1 bg-black/20 p-1 rounded-full border border-zinc-800">
                      <button onClick={() => setTradeMode('long')} className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${tradeMode === 'long' ? 'bg-[#00c805] text-black shadow-md' : 'text-zinc-500'}`}>LONG</button>
                      <button onClick={() => setTradeMode('short')} className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${tradeMode === 'short' ? 'bg-[#ff5000] text-white shadow-md' : 'text-zinc-500'}`}>SHORT</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-black/60 rounded-2xl p-4 border border-zinc-800/50 aspect-video shadow-inner"><JudasSwingSVG mode={tradeMode} /></div>
                    <div className="bg-black/60 rounded-2xl p-4 border border-zinc-800/50 aspect-video shadow-inner"><OrderBlockSVG mode={tradeMode} /></div>
                  </div>
                </div>
              </div>

              {/* CENTER: AI & Assets */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="bg-[#1e2124] rounded-[40px] p-10 flex flex-col items-center justify-center min-h-[300px] border border-zinc-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6"><Activity className="w-6 h-6 text-zinc-700 animate-pulse" /></div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Whale Intensity Sonar</p>
                  <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                    <div className={`absolute inset-0 rounded-full border-4 ${volumeSpike > 70 ? 'border-red-500 animate-ping opacity-20' : 'border-zinc-800 opacity-50'}`} />
                    <div className={`absolute inset-4 rounded-full border-2 ${volumeSpike > 70 ? 'border-red-500' : 'border-zinc-800'}`} />
                    <div className="text-7xl font-black font-mono tracking-tighter text-white">{volumeSpike}<span className="text-xl text-zinc-600">%</span></div>
                  </div>
                  <div className="flex gap-4 w-full justify-center">
                    <div className="px-6 py-2 bg-black/40 rounded-xl border border-zinc-800 text-center">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase">AI Verdict</p>
                      <p className={`text-lg font-black ${aiSignal.action === 'BUY' ? 'text-[#00c805]' : aiSignal.action === 'SELL' ? 'text-[#ff5000]' : 'text-zinc-300'}`}>{aiSignal.action}</p>
                    </div>
                    <div className="px-6 py-2 bg-black/40 rounded-xl border border-zinc-800 text-center">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase">Confidence</p>
                      <p className="text-lg font-black text-[#D4AF37]">{aiSignal.confidence}%</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Global Markets Matrix</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {OVERLOAD_ASSETS.map((asset) => <DenseAssetCard key={asset.id} asset={asset} />)}
                  </div>
                </div>
              </div>

              {/* RIGHT: Protocol */}
              <div className="lg:col-span-3">
                <div className="bg-[#1e2124] rounded-[40px] p-8 border border-zinc-800 sticky top-28 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <ShieldCheck className="w-6 h-6 text-[#00c805]" />
                    <h2 className="text-xl font-black italic tracking-tighter">EXECUTE</h2>
                  </div>
                  <div className="space-y-3 mb-10">
                    {steps.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setCheckedSteps((p) => ({ ...p, [s.id]: !p[s.id] }))}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all ${checkedSteps[s.id] ? 'bg-[#00c805]/10 border-[#00c805]/30' : 'bg-black/40 border-transparent hover:border-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${checkedSteps[s.id] ? 'bg-[#00c805] border-[#00c805]' : 'border-zinc-600'}`}>
                          {checkedSteps[s.id] && <Check className="w-3 h-3 text-black" />}
                        </div>
                        <span className={`text-[10px] font-black uppercase ${checkedSteps[s.id] ? 'text-white' : 'text-zinc-500'}`}>{s.text}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={!isReady}
                    className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl relative overflow-hidden ${isReady ? 'bg-white text-black hover:bg-[#D4AF37] active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                    onClick={() => alert('Master Broadcast Executed.\nAll 20 PAs synchronized successfully.')}
                  >
                    {isReady ? 'Broadcast Signal' : 'Validate First'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- HEATMAP VIEW --- */}
          {view === 'heatmap' && (
            <div className="max-w-5xl mx-auto space-y-10">
              <LiquidityHeatmap />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#1e2124] p-8 rounded-[40px] border border-zinc-800 shadow-xl group hover:border-red-500 transition-all">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">Retail Long Stops <AlertCircle className="w-3 h-3 text-red-500" /></p>
                  <p className="text-3xl font-black text-red-500 font-mono">18,140 - 18,160</p>
                  <p className="text-[10px] text-zinc-600 font-bold mt-2">Targeted for immediate sweep</p>
                </div>
                <div className="bg-[#1e2124] p-8 rounded-[40px] border border-zinc-800 shadow-xl group hover:border-[#D4AF37] transition-all">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">Institutional POI <Target className="w-3 h-3 text-[#D4AF37]" /></p>
                  <p className="text-3xl font-black text-[#D4AF37] font-mono">18,125.50</p>
                  <p className="text-[10px] text-zinc-600 font-bold mt-2">Deep absorption zone detected</p>
                </div>
                <div className="bg-[#1e2124] p-8 rounded-[40px] border border-zinc-800 shadow-xl group hover:border-orange-500 transition-all">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">Liquidity Gap <Waves className="w-3 h-3 text-orange-500" /></p>
                  <p className="text-3xl font-black text-orange-500 font-mono">18,280 - 18,310</p>
                  <p className="text-[10px] text-zinc-600 font-bold mt-2">High acceleration potential</p>
                </div>
              </div>
            </div>
          )}

          {/* --- RARE EARTH VIEW --- */}
          {view === 'rare_earth' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="h-[400px] w-full"><GlobalMiningMap /></div>
                  <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Newspaper className="w-4 h-4 text-blue-500" /> Strategic Intelligence</h3>
                    <div className="space-y-4">
                      {RARE_EARTH_NEWS.map((news) => (
                        <div key={news.id} className="group p-4 rounded-2xl bg-black/40 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded uppercase">{news.source}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{news.ticker}</span>
                          </div>
                          <h4 className="text-base font-bold text-zinc-200 group-hover:text-white">{news.title}</h4>
                          <div className="mt-2 flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${news.impact === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Impact: {news.impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-[#1e2124] p-6 rounded-[32px] border border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Geopolitical Risk Index</p>
                    <p className="text-3xl font-black text-red-500">HIGH</p>
                    <div className="w-full h-1 bg-zinc-800 mt-3 rounded-full"><div className="w-[80%] h-full bg-red-500 rounded-full" /></div>
                  </div>
                  <div className="bg-[#1e2124] p-6 rounded-[32px] border border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Est. Reserve Value</p>
                    <p className="text-3xl font-black text-blue-400">¥250T+</p>
                  </div>
                  <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Factory className="w-4 h-4 text-[#D4AF37]" /> Core Stocks</h3>
                    <div className="space-y-3">
                      {[
                        { name: '三井海洋開発', ticker: '6269', price: '2,450', chg: '+3.2%' },
                        { name: 'コマツ', ticker: '6301', price: '4,120', chg: '+0.8%' },
                        { name: '住友商事', ticker: '8053', price: '3,560', chg: '-0.5%' },
                        { name: '東洋建設', ticker: '1890', price: '1,150', chg: '+5.4%' },
                      ].map((stock, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-zinc-800/50 hover:bg-black/40">
                          <div>
                            <div className="font-bold text-sm text-white">{stock.name} <span className="text-[10px] text-zinc-500 font-mono ml-1">{stock.ticker}</span></div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm text-white">{stock.price}</div>
                            <div className={`text-[10px] font-bold ${stock.chg.includes('+') ? 'text-[#00c805]' : 'text-red-500'}`}>{stock.chg}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- RECON VIEW --- */}
          {view === 'recon' && (
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#D4AF37]/20 p-3 rounded-full"><ScrollText className="w-8 h-8 text-[#D4AF37]" /></div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Director&apos;s Briefing</h2>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Institutional Grade Intel</p>
                  </div>
                </div>
                <button onClick={generateReconReport} disabled={isGeneratingRecon} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-full font-bold text-xs hover:bg-[#b0902c] transition-all disabled:opacity-50">
                  {isGeneratingRecon ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Generate New Report
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1e2124] p-8 rounded-[40px] border border-zinc-800 shadow-xl">
                  <h3 className="text-xs font-black text-[#ff5000] uppercase tracking-widest mb-6">Killzone Review (AI Generated)</h3>
                  <div className="prose prose-invert">
                    <h4 className="text-lg font-bold text-white mb-2">{reconReport.title}</h4>
                    <p className="text-lg font-medium leading-relaxed text-zinc-200 border-l-4 border-[#D4AF37] pl-4">
                      &quot;{reconReport.takeaway}&quot;
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-[#1e2124] p-6 rounded-[32px] border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-black/40 p-3 rounded-xl"><Users className="w-5 h-5 text-blue-400" /></div>
                      <div><p className="text-sm font-bold text-white">Retail Sentiment</p><p className="text-[10px] text-zinc-500">Crowd Psychology</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white">{reconReport.sentiment_retail}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Panic Index</p>
                    </div>
                  </div>
                  <div className="bg-[#1e2124] p-6 rounded-[32px] border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-black/40 p-3 rounded-xl"><BrainCircuit className="w-5 h-5 text-[#00c805]" /></div>
                      <div><p className="text-sm font-bold text-white">Smart Money</p><p className="text-[10px] text-zinc-500">Institutional Positioning</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#00c805]">{reconReport.sentiment_smart}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Accumulation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- WEALTH / ESTATE / PROP VIEWS --- */}
          {(view === 'wealth' || view === 'estate' || view === 'prop') && (
            <div className="max-w-5xl mx-auto py-10 text-center">
              <Crown className="w-16 h-16 text-[#D4AF37] mx-auto mb-6 animate-pulse" />
              <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4">EMPIRE <span className="text-[#D4AF37]">BUILDER</span></h2>

              {view === 'wealth' && (
                <div className="bg-[#1e2124] rounded-[60px] p-16 border border-zinc-800 shadow-[0_0_60px_rgba(212,175,55,0.1)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="text-left space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Current Net Worth</p>
                        <p className="text-4xl font-black text-white">¥{currentNetWorth.toLocaleString()}</p>
                        <input type="range" min="1000000" max="100000000" step="1000000" value={currentNetWorth} onChange={(e) => setCurrentNetWorth(Number(e.target.value))} className="w-full mt-4 accent-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Monthly Injection</p>
                        <p className="text-4xl font-black text-white">¥{monthlyAdd.toLocaleString()}</p>
                        <input type="range" min="0" max="1000000" step="10000" value={monthlyAdd} onChange={(e) => setMonthlyAdd(Number(e.target.value))} className="w-full mt-4 accent-[#D4AF37]" />
                      </div>
                    </div>
                    <div className="bg-black/60 p-12 rounded-[48px] border border-zinc-800 relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Target: ¥500M</p>
                        <p className="text-8xl font-black text-[#D4AF37] tracking-tighter">{yearsToGoal()}</p>
                        <p className="text-sm font-bold text-white uppercase tracking-[0.5em]">Years</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {view === 'estate' && (
                <div className="space-y-8">
                  <div className="bg-[#1e2124] p-6 rounded-3xl border border-zinc-800 flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-[#D4AF37]" /> AI Consultant</h3>
                      <p className="text-xs text-zinc-500">Real Estate Opportunity Scanner</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-300 italic mb-2">&quot;{estateAdvice || 'Ready to analyze market conditions.'}&quot;</p>
                      <button onClick={analyzeEstate} disabled={isAnalyzingEstate} className="text-[10px] font-bold text-[#D4AF37] uppercase hover:underline disabled:opacity-50">
                        {isAnalyzingEstate ? 'Analyzing...' : 'Ask AI Advisor'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { emoji: '🌴', city: 'LOS ANGELES', area: 'SANTA MONICA', capRate: '4.2%' },
                      { emoji: '🌺', city: 'HAWAII', area: "KAKA'AKO", capRate: '3.8%' },
                    ].map((loc) => (
                      <div key={loc.city} className="bg-[#1e2124] rounded-[48px] p-10 border border-zinc-800 text-left hover:scale-[1.02] transition-transform shadow-2xl group cursor-pointer">
                        <div className="flex justify-between items-start mb-8">
                          <div className="text-6xl">{loc.emoji}</div>
                          <div className="bg-black/40 px-4 py-2 rounded-xl text-center border border-zinc-800">
                            <p className="text-[9px] font-bold text-zinc-500 uppercase">Cap Rate</p>
                            <p className="text-2xl font-black text-[#00c805]">{loc.capRate}</p>
                          </div>
                        </div>
                        <h3 className="text-4xl font-black text-white mb-2">{loc.city}</h3>
                        <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-6">{loc.area}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'prop' && (
                <div className="max-w-6xl mx-auto space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      { title: 'SEED PHASE', val: 'Master Funded', desc: '150KをFundedへ。まずは利益を溜め込み、$3,000の出金バッファを作る。' },
                      { title: 'SYNC PHASE', val: '5 Account Copy', desc: '出金分で4口座追加。Trade Copierを導入。一撃の重みを5倍へ強化。' },
                      { title: 'SHIELD PHASE', val: '10 Account Base', desc: '利益の50%をLAの不動産プールへ。トレーダーとしての自由を確約。' },
                      { title: 'EMPIRE PHASE', val: '20 Master Node', desc: '月次収益$100,000を安定化。トレードは完全に機械的なルーティンへ。' },
                    ].map((p, i) => (
                      <div key={i} className="bg-[#1e2124] p-10 rounded-[48px] border border-zinc-800 text-center hover:border-[#D4AF37] transition-all shadow-2xl relative group">
                        <div className="absolute top-6 left-0 w-full text-[9px] font-black text-[#D4AF37] opacity-40 uppercase tracking-widest">{p.title}</div>
                        <p className="text-2xl font-black text-white mt-4 mb-4 tracking-tighter italic">{p.val}</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{p.desc}</p>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-800 group-hover:bg-[#D4AF37] transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* FOOTER: Global Ticker */}
      <footer className="bg-black border-t border-zinc-900 z-50 shrink-0">
        <div className="flex bg-[#0e1012] border-b border-zinc-800 overflow-hidden py-3">
          <div className="flex gap-16 animate-marquee whitespace-nowrap px-8">
            {[...TICKER_DATA, ...TICKER_DATA].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.symbol}</span>
                <span className="text-sm font-black text-white font-mono">{t.price}</span>
                <span className={`text-[10px] font-black ${t.up ? 'text-[#00c805]' : 'text-[#ff5000]'} flex items-center gap-1`}>
                  {t.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {t.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .grid-cols-20 { grid-template-columns: repeat(20, minmax(0, 1fr)); }
      `}</style>
    </div>
  );
}
