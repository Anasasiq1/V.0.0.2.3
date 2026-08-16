import React, { useState } from 'react';
import {
  Truck,
  Bike,
  Plus,
  Phone,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { DeliveryBoy } from '../types';

interface DeliveryFleetManagementProps {
  riders?: DeliveryBoy[];
  onUpdateData: (updater: (prev: any) => any) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const DeliveryFleetManagement: React.FC<DeliveryFleetManagementProps> = ({
  riders = [],
  onUpdateData,
  theme = 'light',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'bike' | 'scooter' | 'van' | 'electric_scooter'>('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [assignedStore, setAssignedStore] = useState('');

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      const resp = await fetch('/api/v1/delivery/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          assigned_store_name: assignedStore,
        }),
      });
      const res = await resp.json();
      if (res.success && res.rider) {
        await onUpdateData((prev: any) => ({
          ...prev,
          delivery_riders: [res.rider, ...(prev.delivery_riders || [])],
        }));
        setShowAddModal(false);
        setName('');
        setPhone('');
        setVehicleNumber('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (riderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'online' ? 'offline' : currentStatus === 'offline' ? 'online' : 'online';
    try {
      await fetch(`/api/v1/delivery/riders/${riderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      await onUpdateData((prev: any) => ({
        ...prev,
        delivery_riders: (prev.delivery_riders || []).map((r: any) =>
          r.id === riderId ? { ...r, status: nextStatus } : r
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const onlineRiders = riders.filter((r) => r.status === 'online' || r.status === 'busy');
  const totalDeliveriesAll = riders.reduce((acc, r) => acc + (r.total_deliveries || 0), 0);
  const totalCashCollected = riders.reduce((acc, r) => acc + (r.cash_in_hand || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Delivery Fleet & Rider Dispatch</h2>
              <p className="text-xs text-zinc-500">
                Manage hyperlocal delivery partners, live online/offline duty status, and COD cash settlements.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Register Delivery Partner
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Riders On Duty</span>
            <Bike className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
            {onlineRiders.length} <span className="text-xs font-normal text-zinc-400">/ {riders.length} total</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Available for auto-assignment</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Completed Deliveries</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
            {totalDeliveriesAll.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Fleet lifetime fulfillment</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Unsettled Cash in Hand (COD)</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
            ₹{totalCashCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Awaiting bank/store deposit</p>
        </div>
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riders.map((rider) => (
          <div
            key={rider.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{rider.name}</h4>
                <p className="text-xs text-zinc-500 capitalize">{rider.vehicle_type.replace('_', ' ')} &bull; {rider.vehicle_number || 'No plate set'}</p>
              </div>

              <button
                onClick={() => handleToggleStatus(rider.id, rider.status)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                  rider.status === 'online'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : rider.status === 'busy'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {rider.status.toUpperCase()}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
              <div>
                <span className="text-zinc-400 text-[11px]">Today Deliveries</span>
                <p className="font-bold text-zinc-900 dark:text-white">{rider.today_deliveries} orders</p>
              </div>
              <div>
                <span className="text-zinc-400 text-[11px]">Rating</span>
                <p className="font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> {rider.rating}
                </p>
              </div>
              <div>
                <span className="text-zinc-400 text-[11px]">Rider Wallet</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">₹{rider.wallet_balance}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-[11px]">COD Cash</span>
                <p className="font-bold text-amber-600 dark:text-amber-400">₹{rider.cash_in_hand}</p>
              </div>
            </div>

            {rider.current_location && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{rider.current_location.address_name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <a
                href={`tel:${rider.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
              <a
                href={`https://wa.me/${rider.whatsapp_phone || rider.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ADD RIDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Register New Delivery Partner</h3>
            <form onSubmit={handleCreateRider} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Rider Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Varma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9847123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e: any) => setVehicleType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="bike">Motorcycle / Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="electric_scooter">Electric Scooter</option>
                    <option value="van">Delivery Van</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="e.g. KL-55-AB-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Assigned Store / Zone (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ajmeeri Restaurant or Town Pool"
                  value={assignedStore}
                  onChange={(e) => setAssignedStore(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
