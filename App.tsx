import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import DiscoveryCard from './components/DiscoveryCard';
import BookingModal from './components/BookingModal';
import ActivityDetailModal from './components/ActivityDetailModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import StructuredData from './components/StructuredData';
import { Tab, VideoInsight, TravelPlan, TrendingTopic, RelatedLink, PersonalInsight } from './types';
import { getTravelInsights, getTrendingTopics, createBudgetOptimizedPlan } from './services/geminiService';

const STORAGE_KEY_PLANS = 'explore_japan_saved_plans';

const MissionHero = ({ onStartPlanner, onReadStory }: { onStartPlanner: () => void, onReadStory: () => void }) => (
  <section className="relative h-[85vh] w-full overflow-hidden mb-20 rounded-[4rem] group shadow-2xl">
    <img
      src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=2000"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[5000ms] ease-out opacity-90"
      alt="Tokyo Night"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-12 lg:p-24">
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-red-600 text-white px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-lg">Helping Partners Realize Dreams</span>
          <span className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.4em] border border-white/20 italic">"Please Use Us" Spirit</span>
        </div>
        <h1 className="text-8xl lg:text-[10rem] font-black text-white leading-[0.75] tracking-tightest uppercase italic mb-8">
          Japan's Heart <br/><span className="text-red-600">Awaits.</span>
        </h1>
        <p className="text-2xl text-gray-300 font-bold max-w-2xl mb-12 uppercase tracking-widest leading-relaxed">
          We aren't here for profit. We're here to bridge your curiosity with authentic beauty. <br/>Your joy is our success.
        </p>
        <div className="flex gap-6">
          <button
            onClick={onStartPlanner}
            className="bg-white text-black px-12 py-6 rounded-3xl font-black text-xl hover:bg-red-600 hover:text-white transition-all shadow-2xl transform hover:-translate-y-1 active:scale-95"
          >
            Start Your Mission
          </button>
          <button
            onClick={onReadStory}
            className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-white/20 transition-all active:scale-95"
          >
            Read Our Story
          </button>
        </div>
      </div>
    </div>
  </section>
);

