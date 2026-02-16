import React, { useEffect, useState } from 'react';
import { getActivityDetails, generateAestheticImage } from '../services/geminiService';
import { PersonalInsight } from '../types';

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityName: string;
  region: string;
  personalInsight?: PersonalInsight;
  onBook?: () => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  onClose,
  activityName,
  region,
  personalInsight,
  onBook
}) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [details, setDetails] = useState<{ text: string; mapsLink?: string } | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && activityName) {
      setLoading(true);
      setError(false);
      setAiImage(null);
      setGenerating(true);

      getActivityDetails(activityName, region)
        .then(res => {
          setDetails(res);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setError(true);
        });

      generateAestheticImage(activityName)
        .then(imgUrl => {
          setAiImage(imgUrl);
          setGenerating(false);
        })
        .catch(() => setGenerating(false));
    }
  }, [isOpen, activityName, region]);

  const retryDetails = () => {
    setError(false);
    setLoading(true);
    getActivityDetails(activityName, region)
      .then(res => {
        setDetails(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[150] flex items-center justify-center p-0 md:p-12 overflow-hidden" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white w-full h-full md:rounded-[5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-500 flex flex-col md:flex-row max-h-screen" onClick={(e) => e.stopPropagation()}>

        {/* Visual Showcase */}
        <div className="w-full md:w-[60%] bg-gray-900 relative overflow-hidden h-[45vh] md:h-auto group">
          {generating ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <img
              src={aiImage || `https://picsum.photos/seed/${encodeURIComponent(activityName)}/1600/1600`}
              className="w-full h-full object-cover transition-all duration-[2s]"
              alt={activityName}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <button onClick={onClose} className="absolute top-12 left-12 z-40 p-6 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] text-white hover:bg-white/30 transition-all shadow-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="absolute bottom-16 left-16 right-16 z-20">
            <h3 className="text-7xl lg:text-[10rem] font-black text-white leading-[0.7] tracking-tightest uppercase italic mb-8">{activityName}</h3>
            <div className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xl italic inline-block shadow-lg">Curated Joy-Discovery</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow p-12 md:p-24 overflow-y-auto custom-scrollbar bg-white">
          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 border-[10px] border-red-50 border-t-red-600 rounded-full animate-spin mb-8" />
              <p className="text-sm font-black uppercase tracking-widest text-gray-400 italic">Exploring Japan's heart...</p>
            </div>
          ) : error ? (
            <div className="flex-grow flex flex-col items-center justify-center h-full text-center px-4">
              <p className="text-2xl font-black uppercase italic text-gray-900 mb-8">Details could not be loaded.</p>
              <button onClick={retryDetails} className="bg-red-600 text-white px-12 py-6 rounded-3xl font-black uppercase hover:bg-red-700 transition-colors active:scale-95">
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-4">Concierge Verdict</span>
                <p className="text-3xl font-black text-gray-900 leading-tight italic mb-4">
                  "We exist to handle the friction, so you can focus on the feeling. Please use our intelligence for your peace of mind."
                </p>
              </div>

              {personalInsight && (
                <section className="bg-black text-white p-12 rounded-[3.5rem] shadow-2xl relative">
                  <span className="px-4 py-1 bg-red-600 rounded-full text-[10px] font-black uppercase mb-6 inline-block">Joy-Protection</span>
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase block mb-1 tracking-widest">Potential Stress</span>
                      <p className="text-2xl font-black italic">"{personalInsight.problem}"</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-red-500 uppercase block mb-1 tracking-widest">Our Solution</span>
                      <p className="text-xl font-bold italic text-gray-300">{personalInsight.solution}</p>
                    </div>
                  </div>
                </section>
              )}

              <section className="prose prose-xl text-gray-700 italic leading-relaxed font-medium">
                {details?.text}
              </section>

              <div className="flex flex-col gap-6 pt-12 border-t border-gray-100">
                <button
                  onClick={onBook}
                  className="w-full bg-red-600 text-white py-10 rounded-[3.5rem] font-black text-3xl hover:scale-105 transition-all shadow-2xl uppercase italic transform active:scale-95"
                >
                  Secure journey & Support our mission 🤝
                </button>
                <div className="text-center space-y-4">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic px-12">
                    "Your booking helps us continue finding hidden gems for everyone. We are grateful for your partnership."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;
