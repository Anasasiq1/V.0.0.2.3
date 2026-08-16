import React, { useState } from 'react';
import { Gift, Copy, Share2, ArrowLeft, Check, Sparkles } from 'lucide-react';

export interface ReferralViewProps {
  phone: string;
  onBack: () => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ phone, onBack }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = phone ? `REF${phone.slice(-6)}` : 'HYPER50';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Hey! Order fresh groceries & essentials in 15 minutes on Hyperlocal Store. Use my code *${referralCode}* to get ₹50 off! ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-black text-slate-900 dark:text-white">Refer & Earn</h1>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-6 text-center space-y-3 shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto text-amber-300 shadow-inner">
          <Gift className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black">Invite Friends & Earn ₹50</h2>
        <p className="text-xs text-purple-100 max-w-xs mx-auto">
          Share your referral code. When your friend places their 1st order, you both get ₹50 reward in your wallet!
        </p>

        {/* Code Box */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/25 flex items-center justify-between max-w-xs mx-auto">
          <div className="text-left">
            <span className="text-[9px] font-extrabold text-purple-200 uppercase tracking-widest block">Your Referral Code</span>
            <span className="text-base font-black tracking-wider">{referralCode}</span>
          </div>

          <button
            onClick={handleCopy}
            className="bg-white text-purple-900 px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 shadow-xs hover:bg-purple-50 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <button
          onClick={handleShareWhatsApp}
          className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-colors"
        >
          <Share2 className="w-4 h-4" /> Share via WhatsApp
        </button>
      </div>

      {/* Rewards Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3">
        <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" /> How It Works
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center shrink-0 text-[10px]">1</span>
            <p className="text-slate-600 dark:text-slate-300">Share your link or code with your friends on WhatsApp.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center shrink-0 text-[10px]">2</span>
            <p className="text-slate-600 dark:text-slate-300">Your friend signs up and gets ₹50 off on their first order.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center shrink-0 text-[10px]">3</span>
            <p className="text-slate-600 dark:text-slate-300">You instantly get ₹50 added to your Hyperlocal Wallet!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
