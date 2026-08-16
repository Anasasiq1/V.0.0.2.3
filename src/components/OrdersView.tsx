import React from 'react';
import { Order } from '../types';
import { Package, Clock, MessageSquare, LogOut, PhoneCall } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  phone: string;
  onOpenLinkModal?: () => void;
  onUnlinkAccount?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  phone,
  onOpenLinkModal,
  onUnlinkAccount,
}) => {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

  // STRICT ORDER DATA ISOLATION:
  // If phone is missing, userOrders is empty ([]). NEVER return global orders to unlinked users!
  const userOrders = cleanPhone
    ? orders.filter((o) => {
        const orderPhone = (o.customer_phone || '').replace(/[^0-9]/g, '');
        if (!orderPhone) return false;
        return (
          orderPhone === cleanPhone ||
          orderPhone.endsWith(cleanPhone) ||
          cleanPhone.endsWith(orderPhone)
        )
      })
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Order Placed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-[70vh] pb-24">
      {/* Header Bar with Account Status */}
      <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600 shrink-0" /> My WhatsApp Orders
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Customer-scoped order tracker</p>
        </div>

        {cleanPhone ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl" dir="ltr">
              +{cleanPhone}
            </span>
            {onUnlinkAccount && (
              <button
                type="button"
                onClick={onUnlinkAccount}
                title="Switch / Unlink Account"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          onOpenLinkModal && (
            <button
              type="button"
              onClick={onOpenLinkModal}
              className="text-xs font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Link Phone</span>
            </button>
          )
        )}
      </div>

      {/* Unlinked Phone Empty Guard */}
      {!cleanPhone ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base mb-1">
              വാട്സാപ്പ് ബന്ധിപ്പിച്ചിട്ടില്ല (WhatsApp Not Linked)
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
              നിങ്ങളുടെ ഓർഡർ ഹിസ്റ്ററിയും ലൈവ് ഡെലിവറി സ്റ്റാറ്റസും സുരക്ഷിതമായി കാണാൻ വാട്സാപ്പ് നമ്പർ ലിങ്ക് ചെയ്യുക.
            </p>
          </div>
          {onOpenLinkModal && (
            <button
              type="button"
              onClick={onOpenLinkModal}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🔗 Link Your WhatsApp Number</span>
            </button>
          )}
        </div>
      ) : userOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xs p-6">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-sm mb-1">No orders found for +{cleanPhone}</h3>
          <p className="text-xs text-slate-500 font-medium">Your placed orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userOrders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3 text-start"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <div className="font-black text-slate-900 text-xs" dir="ltr">{order.order_id}</div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    {new Date(order.order_time).toLocaleString()}
                  </div>
                  {order.store_name && (
                    <span className="inline-block mt-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      🏪 {order.store_name}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Delivery Slot Badge if available */}
              {order.delivery_slot_time && (
                <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl w-fit border border-emerald-200/80">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span dir="auto">ഡെലിവറി സമയം: {order.delivery_slot_time}</span>
                </div>
              )}

              {/* Items Summary */}
              <div className="text-xs font-semibold text-slate-600 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span dir="auto">
                      {item.qty}x {item.name}
                    </span>
                    <span className="font-bold text-slate-800 shrink-0 ml-2" dir="ltr">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-500 italic" dir="auto">
                  Note: {order.notes}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-black">
                <span className="text-slate-500">Total Amount</span>
                <span className="text-emerald-600 text-sm" dir="ltr">₹{order.total_amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
