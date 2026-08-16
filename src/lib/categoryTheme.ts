export interface CategoryTheme {
  id: string;
  name: string;
  primary: string;
  primaryHex: string;
  secondaryHex: string;
  bgGradient: string;
  lightBg: string;
  borderHex: string;
  textHex: string;
  accentBadgeBg: string;
  accentBadgeText: string;
  ringColor: string;
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  all: {
    id: 'all',
    name: 'All Marketplace',
    primary: 'emerald',
    primaryHex: '#059669',
    secondaryHex: '#10b981',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    lightBg: '#ecfdf5',
    borderHex: '#a7f3d0',
    textHex: '#047857',
    accentBadgeBg: '#d1fae5',
    accentBadgeText: '#065f46',
    ringColor: 'ring-emerald-500',
  },
  'mod-grocery': {
    id: 'mod-grocery',
    name: 'Grocery & Essentials',
    primary: 'emerald',
    primaryHex: '#059669',
    secondaryHex: '#10b981',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #16a34a 100%)',
    lightBg: '#f0fdf4',
    borderHex: '#bbf7d0',
    textHex: '#15803d',
    accentBadgeBg: '#dcfce7',
    accentBadgeText: '#166534',
    ringColor: 'ring-emerald-500',
  },
  'mod-pharmacy': {
    id: 'mod-pharmacy',
    name: 'Pharmacy & Medical',
    primary: 'teal',
    primaryHex: '#0d9488',
    secondaryHex: '#14b8a6',
    bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
    lightBg: '#f0fdfa',
    borderHex: '#99f6e4',
    textHex: '#0f766e',
    accentBadgeBg: '#ccfbf1',
    accentBadgeText: '#115e59',
    ringColor: 'ring-teal-500',
  },
  'mod-shop': {
    id: 'mod-shop',
    name: 'Fashion & Shopping',
    primary: 'rose',
    primaryHex: '#e11d48',
    secondaryHex: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, #e11d48 0%, #e11d48 100%)',
    lightBg: '#fff1f2',
    borderHex: '#fecdd3',
    textHex: '#be123c',
    accentBadgeBg: '#ffe4e6',
    accentBadgeText: '#9f1239',
    ringColor: 'ring-rose-500',
  },
  'mod-food': {
    id: 'mod-food',
    name: 'Food & Restaurants',
    primary: 'orange',
    primaryHex: '#ea580c',
    secondaryHex: '#f97316',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
    lightBg: '#fff7ed',
    borderHex: '#fed7aa',
    textHex: '#c2410c',
    accentBadgeBg: '#ffedd5',
    accentBadgeText: '#9a3412',
    ringColor: 'ring-orange-500',
  },
  'mod-parcel': {
    id: 'mod-parcel',
    name: 'Express Parcel Delivery',
    primary: 'purple',
    primaryHex: '#9333ea',
    secondaryHex: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
    lightBg: '#faf5ff',
    borderHex: '#e9d5ff',
    textHex: '#7e22ce',
    accentBadgeBg: '#f3e8ff',
    accentBadgeText: '#6b21a8',
    ringColor: 'ring-purple-500',
  },
  'mod-electronics': {
    id: 'mod-electronics',
    name: 'Electronics & Mobiles',
    primary: 'indigo',
    primaryHex: '#4f46e5',
    secondaryHex: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
    lightBg: '#eef2ff',
    borderHex: '#c7d2fe',
    textHex: '#4338ca',
    accentBadgeBg: '#e0e7ff',
    accentBadgeText: '#3730a3',
    ringColor: 'ring-indigo-500',
  },
  'mod-meat': {
    id: 'mod-meat',
    name: 'Fresh Meat & Seafood',
    primary: 'red',
    primaryHex: '#dc2626',
    secondaryHex: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    lightBg: '#fef2f2',
    borderHex: '#fecaca',
    textHex: '#b91c1c',
    accentBadgeBg: '#fee2e2',
    accentBadgeText: '#991b1b',
    ringColor: 'ring-red-500',
  },
};

export function getCategoryTheme(moduleId?: string): CategoryTheme {
  if (!moduleId || !CATEGORY_THEMES[moduleId]) {
    return CATEGORY_THEMES['all'];
  }
  return CATEGORY_THEMES[moduleId];
}
