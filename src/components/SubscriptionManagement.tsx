import React, { useState } from 'react';
import { Crown, Check, Plus, Edit2, ShieldCheck, Sparkles, Building2, Calendar } from 'lucide-react';
import { SubscriptionPlan, StoreSubscription, VendorStore } from '../types';

interface SubscriptionManagementProps {
  plans?: SubscriptionPlan[];
  storeSubscriptions?: StoreSubscription[];
  stores?: VendorStore[];
  onUpdateData: (updater: (prev: any) => any) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  plans = [],
  storeSubscriptions = [],
  stores = [],
  onUpdateData,
  theme = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'assignments'>('plans');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <Crown className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Merchant Subscriptions & SaaS Tiers</h2>
              <p className="text-xs text-zinc-500">
                Monetize store onboarding, set monthly fees, product inventory limits, and order commission rates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
                activeTab === 'plans'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Subscription Plans ({plans.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
                activeTab === 'assignments'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Active Store Subscriptions ({storeSubscriptions.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PLANS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-zinc-900 rounded-3xl p-6 border flex flex-col justify-between relative shadow-sm ${
                plan.is_popular
                  ? 'border-amber-500 dark:border-amber-500 shadow-amber-500/10'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-6 text-[10px] font-bold px-3 py-1 rounded-full ${
                    plan.is_popular
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black text-zinc-900 dark:text-white">
                      {plan.price_monthly === 0 ? 'Free' : `₹${plan.price_monthly}`}
                    </span>
                    {plan.price_monthly > 0 && <span className="text-xs text-zinc-400">/ month</span>}
                  </div>
                  {plan.price_yearly > 0 && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      or ₹{plan.price_yearly} / year (Save 15%)
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Max Products</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{plan.max_products.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Max Monthly Orders</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{plan.max_orders_per_month.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Platform Commission</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{plan.commission_rate_percent}%</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Features</span>
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-colors">
                  Edit Plan Rules
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ACTIVE STORE SUBSCRIPTIONS */}
      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3 font-semibold">Store</th>
                <th className="p-3 font-semibold">Current Plan</th>
                <th className="p-3 font-semibold">Billing Cycle</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Current Period</th>
                <th className="p-3 font-semibold">Auto-Renew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {storeSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="p-3 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    {sub.store_name}
                  </td>
                  <td className="p-3 font-semibold text-amber-600 dark:text-amber-400">{sub.plan_name}</td>
                  <td className="p-3 capitalize">{sub.billing_cycle}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                      {sub.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-500">
                    {sub.current_period_start} to {sub.current_period_end}
                  </td>
                  <td className="p-3 text-emerald-600 font-semibold">{sub.auto_renew ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
