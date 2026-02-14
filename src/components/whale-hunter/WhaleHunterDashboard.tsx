'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Menu,
  BrainCircuit,
  Flame,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ScrollText,
  Sun,
  Component,
  Hammer,
  Droplets,
  Anchor,
  Factory,
  Newspaper,
  Crown,
  BookOpen,
  Bitcoin,
} from 'lucide-react';

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

interface AssetData {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  oi: string;
  funding: string;
  type: string;
  icon: React.ReactNode;
}

const OVERLOAD_ASSETS: AssetData[] = [
  { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin', price: '68,450.00', change: '+2.4%', oi: '$12.5B', funding: '0.01%', type: 'CRYPTO', icon: <Bitcoin className="w-4 h-4 text-orange-500" /> },
  { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum', price: '3,850.25', change: '-0.5%', oi: '$8.2B', funding: '0.008%', type: 'CRYPTO', icon: <Activity className="w-4 h-4 text-purple-500" /> },
  { id: 'sol', symbol: 'SOL/USD', name: 'Solana', price: '145.80', change: '+5.1%', oi: '$2.1B', funding: '-0.02%', type: 'CRYPTO', icon: <Zap className="w-4 h-4 text-cyan-500" /> },
  { id: 'gold', symbol: 'XAU/USD', name: 'Gold', price: '2,034.10', change: '+0.15%', oi: '450k Lot', funding: 'Swap -', type: 'METAL', icon: <Sun className="w-4 h-4 text-[#D4AF37]" /> },
  { id: 'silver', symbol: 'XAG/USD', name: 'Silver', price: '23.12', change: '-0.05%', oi: '120k Lot', funding: 'Swap -', type: 'METAL', icon: <Component className="w-4 h-4 text-slate-400" /> },
  { id: 'copper', symbol: 'HG1!', name: 'Copper', price: '3.85', change: '+1.1%', oi: '85k Lot', funding: 'Physical', type: 'METAL', icon: <Hammer className="w-4 h-4 text-orange-700" /> },
  { id: 'wti', symbol: 'CL1!', name: 'Crude Oil', price: '78.40', change: '+1.2%', oi: '320k Lot', funding: 'Contango', type: 'ENERGY', icon: <Droplets className="w-4 h-4 text-black fill-white" /> },
  { id: 'ng', symbol: 'NG1!', name: 'Nat Gas', price: '1.85', change: '-2.3%', oi: '150k Lot', funding: 'Backward', type: 'ENERGY', icon: <Flame className="w-4 h-4 text-blue-500" /> },
];

const RARE_EARTH_NEWS = [
  { id: 1, title: '南鳥島レアアース泥、2025年試験採掘へ', source: 'JOGMEC', impact: 'High' as const, ticker: '5713.T' },
  { id: 2, title: '深海採掘技術の確立に向けた新コンソーシアム発足', source: 'Nikkei', impact: 'Medium' as const, ticker: '6301.T' },
  { id: 3, title: '中国輸出規制に対抗、国産サプライチェーン強化', source: 'METI', impact: 'High' as const, ticker: '8058.T' },
];

const ESTATE_DATA: Record<string, { image: string; capRate: string; hotspot: string; trend: string }> = {
  '東京': { image: '🏙️', capRate: '4.2%', hotspot: '港区・渋谷区', trend: '都心回帰トレンドでオフィス・レジの需要が堅調。再開発エリアの築浅物件が狙い目。' },
  '大阪': { image: '🌉', capRate: '5.8%', hotspot: '北区・中央区', trend: '万博効果でインバウンド需要が急増。民泊・ホテル系の利回りが高い。' },
  '福岡': { image: '🌴', capRate: '6.1%', hotspot: '博多区・中央区', trend: '人口増加率全国トップクラス。天神ビッグバンによる再開発で地価上昇中。' },
  '札幌': { image: '❄️', capRate: '7.2%', hotspot: '中央区・北区', trend: 'ニセコ・リゾート需要の波及効果。冬季観光資産としてのポテンシャル大。' },
};

type ViewType = 'terminal' | 'rare_earth' | 'recon' | 'prop' | 'wealth' | 'estate';

// --- Sub-components ---

function DenseAssetCard({ asset }: { asset: AssetData }) {
  const isUp = asset.change.startsWith('+');
  return (
    <div className="bg-[#1e2124] p-4 rounded-2xl border border-zinc-800 hover:border-[#D4AF37] transition-all group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${isUp ? 'bg-[#00c805]' : 'bg-[#ff5000]'}`} />
      <div className="flex justify-between items-start mb-2 pl-2">
        <div className="flex items-center gap-2">
          {asset.icon}
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

function HeatmapCell({ intensity }: { intensity: number }) {
  let color = 'bg-zinc-900/50';
  if (intensity > 0.95) color = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] z-10 scale-110';
  else if (intensity > 0.85) color = 'bg-orange-500/80';
  else if (intensity > 0.7) color = 'bg-orange-500/40';
  else if (intensity > 0.5) color = 'bg-[#00c805]/20';

  return <div className={`rounded-sm ${color} transition-all duration-700 border border-white/5 w-full h-full`} />;
}

// --- Firebase Hook ---
function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Auto sign-in anonymously
    signInAnonymously(auth).catch((err) => {
      console.warn('Anonymous sign-in failed:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

function useFirestoreCollection(collectionName: string) {
  const [data, setData] = useState<DocumentData[]>([]);

  useEffect(() => {
    if (!db) return;

    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(docs);
      },
      (err) => {
        console.warn(`Firestore listener error (${collectionName}):`, err.message);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  return data;
}

// --- Main Component ---
export default function WhaleHunterDashboard() {
  const [view, setView] = useState<ViewType>('terminal');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [heatmapData, setHeatmapData] = useState<number[]>([]);

  const { user, loading: authLoading } = useFirebaseAuth();
  const signals = useFirestoreCollection('signals');

  // Heatmap simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeatmapData(Array.from({ length: 240 }, () => Math.random()));
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to write a signal to Firestore
  const logSignal = async (type: string, detail: string) => {
    if (!db || !user) return;
    try {
      await addDoc(collection(db, 'signals'), {
        type,
        detail,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Failed to log signal:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden selection:bg-[#D4AF37]/30">

      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-black/95 border-b border-zinc-900 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]">W</div>
          <nav className="hidden lg:flex gap-1 bg-[#1e2124] p-1 rounded-full border border-zinc-800">
            {(['terminal', 'rare_earth', 'recon', 'prop', 'wealth', 'estate'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${view === v ? 'bg-[#D4AF37] text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
              >
                {v.replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {authLoading ? (
            <p className="text-[9px] text-zinc-500">Connecting...</p>
          ) : user ? (
            <div className="text-right">
              <p className="text-[9px] font-bold text-zinc-500 uppercase">Firebase</p>
              <p className="text-xs font-black text-[#00c805] flex items-center gap-2 justify-end"><Zap className="w-3 h-3 fill-current" /> CONNECTED</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-[9px] font-bold text-zinc-500 uppercase">Firebase</p>
              <p className="text-xs font-black text-zinc-500 flex items-center gap-2 justify-end">OFFLINE</p>
            </div>
          )}
          <button className="bg-[#1e2124] p-2 rounded-full border border-zinc-800 hover:bg-zinc-800 transition-all"><Menu className="w-5 h-5 text-[#D4AF37]" /></button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-black relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <main className="max-w-[1600px] mx-auto p-4 md:p-8 relative z-10">

          {/* --- TERMINAL VIEW --- */}
          {view === 'terminal' && (
            <div className="space-y-8">
              {/* Top Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800 shadow-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <h2 className="text-2xl font-black italic flex items-center gap-3"><Flame className="text-[#ff5000]" /> LIQUIDITY HEATMAP</h2>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Cross-Asset Orderbook Aggregation</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-black/40 rounded-full text-[9px] font-bold text-[#D4AF37] border border-[#D4AF37]/20">GOLD</span>
                      <span className="px-3 py-1 bg-black/40 rounded-full text-[9px] font-bold text-[#00c805] border border-[#00c805]/20">BTC</span>
                      <span className="px-3 py-1 bg-black/40 rounded-full text-[9px] font-bold text-blue-500 border border-blue-500/20">OIL</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-20 gap-1 h-32 w-full relative z-10">
                    {heatmapData.map((val, i) => <HeatmapCell key={i} intensity={val} />)}
                  </div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#D4AF37] opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity" />
                </div>

                <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-[#D4AF37]" /> AI Signal Judge</h3>
                    <div className="mt-4">
                      <div className="text-5xl font-black italic tracking-tighter text-white mb-2">WAIT</div>
                      <p className="text-xs text-zinc-400 font-medium leading-relaxed italic border-l-2 border-[#D4AF37] pl-3">&quot;Volatility contraction detected across Energy and Metals. Anticipating breakout at 14:00 GMT.&quot;</p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase">Confidence</p>
                      <p className="text-xl font-black text-[#D4AF37]">42%</p>
                    </div>
                    <button
                      onClick={() => logSignal('scan', 'Full market scan triggered')}
                      className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase hover:bg-[#D4AF37] transition-all"
                    >
                      Scan All
                    </button>
                  </div>
                </div>
              </div>

              {/* Firestore Signals Feed */}
              {signals.length > 0 && (
                <div className="bg-[#1e2124] rounded-[32px] p-6 border border-zinc-800">
                  <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-4">Live Signals ({signals.length})</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {signals.slice(0, 10).map((sig) => (
                      <div key={sig.id} className="shrink-0 bg-black/40 px-4 py-2 rounded-xl border border-zinc-800 text-xs">
                        <span className="text-[#D4AF37] font-bold">{sig.type}</span>
                        <span className="text-zinc-400 ml-2">{sig.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Asset Grid */}
              <div>
                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Global Markets Matrix</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {OVERLOAD_ASSETS.map((asset) => (
                    <DenseAssetCard key={asset.id} asset={asset} />
                  ))}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-black to-[#111] rounded-[32px] p-1 border border-zinc-800 shadow-xl">
                  <div className="h-full bg-[#0a0a0a] rounded-[28px] p-6 flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1">Killzone Timer</p>
                      <p className="text-4xl font-black font-mono tracking-tighter">{currentTime.toLocaleTimeString([], { hour12: false })}</p>
                    </div>
                    <div className="relative z-10 text-right">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Session Volume</p>
                      <p className="text-xl font-black text-white">$42.8B</p>
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00c805]/5 via-transparent to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="bg-[#1e2124] rounded-[32px] p-6 border border-zinc-800 flex items-center gap-6">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Master Protocol</p>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00c805] w-[75%] shadow-[0_0_10px_#00c805]" />
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-2 font-mono">3/4 Checks Complete</p>
                  </div>
                  <button
                    onClick={() => logSignal('authorize', 'Protocol authorized')}
                    className="h-14 px-8 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl"
                  >
                    Authorize
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- RARE EARTH VIEW --- */}
          {view === 'rare_earth' && (
            <div className="space-y-8">
              <div className="relative rounded-[40px] overflow-hidden border border-zinc-800 h-64 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900" />
                <div className="absolute bottom-0 left-0 p-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Strategic Asset</span>
                    <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">JAPAN EEZ</span>
                  </div>
                  <h2 className="text-5xl font-black text-white italic tracking-tighter mb-2">RARE EARTH <span className="text-blue-400">DEEP SEA</span></h2>
                  <p className="text-sm text-blue-100 font-medium max-w-lg">
                    南鳥島沖に眠る「泥」が世界の供給網を変える。国産レアアース採掘プロジェクトの最前線と関連銘柄を追跡。
                  </p>
                </div>
                <div className="absolute top-10 right-10 flex gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-blue-300 uppercase">Est. Value</p>
                    <p className="text-3xl font-black text-white">¥250T+</p>
                  </div>
                  <Anchor className="w-12 h-12 text-blue-500 opacity-80" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Newspaper className="w-4 h-4 text-blue-500" /> Strategic Intelligence</h3>
                  <div className="space-y-4">
                    {RARE_EARTH_NEWS.map((news) => (
                      <div key={news.id} className="group/news p-4 rounded-2xl bg-black/40 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded uppercase">{news.source}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{news.ticker}</span>
                        </div>
                        <h4 className="text-base font-bold text-zinc-200 group-hover/news:text-white">{news.title}</h4>
                        <div className="mt-2 flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${news.impact === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">Impact: {news.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Factory className="w-4 h-4 text-[#D4AF37]" /> Core Sector Stocks</h3>
                  <div className="space-y-3">
                    {[
                      { name: '三井海洋開発', ticker: '6269', price: '2,450', chg: '+3.2%', desc: '浮体式生産設備' },
                      { name: 'コマツ', ticker: '6301', price: '4,120', chg: '+0.8%', desc: '深海掘削機開発' },
                      { name: '住友商事', ticker: '8053', price: '3,560', chg: '-0.5%', desc: '資源権益・商流' },
                      { name: '東洋建設', ticker: '1890', price: '1,150', chg: '+5.4%', desc: '海洋土木・浚渫' },
                    ].map((stock, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-zinc-800/50 hover:bg-black/40">
                        <div>
                          <div className="font-bold text-sm text-white">{stock.name} <span className="text-[10px] text-zinc-500 font-mono ml-1">{stock.ticker}</span></div>
                          <div className="text-[10px] text-zinc-500">{stock.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm text-white">{stock.price}</div>
                          <div className={`text-[10px] font-bold ${stock.chg.includes('+') ? 'text-[#00c805]' : 'text-red-500'}`}>{stock.chg}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-900/10 rounded-2xl border border-blue-500/20">
                    <p className="text-[10px] text-blue-300 italic leading-relaxed">
                      &quot;国産レアアースの商業化は2028年以降を想定。現在は実証実験フェーズのため、関連機器メーカーの受注ニュースが先行指標となる。&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- RECON VIEW --- */}
          {view === 'recon' && (
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#D4AF37]/20 p-3 rounded-full"><ScrollText className="w-8 h-8 text-[#D4AF37]" /></div>
                <div><h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Director&apos;s Briefing</h2><p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Institutional Grade Intel</p></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1e2124] p-8 rounded-[40px] border border-zinc-800 shadow-xl">
                  <h3 className="text-xs font-black text-[#ff5000] uppercase tracking-widest mb-6">Yesterday&apos;s Killzone Review</h3>
                  <div className="prose prose-invert">
                    <p className="text-lg font-medium leading-relaxed text-zinc-200">
                      <span className="text-4xl float-left mr-3 mt-[-10px] font-serif text-[#D4AF37]">&ldquo;</span>
                      市場は9:32に明確な <span className="text-[#ff5000] font-black">Bear Trap</span> を形成しました。リテール層がCPI後の恐怖でパニック売りをする中、1分足の Order Block で $1.2B 規模の買い吸収（Absorption）を確認。これは今週最大のロング好機でした。
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center">
                      <Users className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div><p className="text-xs font-bold text-white">Chief Strategist</p><p className="text-[9px] text-zinc-500 uppercase">Ex-Goldman Desk</p></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#1e2124] p-6 rounded-[32px] border border-zinc-800 flex items-center justify-between hover:border-[#D4AF37] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="bg-black/40 p-3 rounded-xl"><Users className="w-5 h-5 text-blue-400" /></div>
                      <div><p className="text-sm font-bold text-white">Topstep Community Feed</p><p className="text-[10px] text-zinc-500">Live Discord Sentiment</p></div>
                    </div>
                    <div className="text-right"><p className="text-xl font-black text-red-500">BEARISH</p><p className="text-[9px] text-zinc-600 uppercase">Contrarian Signal</p></div>
                  </div>
                  <div className="bg-[#1e2124] p-6 rounded-[32px] border border-zinc-800 flex items-center justify-between hover:border-[#00c805] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="bg-black/40 p-3 rounded-xl"><BookOpen className="w-5 h-5 text-[#00c805]" /></div>
                      <div><p className="text-sm font-bold text-white">ICT Mentorship Note</p><p className="text-[10px] text-zinc-500">Daily Model Focus</p></div>
                    </div>
                    <div className="px-3 py-1 bg-[#00c805]/10 rounded-lg text-[10px] font-bold text-[#00c805]">MMXM Model</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PROP FIRM VIEW --- */}
          {view === 'prop' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#00c805]/20 p-3 rounded-full"><ShieldCheck className="w-8 h-8 text-[#00c805]" /></div>
                <div><h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Prop Firm Tracker</h2><p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Account Performance Monitor</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Account Balance</p>
                  <p className="text-4xl font-black text-[#00c805]">$52,340</p>
                  <p className="text-xs text-zinc-400 mt-2">+$2,340 from initial</p>
                </div>
                <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Max Drawdown</p>
                  <p className="text-4xl font-black text-[#ff5000]">-$1,200</p>
                  <p className="text-xs text-zinc-400 mt-2">Limit: -$2,500</p>
                </div>
                <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Win Rate</p>
                  <p className="text-4xl font-black text-[#D4AF37]">68%</p>
                  <p className="text-xs text-zinc-400 mt-2">34W / 16L</p>
                </div>
              </div>
              <div className="bg-[#1e2124] rounded-[32px] p-8 border border-zinc-800">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Daily P&L</h3>
                <div className="flex items-end gap-2 h-40">
                  {[120, -45, 280, 150, -80, 320, 90, -20, 410, 180].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className={`w-full rounded-t-lg ${val >= 0 ? 'bg-[#00c805]' : 'bg-[#ff5000]'}`}
                        style={{ height: `${Math.abs(val) / 4.1}%` }}
                      />
                      <p className="text-[8px] text-zinc-500 mt-1 font-mono">{val > 0 ? '+' : ''}{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- WEALTH & ESTATE VIEWS --- */}
          {(view === 'wealth' || view === 'estate') && (
            <div className="max-w-5xl mx-auto py-10 text-center">
              <Crown className="w-16 h-16 text-[#D4AF37] mx-auto mb-6 animate-pulse" />
              <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4">EMPIRE <span className="text-[#D4AF37]">BUILDER</span></h2>
              <p className="text-zinc-500 font-bold uppercase tracking-[0.5em] text-xs mb-12">The Endgame Strategy</p>

              {view === 'wealth' ? (
                <div className="bg-[#1e2124] rounded-[60px] p-16 border border-zinc-800 shadow-[0_0_60px_rgba(212,175,55,0.1)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="text-left space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Current Net Worth</p>
                        <p className="text-4xl font-black text-white">¥10,000,000</p>
                        <input type="range" className="w-full mt-4 accent-[#D4AF37]" readOnly />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Monthly Injection</p>
                        <p className="text-4xl font-black text-white">¥500,000</p>
                        <input type="range" className="w-full mt-4 accent-[#D4AF37]" readOnly />
                      </div>
                    </div>
                    <div className="bg-black/60 p-12 rounded-[48px] border border-zinc-800 relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Target: ¥500M</p>
                        <p className="text-8xl font-black text-[#D4AF37] tracking-tighter">8.5</p>
                        <p className="text-sm font-bold text-white uppercase tracking-[0.5em]">Years</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/10 to-transparent" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(ESTATE_DATA).map(([city, data]) => (
                    <div key={city} className="bg-[#1e2124] rounded-[48px] p-10 border border-zinc-800 text-left hover:scale-[1.02] transition-transform shadow-2xl group cursor-pointer">
                      <div className="flex justify-between items-start mb-8">
                        <div className="text-6xl">{data.image}</div>
                        <div className="bg-black/40 px-4 py-2 rounded-xl text-center border border-zinc-800">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase">Cap Rate</p>
                          <p className="text-2xl font-black text-[#00c805]">{data.capRate}</p>
                        </div>
                      </div>
                      <h3 className="text-4xl font-black text-white mb-2">{city}</h3>
                      <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-6">{data.hotspot}</p>
                      <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                        <p className="text-sm text-zinc-300 italic font-medium">&quot;{data.trend}&quot;</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* FOOTER: Ticker */}
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
        .grid-cols-20 { grid-template-columns: repeat(20, minmax(0, 1fr)); }
      `}</style>
    </div>
  );
}
