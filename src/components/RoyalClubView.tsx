import React, { useState } from 'react';
import { Crown, Sparkles, Truck, Gift, ArrowLeft, CheckCircle2, Zap } from 'lucide-react';
import { StoreSettings } from '../types';

export interface RoyalClubViewProps {
  onBack: () => void;
  onNavigateTab?: (tab: string) => void;
  settings?: StoreSettings;
}

export const RoyalClubView: React.FC<RoyalClubViewProps> = ({ onBack, onNavigateTab, settings }) => {
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const rcConfig = settings?.royal_club_settings;
  const monthlyPrice = rcConfig?.monthly_price ?? 39;
  const yearlyPrice = rcConfig?.yearly_price ?? 299;
  const currency = rcConfig?.currency || 'QAR';
  const freeTrialEnabled = rcConfig?.enable_free_trial !== false;
  const trialDays = rcConfig?.trial_days || 30;
  const heroTitle = rcConfig?.hero_title || 'Get Endless Free Delivery';
  const heroSubtitle =
    rcConfig?.hero_subtitle ||
    'Experience the pinnacle of convenience with zero delivery fees and exclusive VIP dining privileges.';
  const badgeText = rcConfig?.badge_text || '★ FREE TRIAL';

  const defaultPerks = [
    {
      icon: <Truck className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      title: 'Endless Free Delivery',
      desc: 'Free delivery on thousands of top restaurants, supermarkets & market brands with no minimum order.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      title: 'Double Reward Coins (2X)',
      desc: 'Earn 2X reward points on every order across food, grocery, and local market.',
    },
    {
      icon: <Gift className="w-5 h-5 text-purple-500" />,
      title: 'Exclusive Member Discounts',
      desc: 'Up to 30% extra off on curated menus, weekly flash sales, and early access to deals.',
    },
    {
      icon: <Zap className="w-5 h-5 text-indigo-500" />,
      title: 'Priority VIP Delivery',
      desc: 'Your orders get expedited kitchen preparation and express rider allocation.',
    },
  ];

  const perks =
    rcConfig?.perks && rcConfig.perks.length > 0
      ? rcConfig.perks
          .filter((p) => p.enabled !== false)
          .map((p) => ({
            icon:
              p.icon === 'Truck' ? (
                <Truck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              ) : p.icon === 'Sparkles' ? (
                <Sparkles className="w-5 h-5 text-amber-500" />
              ) : p.icon === 'Gift' ? (
                <Gift className="w-5 h-5 text-purple-500" />
              ) : (
                <Zap className="w-5 h-5 text-indigo-500" />
              ),
            title: p.title,
            desc: p.desc,
          }))
      : defaultPerks;

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500" /> Royal Club VIP
            </h1>
            <p className="text-xs text-slate-500 font-medium">Endless Perks & Free Delivery</p>
          </div>
        </div>

        {freeTrialEnabled && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow-xs">
            {badgeText}
          </span>
        )}
      </div>

      {/* Hero VIP Card */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-5 border border-purple-800/40 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-black tracking-wider uppercase text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              <Crown className="w-3.5 h-3.5 fill-amber-400" /> Elite Membership
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">{heroTitle}</h2>
            <p className="text-xs text-slate-300 max-w-[260px] leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-lg font-black shrink-0">
            <Crown className="w-6 h-6 fill-slate-950" />
          </div>
        </div>

        {/* Free Trial Button */}
        {freeTrialEnabled && (
          <div className="relative z-10 pt-2">
            {isTrialActive ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between text-emerald-300">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Royal Club Trial is Active ({trialDays} Days Left)</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsTrialActive(true)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-sm rounded-full shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer text-center"
              >
                Start {trialDays}-Day Free Trial
              </button>
            )}
          </div>
        )}

        {/* Background glow */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      </div>

      {/* Perks List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          Membership Privileges
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {perks.map((perk, idx) => (
            <div key={idx} className="py-3 flex items-start gap-3.5 first:pt-1 last:pb-1">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5">
                {perk.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{perk.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Membership Plans */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          Select Membership Plan
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedPlan === 'monthly'
                ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Monthly</span>
            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {monthlyPrice} {currency} <span className="text-[10px] font-normal text-slate-400">/mo</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Cancel anytime</span>
          </button>

          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedPlan === 'yearly'
                ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <span className="absolute -top-2 right-2 bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
              SAVE 35%
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Annual Pass</span>
            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {yearlyPrice} {currency} <span className="text-[10px] font-normal text-slate-400">/yr</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
              {(yearlyPrice / 12).toFixed(1)} {currency} / month
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

