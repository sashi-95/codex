import React from 'react';
import { VideoInsight } from '../types';

interface DiscoveryCardProps {
  insight: VideoInsight;
  onConcierge: (target: string) => void;
  onShowDetail?: () => void;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ insight, onConcierge, onShowDetail }) => {
  const title = insight.name;
  const isAgency = insight.monetization?.type === 'agency';

  // Dynamic pricing from AI data
  const nycCost = insight.nycEquivalentCost || 100;
  const jpCost = insight.monetization?.estimated_spend || 25;
  const multiplier = jpCost > 0 ? Math.floor(nycCost / jpCost) : 3;

  return (
    <div
      onClick={onShowDetail}
      className={`relative group rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 h-[650px] cursor-pointer hover:scale-[1.02] border-4 ${isAgency ? 'border-red-600/30' : 'border-white'}`}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={`https://picsum.photos/seed/${encodeURIComponent(title)}/800/1200`}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10" />
      </div>

      <div className="absolute top-8 right-8 z-30 flex flex-col gap-3 items-end">
        <div className="px-6 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-tighter rounded-full shadow-2xl">
          ${jpCost.toFixed(2)} (<span className="text-yellow-300">Save {multiplier}x NYC</span>)
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 p-10 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl mb-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">Altruistic Pick</span>
          <p className="text-white font-bold italic text-sm">
            We handpicked this for you. Save ${nycCost - jpCost} compared to NYC Manhattan prices.
          </p>
        </div>

        <h3 className="text-5xl font-black text-white mb-4 tracking-tightest leading-[0.85] uppercase italic transition-all group-hover:not-italic">
          {title}
        </h3>

        <p className="text-gray-300 text-sm font-bold line-clamp-2 mb-8 max-w-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 delay-100">
          {insight.reason}
        </p>

        <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 delay-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConcierge(title);
            }}
            className="w-full py-5 bg-white text-black rounded-3xl font-black text-sm uppercase shadow-2xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
          >
            {isAgency ? 'Request Concierge Assistance' : 'Secure Journey & Support Us'}
          </button>
          <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mt-4 text-center">
            Using our partner links helps our mission stay free.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryCard;