const OurStory = ({ storyRef }: { storyRef: React.RefObject<HTMLDivElement | null> }) => (
  <section ref={storyRef} className="py-24 px-8 bg-gray-50 rounded-[5rem] mb-20 border border-gray-100 shadow-sm overflow-hidden relative">
    <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/5 rounded-full blur-[120px]" />
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
       <div className="w-full md:w-1/2 space-y-8">
          <div className="bg-red-50 text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase inline-block">The Astoria Perspective</div>
          <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Why We <br/><span className="text-red-600">Built This.</span></h2>
          <div className="prose prose-xl text-gray-600 font-bold italic leading-relaxed">
            <p>From NYC to Tokyo, we saw how much soul is lost in generic guides. We built this as an altruistic bridge for real connection.</p>
            <p>Every dollar we help you save is a dollar we hope you'll spend supporting local Japanese shops and craftsmen.</p>
          </div>
          <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
             <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-red-600 shadow-xl">
                <img src="https://picsum.photos/seed/musashi/200/200" className="w-full h-full object-cover" />
             </div>
             <div>
                <p className="text-sm font-black uppercase tracking-widest text-gray-900">Musashi</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 italic">Founder & Lead Concierge</p>
             </div>
          </div>
       </div>
       <div className="w-full md:w-1/2 grid grid-cols-2 gap-8">
          {[
            { label: 'Partners Helped', val: '150k+', icon: '🤝' },
            { label: 'Saved for Users', val: '$2.4M', icon: '💰' },
            { label: 'Hidden Gems', val: '800+', icon: '💎' },
            { label: 'Smile Rating', val: '98%', icon: '❤️' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 group hover:scale-105 transition-all duration-300">
               <span className="text-4xl mb-4 block group-hover:rotate-12 transition-transform">{stat.icon}</span>
               <p className="text-3xl font-black text-gray-900 mb-1">{stat.val}</p>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
       </div>
    </div>
  </section>
);

const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="py-40 flex flex-col items-center text-center px-4 max-w-2xl mx-auto">
    <div className="text-8xl mb-8 animate-bounce">🏮</div>
    <h2 className="text-5xl font-black uppercase italic mb-6 text-gray-900 tracking-tighter leading-none">
      Spirit <br/><span className="text-red-600">Interrupted.</span>
    </h2>
    <p className="text-xl text-gray-500 font-bold italic mb-12 leading-relaxed">{message}</p>
    <button onClick={onRetry} className="bg-black text-white px-16 py-8 rounded-[3rem] font-black text-2xl hover:bg-red-600 transition-all shadow-2xl uppercase italic active:scale-95">
      Re-light the Path 🤝
    </button>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DISCOVER);
  const [searchQuery, setSearchQuery] = useState('');
  const [insights, setInsights] = useState<VideoInsight[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<TravelPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [liveUsers, setLiveUsers] = useState(1284);
  const [totalSaved, setTotalSaved] = useState(42890);

  const [budget, setBudget] = useState(1500);
  const [priority, setPriority] = useState<'Economy' | 'Joy'>('Joy');
  const [targetAreas, setTargetAreas] = useState('Tokyo, Osaka, Kyoto');

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<{name: string, region: string, personalInsight?: PersonalInsight} | null>(null);
  const [isActivityDetailOpen, setIsActivityDetailOpen] = useState(false);

  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || 'Hidden gems in Tokyo for emotional seekers';
    setSearchQuery(q);
    handleSearchInternal(q);

    getTrendingTopics()
      .then((data) => { if (isMounted) { setTrending(data); setTrendingError(null); } })
      .catch(() => { if (isMounted) setTrendingError("Trending topics could not be loaded."); });

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedPlans(parsed);
      }
    } catch (e) {
      console.error('Failed to load saved plans:', e);
      localStorage.removeItem(STORAGE_KEY_PLANS);
    }

    const interval = setInterval(() => {
      setLiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      setTotalSaved(prev => prev + Math.floor(Math.random() * 5));
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSearchInternal = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTravelInsights(query);
      setInsights(data);
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState({}, '', url.toString());
    } catch (e: any) {
      setError("Our concierge team is busy assisting other partners. Try again soon.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanGeneration = async () => {
    if (budget < 100 || budget > 50000) return;
    setLoading(true);
    setError(null);
    try {
      const plan = await createBudgetOptimizedPlan(budget, priority, targetAreas);
      setItinerary(plan);
      const updatedPlans = [plan, ...savedPlans];
      setSavedPlans(updatedPlans);
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(updatedPlans));
      setActiveTab(Tab.PLANNER);
    } catch (e: any) {
      setError("Failed to architect your dream journey.");
    } finally {
      setLoading(false);
    }
  };

  const navigateInternal = (tab: Tab, q: string) => {
    setActiveTab(tab);
    if (q) {
      setSearchQuery(q);
      handleSearchInternal(q);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openBooking = (itemName: string) => {
    setBookingTarget(itemName);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentTab={activeTab} setTab={setActiveTab} liveUsers={liveUsers} totalSaved={totalSaved} />
      <StructuredData activeTab={activeTab} plan={itinerary} insights={insights} />

      <main className="flex-grow max-w-[1600px] mx-auto px-4 py-8 sm:px-6 lg:px-12 w-full">
        {activeTab === Tab.DISCOVER && (
          <div className="space-y-24 animate-in fade-in duration-700">
            <MissionHero
              onStartPlanner={() => setActiveTab(Tab.PLANNER)}
              onReadStory={scrollToStory}
            />
            <OurStory storyRef={storyRef} />
            <header className="text-center max-w-5xl mx-auto py-20">
              <h1 className="text-8xl lg:text-[12rem] font-black text-gray-900 mb-10 tracking-tightest leading-[0.75] uppercase italic">
                Mission <br/><span className="text-red-600">Scan.</span>
              </h1>
              <form onSubmit={(e) => { e.preventDefault(); handleSearchInternal(searchQuery); }} className="relative max-w-3xl mx-auto group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What is your dream Japan moment?"
                  className="w-full pl-12 pr-48 py-10 bg-gray-50 rounded-[4rem] shadow-2xl border-4 border-transparent text-3xl font-black outline-none focus:border-red-100 transition-all placeholder:text-gray-300"
                />
                <button type="submit" disabled={!searchQuery.trim()} className="absolute right-6 top-6 bottom-6 bg-red-600 text-white px-12 rounded-[3.5rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  Explore
                </button>
              </form>
            </header>
            {loading ? (
              <div className="py-40 flex flex-col items-center">
                 <div className="w-24 h-24 border-8 border-red-50 border-t-red-600 rounded-full animate-spin mb-8" />
                 <p className="text-sm font-black uppercase tracking-widest text-gray-400">Curating Joy...</p>
              </div>
            ) : error ? <ErrorDisplay message={error} onRetry={() => handleSearchInternal(searchQuery)} /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-16 pb-40">
                {insights.map((insight, idx) => (
                  <DiscoveryCard
                    key={idx}
                    insight={insight}
                    onConcierge={openBooking}
                    onShowDetail={() => { setSelectedActivity({ name: insight.name, region: "Japan", personalInsight: insight.personalInsight }); setIsActivityDetailOpen(true); }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === Tab.TRENDING && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-20 pb-40">
             <header className="text-center py-20">
                <h2 className="text-9xl font-black uppercase italic tracking-tighter leading-none mb-4">Viral <br/><span className="text-red-600">Japan.</span></h2>
                <p className="text-xl font-bold text-gray-400 italic">Trends currently moving the community heart.</p>
             </header>
             {trending.length === 0 && trendingError ? (
               <ErrorDisplay message={trendingError} onRetry={() => { setTrendingError(null); getTrendingTopics().then(setTrending).catch(() => setTrendingError("Trending topics could not be loaded.")); }} />
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 {trending.map((topic) => (
                   <div key={topic.id} className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border border-gray-100 group cursor-pointer active:scale-[0.98] transition-all" onClick={() => navigateInternal(Tab.DISCOVER, topic.title)}>
                      <div className="h-64 relative overflow-hidden">
                         <img src={topic.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={topic.title} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                         <div className="absolute bottom-6 left-6 flex items-center gap-2">
                            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">{topic.vibe}</span>
                         </div>
                      </div>
                      <div className="p-10">
                         <h3 className="text-3xl font-black uppercase italic mb-4">{topic.title}</h3>
                         <p className="text-gray-500 font-bold mb-6 italic">{topic.vloggerConsensus}</p>
                         <button className="w-full py-5 bg-gray-50 rounded-2xl font-black uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-all">Explore Trend</button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === Tab.PLANNER && (
          <div className="space-y-12 pb-40 animate-in fade-in duration-700">
             {!itinerary && (
               <div className="py-40 max-w-5xl mx-auto text-center space-y-16">
                 <h2 className="text-9xl font-black uppercase italic tracking-tightest leading-none">Architect <br/><span className="text-red-600">Dreams.</span></h2>
                 <div className="bg-gray-50 rounded-[4rem] p-12 lg:p-20 shadow-xl border border-gray-100 space-y-12">
                    <p className="text-2xl font-bold italic text-gray-500 max-w-2xl mx-auto">"Please use our time. We architect trips to maximize your joy and protection."</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Budget (USD)</label>
                          <input type="number" min={100} max={50000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full p-8 rounded-3xl text-4xl font-black outline-none shadow-inner bg-white border-4 border-transparent focus:border-red-500 transition-all" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Focus</label>
                          <div className="flex bg-white p-2 rounded-3xl shadow-inner h-full items-center">
                             <button onClick={() => setPriority('Joy')} className={`flex-1 py-6 rounded-2xl font-black ${priority === 'Joy' ? 'bg-black text-white' : 'text-gray-400'}`}>JOY</button>
                             <button onClick={() => setPriority('Economy')} className={`flex-1 py-6 rounded-2xl font-black ${priority === 'Economy' ? 'bg-black text-white' : 'text-gray-400'}`}>SAVE</button>
                          </div>
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                            Target Areas
                          </label>
                          <input
                            type="text"
                            value={targetAreas}
                            onChange={(e) => setTargetAreas(e.target.value)}
                            placeholder="e.g. Tokyo, Osaka, Kyoto, Hokkaido"
                            className="w-full p-8 rounded-3xl text-2xl font-black outline-none shadow-inner bg-white border-4 border-transparent focus:border-red-500 transition-all"
                          />
                       </div>
                    </div>
                    <button onClick={handlePlanGeneration} disabled={budget < 100 || budget > 50000} className="w-full bg-red-600 text-white py-10 rounded-[3rem] font-black text-3xl hover:scale-105 transition-all shadow-2xl italic uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">Architect Plan 🤝</button>
                 </div>
               </div>
             )}
             {itinerary && (
               <div className="space-y-16">
                 <div className="flex justify-between items-end">
                    <h2 className="text-7xl font-black uppercase italic">Current Plan</h2>
                    <button onClick={() => setItinerary(null)} className="px-8 py-3 bg-gray-100 rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95">New Architecture</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-black text-white p-12 rounded-[3.5rem] shadow-2xl">
                       <span className="text-[10px] font-black text-gray-500 uppercase block mb-4">Total Value</span>
                       <p className="text-5xl font-black italic tracking-tighter">${itinerary.totalNycEquivalent}</p>
                    </div>
                    <div className="bg-red-600 text-white p-12 rounded-[3.5rem] shadow-2xl">
                       <span className="text-[10px] font-black text-white/60 uppercase block mb-4">Your Savings</span>
                       <p className="text-5xl font-black italic tracking-tighter">${itinerary.totalNycEquivalent - itinerary.estimatedTotal}</p>
                    </div>
                    <div className="bg-gray-50 p-12 rounded-[3.5rem] border border-gray-100 flex flex-col justify-center text-center">
                       <p className="text-sm font-bold italic text-gray-400">"Take those savings and support a local craftsman shop in {itinerary.region}."</p>
                    </div>
                 </div>
                 <div className="space-y-12">
                   {itinerary.itinerary.map((item, i) => (
                     <div key={i} className="bg-white p-10 rounded-[4.5rem] border border-gray-100 shadow-2xl flex flex-col lg:flex-row gap-12 group transition-all hover:border-red-100">
                       <div className="w-full lg:w-1/3 h-[400px] rounded-[3.5rem] overflow-hidden relative cursor-pointer" onClick={() => { setSelectedActivity({ name: item.activity, region: itinerary.region, personalInsight: item.personalInsight }); setIsActivityDetailOpen(true); }}>
                          <img src={`https://picsum.photos/seed/${encodeURIComponent(item.activity)}/800/800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt={item.activity} />
                          <div className="absolute top-8 left-8 bg-white/90 px-6 py-2 rounded-full font-black text-xs uppercase">Day {item.day}</div>
                       </div>
                       <div className="flex-grow flex flex-col justify-center">
                          <h3 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tightest leading-[0.85] mb-8 cursor-pointer hover:text-red-600 transition-colors" onClick={() => { setSelectedActivity({ name: item.activity, region: itinerary.region, personalInsight: item.personalInsight }); setIsActivityDetailOpen(true); }}>{item.activity}</h3>
                          <p className="text-gray-500 font-bold mb-10 text-2xl leading-relaxed italic border-l-8 border-red-50 pl-8">{item.whyFromYoutube}</p>
                          <div className="flex gap-4">
                             <button
                               onClick={() => openBooking(item.activity)}
                               className="flex-grow bg-red-600 text-white py-8 rounded-3xl font-black text-xl uppercase shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
                             >
                               Support & Book ⚡
                             </button>
                          </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === Tab.MY_PLANS && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-20 pb-40">
             <header className="text-center py-20">
                <h2 className="text-9xl font-black uppercase italic tracking-tighter leading-none mb-4">My <br/><span className="text-red-600">Journey.</span></h2>
                <p className="text-xl font-bold text-gray-400 italic">Saved dreams awaiting realization.</p>
             </header>
             {savedPlans.length === 0 ? (
               <div className="text-center py-40 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
                  <p className="text-2xl font-black uppercase italic text-gray-300">No journeys saved yet.</p>
                  <button onClick={() => setActiveTab(Tab.PLANNER)} className="mt-8 px-12 py-5 bg-black text-white rounded-3xl font-black uppercase italic hover:bg-red-600 transition-colors active:scale-95">Start Planning</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {savedPlans.map((plan) => (
                   <div key={plan.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl hover:border-red-600 transition-all cursor-pointer active:scale-[0.99]" onClick={() => { setItinerary(plan); setActiveTab(Tab.PLANNER); }}>
                      <div className="flex justify-between items-start mb-8">
                         <h3 className="text-4xl font-black uppercase italic">{plan.region}</h3>
                         <span className="bg-gray-100 px-4 py-1 rounded-full text-[10px] font-black uppercase">{new Date(plan.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-400 font-bold italic mb-8">5-Day Journey focusing on {plan.priority}</p>
                      <div className="flex justify-between items-center">
                         <div>
                            <span className="text-[10px] font-black text-red-600 uppercase block">Total Savings</span>
                            <p className="text-3xl font-black italic">${plan.totalNycEquivalent - plan.estimatedTotal}</p>
                         </div>
                         <button className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase italic text-sm group-hover:bg-red-600">Open Plan</button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === Tab.PRIVACY && <PrivacyPolicy />}
      </main>

      <footer className="bg-black text-white py-24 px-12 rounded-t-[5rem] mt-40">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-8">
               <h3 className="text-3xl font-black italic tracking-tighter">ExploreJapan<span className="text-red-600">.tube</span></h3>
               <p className="text-gray-500 font-bold italic leading-relaxed">Altruistic AI bridging NYC/Japan connection.</p>
            </div>
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Community Impact</h4>
               <p className="text-4xl font-black">${totalSaved.toLocaleString()}</p>
               <p className="text-[10px] font-black text-gray-500 uppercase">Collective User Travel Savings</p>
            </div>
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Mission Support</h4>
               <p className="text-xs text-gray-500 font-bold italic leading-relaxed">
                 "By supporting this project, you help us stay operational. We are grateful for your partnership."
               </p>
               <button onClick={() => setActiveTab(Tab.PRIVACY)} className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">Privacy & Ethics</button>
            </div>
         </div>
      </footer>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} itemName={bookingTarget} />
      {selectedActivity && (
        <ActivityDetailModal
          isOpen={isActivityDetailOpen}
          onClose={() => setIsActivityDetailOpen(false)}
          activityName={selectedActivity.name}
          region={selectedActivity.region}
          personalInsight={selectedActivity.personalInsight}
          onBook={() => {
            setIsActivityDetailOpen(false);
            setTimeout(() => openBooking(selectedActivity!.name), 300);
          }}
        />
      )}
    </div>
  );
};

export default App;
