import React from 'react';
import { Wallet, Sparkles, ArrowDownRight, ArrowUpRight, History, ArrowLeft } from 'lucide-react';

export interface WalletViewProps {
  onBack: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onBack }) => {
  const transactions = [
    { id: 'tx-1', title: 'Sign up Welcome Reward', type: 'credit', amount: 100, date: 'Today, 11:30 AM' },
    { id: 'tx-2', title: 'Order #ORD-9821 Cashback', type: 'credit', amount: 50, date: 'Yesterday' },
  ];

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-black text-slate-900 dark:text-white">Wallet & Reward Coins</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-4 shadow-lg space-y-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block">Wallet Balance</span>
            <span className="text-xl font-black">₹150.00</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-4 shadow-lg space-y-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-100" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider block">HyperCoins</span>
            <span className="text-xl font-black">150 Coins</span>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-extrabold text-xs">
          <History className="w-4 h-4 text-emerald-600" />
          <span>Recent Activity</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{tx.title}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{tx.date}</span>
                </div>
              </div>

              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                + ₹{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
