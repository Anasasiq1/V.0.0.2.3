import React, { useState, useMemo } from 'react';
import {
  Store,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  QrCode,
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  Share2,
} from 'lucide-react';
import { Product, PosProductItem, PosTransaction } from '../types';

interface PosTerminalModalProps {
  products: Product[];
  onClose: () => void;
  onUpdateData: (updater: (prev: any) => any) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const PosTerminalModal: React.FC<PosTerminalModalProps> = ({
  products,
  onClose,
  onUpdateData,
  theme = 'light',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<PosProductItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi_qr' | 'card'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCompletedTx, setLastCompletedTx] = useState<PosTransaction | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.enabled === false) return false;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const categoriesList = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoryId));
    return Array.from(cats);
  }, [products]);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0
              ? { ...item, quantity: nextQty, subtotal: nextQty * item.price }
              : null;
          }
          return item;
        })
        .filter(Boolean) as PosProductItem[]
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setCustomerPhone('');
    setCustomerName('');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal - discountAmount + tax);

  const handleCompleteCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      const resp = await fetch('/api/v1/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customer_name: customerName,
          customer_phone: customerPhone,
          payment_method: paymentMethod,
          discount_amount: discountAmount,
        }),
      });

      const res = await resp.json();
      if (res.success && res.transaction) {
        setLastCompletedTx(res.transaction);
        await onUpdateData((prev: any) => ({
          ...prev,
          pos_transactions: [res.transaction, ...(prev.pos_transactions || [])],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* POS Top Header */}
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Store className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Hyperlocal In-Store POS & Cashier Terminal
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                  LIVE
                </span>
              </h2>
              <p className="text-xs text-zinc-500">Fast barcode lookup, instant billing & UPI receipt generator</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* POS Body: 2 Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          {/* LEFT 7 COLS: Catalog & Search */}
          <div className="lg:col-span-7 p-4 flex flex-col space-y-3 overflow-hidden border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            {/* Search & Category Filter */}
            <div className="space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search products by title or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  All Items
                </button>
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize ${
                      selectedCategory === cat
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {cat.replace('cat-', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 rounded-2xl text-left transition-all flex flex-col justify-between group"
                >
                  <div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-xl mb-2"
                    />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2">
                      {product.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      ₹{product.price}
                    </span>
                    <span className="p-1 bg-emerald-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT 5 COLS: Cart & Checkout / Receipt View */}
          <div className="lg:col-span-5 p-4 flex flex-col justify-between overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            {lastCompletedTx ? (
              /* Receipt Modal Simulator */
              <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-dashed border-zinc-300 dark:border-zinc-700">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-1" />
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">Payment Successful</h3>
                    <p className="text-xs font-mono text-zinc-500">{lastCompletedTx.bill_number}</p>
                    <p className="text-[11px] text-zinc-400">{lastCompletedTx.created_at}</p>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {lastCompletedTx.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>
                          {item.name} &times; {item.quantity}
                        </span>
                        <span className="font-semibold">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-dashed border-zinc-300 dark:border-zinc-700 space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal</span>
                      <span>₹{lastCompletedTx.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>GST / Tax</span>
                      <span>₹{lastCompletedTx.tax_amount}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-1">
                      <span>Total Paid ({lastCompletedTx.payment_method.toUpperCase()})</span>
                      <span className="text-emerald-600">₹{lastCompletedTx.total_amount}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print Thermal Receipt
                  </button>
                  <button
                    onClick={() => {
                      setLastCompletedTx(null);
                      clearCart();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Start New Sale
                  </button>
                </div>
              </div>
            ) : (
              /* Current Cart & Payment Checkout */
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" /> Current Sale ({cartItems.length} items)
                    </h3>
                    {cartItems.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs py-8">
                        <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
                        Cart is empty. Tap any product on the left to add.
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div
                          key={item.product_id}
                          className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex-1 pr-2">
                            <p className="font-bold text-zinc-900 dark:text-white">{item.name}</p>
                            <p className="text-zinc-500">₹{item.price} each</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product_id, -1)}
                              className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:bg-zinc-200"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, 1)}
                              className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:bg-zinc-200"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-black text-zinc-900 dark:text-white w-14 text-right">
                              ₹{item.subtotal}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bottom Checkout Controls */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 mt-3 shrink-0">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      placeholder="Customer Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="px-3 py-1.5 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                    />
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="px-3 py-1.5 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                        paymentMethod === 'cash'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" /> Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('upi_qr')}
                      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                        paymentMethod === 'upi_qr'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" /> UPI QR
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                        paymentMethod === 'card'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Card / POS
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Tax (GST 5%)</span>
                      <span>₹{tax}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-1">
                      <span>Payable Amount</span>
                      <span className="text-emerald-600">₹{grandTotal}</span>
                    </div>
                  </div>

                  <button
                    disabled={cartItems.length === 0 || isProcessing}
                    onClick={handleCompleteCheckout}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Transaction...' : `Complete Sale (₹${grandTotal})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
