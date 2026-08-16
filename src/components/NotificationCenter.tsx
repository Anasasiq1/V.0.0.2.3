import React, { useState } from 'react';
import { Bell, Package, Tag, ArrowLeft, CheckCheck } from 'lucide-react';

export interface NotificationCenterProps {
  onBack: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'orders' | 'offers'>('all');

  const notifications = [
    {
      id: 'n-1',
      type: 'orders',
      title: 'Order Placed Successfully!',
      message: 'Your order #ORD-9821 has been placed and is being prepared.',
      time: '10 mins ago',
      read: false,
    },
    {
      id: 'n-2',
      type: 'offers',
      title: '⚡ Flash Sale 30% OFF',
      message: 'Get 30% discount on all fresh organic vegetables today.',
      time: '2 hours ago',
      read: true,
    },
    {
      id: 'n-3',
      type: 'orders',
      title: 'Order Delivered 🎉',
      message: 'Order #ORD-9800 was delivered to your address.',
      time: 'Yesterday',
      read: true,
    },
  ];

  const filtered = notifications.filter((n) => activeFilter === 'all' || n.type === activeFilter);

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-black text-slate-900 dark:text-white">Notification Center</h1>
        </div>

        <button className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer">
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'orders', 'offers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize cursor-pointer transition-colors ${
              activeFilter === tab
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl border transition-colors flex items-start gap-3 ${
              !item.read
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/60'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
              {item.type === 'orders' ? <Package className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">{item.title}</h4>
                <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{item.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
