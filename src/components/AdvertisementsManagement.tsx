import React, { useState } from 'react';
import { Megaphone, Plus, Eye, MousePointer, Calendar, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Advertisement } from '../types';

interface AdvertisementsManagementProps {
  advertisements?: Advertisement[];
  onUpdateData: (updater: (prev: any) => any) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const AdvertisementsManagement: React.FC<AdvertisementsManagementProps> = ({
  advertisements = [],
  onUpdateData,
  theme = 'light',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [placement, setPlacement] = useState<any>('home_hero');
  const [storeName, setStoreName] = useState('');

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !bannerImage) return;

    const newAd: Advertisement = {
      id: 'ad-' + Date.now().toString(36),
      title: title.trim(),
      store_name: storeName.trim() || undefined,
      banner_image: bannerImage.trim(),
      target_type: 'store',
      placement: placement,
      priority: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      impressions_count: 0,
      clicks_count: 0,
      status: 'active',
    };

    await onUpdateData((prev: any) => ({
      ...prev,
      advertisements: [newAd, ...(prev.advertisements || [])],
    }));

    setShowAddModal(false);
    setTitle('');
    setBannerImage('');
    setStoreName('');
  };

  const totalImpressions = advertisements.reduce((acc, ad) => acc + (ad.impressions_count || 0), 0);
  const totalClicks = advertisements.reduce((acc, ad) => acc + (ad.clicks_count || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
              <Megaphone className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Advertisements & Sponsored Banners</h2>
              <p className="text-xs text-zinc-500">
                Run merchant ad campaigns, home hero carousels, and track live CTR conversion metrics.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Ad Campaign
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Impressions</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
            {totalImpressions.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Clicks</span>
            <MousePointer className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
            {totalClicks.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Average Click-Through Rate (CTR)</span>
            <Megaphone className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
            {avgCtr}%
          </p>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advertisements.map((ad) => (
          <div
            key={ad.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800">
              <img src={ad.banner_image} alt={ad.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 bg-black/70 text-white rounded-full backdrop-blur-sm">
                {ad.placement.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{ad.title}</h4>
                {ad.store_name && <p className="text-xs text-zinc-500">Sponsored by {ad.store_name}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                <div>
                  <span className="text-[11px] text-zinc-400">Views</span>
                  <p className="font-bold text-zinc-900 dark:text-white">{ad.impressions_count.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400">Clicks</span>
                  <p className="font-bold text-zinc-900 dark:text-white">{ad.clicks_count.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400">CTR</span>
                  <p className="font-bold text-emerald-600">
                    {ad.impressions_count > 0 ? ((ad.clicks_count / ad.impressions_count) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE AD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Create Advertisement Campaign</h3>
            <form onSubmit={handleCreateAd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monsoon Biryani Feast 20% OFF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Banner Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Placement Slot</label>
                  <select
                    value={placement}
                    onChange={(e: any) => setPlacement(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="home_hero">Home Hero Carousel</option>
                    <option value="category_top">Category Top Banner</option>
                    <option value="market_deal">Market Deals Section</option>
                    <option value="checkout_footer">Checkout Footer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Sponsor Store Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ajmeeri Restaurant"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
