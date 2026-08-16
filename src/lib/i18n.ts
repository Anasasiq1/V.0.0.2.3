import { useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'ml' | 'hi' | 'ar';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', dir: 'rtl' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    'app.deliverTo': 'Deliver To',
    'app.searchPlaceholder': 'Search products, stores & categories...',
    'app.allCategories': 'All Categories',
    'app.nearbyStores': 'Nearby Stores',
    'app.popularProducts': 'Popular Products',
    'app.trendingNow': 'Trending Now',
    'app.shopByCategories': 'Shop By Categories',
    'app.viewAll': 'View All',
    'app.addToCart': 'ADD',
    'app.itemsInCart': 'items',
    'app.viewCart': 'View Cart',
    'app.myOrders': 'My Orders',
    'app.account': 'Account',
    'app.home': 'Home',
    'app.categories': 'Categories',
    'app.stores': 'Stores',
    'app.offers': 'Offers',
    'app.cart': 'Cart',
    'app.checkout': 'Proceed to Checkout',
    'app.wishlist': 'Wishlist',
    'app.savedForLater': 'Saved For Later',
    'app.wallet': 'Wallet & Coins',
    'app.referAndEarn': 'Refer & Earn',
    'app.notifications': 'Notifications',
    'app.language': 'Language',
    'app.darkMode': 'Dark Mode',
    'app.lightMode': 'Light Mode',
    'app.openNow': 'Open Now',
    'app.closedNow': 'Closed Now',
    'app.mins': 'mins',
    'app.freeDelivery': 'Free Delivery',
  },
  ml: {
    'app.deliverTo': 'ഡെലിവറി വിലാസം',
    'app.searchPlaceholder': 'ഉൽപ്പന്നങ്ങൾ, സ്റ്റോറുകൾ തിരയുക...',
    'app.allCategories': 'എല്ലാ വിഭാഗങ്ങളും',
    'app.nearbyStores': 'സമീപമുള്ള സ്റ്റോറുകൾ',
    'app.popularProducts': 'ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ',
    'app.trendingNow': 'ട്രെൻഡിംഗ്',
    'app.shopByCategories': 'വിഭാഗങ്ങൾ പ്രകാരം ഷോപ്പ് ചെയ്യുക',
    'app.viewAll': 'എല്ലാം കാണുക',
    'app.addToCart': 'ചേർക്കുക',
    'app.itemsInCart': 'ഐറ്റങ്ങൾ',
    'app.viewCart': 'കാർട്ട് കാണുക',
    'app.myOrders': 'എന്റെ ഓർഡറുകൾ',
    'app.account': 'അക്കൗണ്ട്',
    'app.home': 'ഹോം',
    'app.categories': 'വിഭാഗങ്ങൾ',
    'app.stores': 'സ്റ്റോറുകൾ',
    'app.offers': 'ഓഫറുകൾ',
    'app.cart': 'കാർട്ട്',
    'app.checkout': 'ചെക്ക്ഔട്ട് ചെയ്യുക',
    'app.wishlist': 'വിഷ്‌ലിസ്റ്റ്',
    'app.savedForLater': 'പിന്നീടത്തേക്ക് മാറ്റിവെച്ചവ',
    'app.wallet': 'വാലറ്റും കോയിനുകളും',
    'app.referAndEarn': 'റഫർ ചെയ്ത് നേടാം',
    'app.notifications': 'അറിയിപ്പുകൾ',
    'app.language': 'ഭാഷ',
    'app.darkMode': 'ഡാർക്ക് മോഡ്',
    'app.lightMode': 'ലൈറ്റ് മോഡ്',
    'app.openNow': 'ഇപ്പോൾ തുറന്നിരിക്കുന്നു',
    'app.closedNow': 'ഇപ്പോൾ അടച്ചിരിക്കുന്നു',
    'app.mins': 'മിനിറ്റ്',
    'app.freeDelivery': 'സൗജന്യ ഡെലിവറി',
  },
  hi: {
    'app.deliverTo': 'डिलीवरी का पता',
    'app.searchPlaceholder': 'उत्पाद, स्टोर या श्रेणियां खोजें...',
    'app.allCategories': 'सभी श्रेणियां',
    'app.nearbyStores': 'आस-पास के स्टोर',
    'app.popularProducts': 'लोकप्रिय उत्पाद',
    'app.trendingNow': 'ट्रेंडिंग उत्पाद',
    'app.shopByCategories': 'श्रेणियों के अनुसार खरीदें',
    'app.viewAll': 'सभी देखें',
    'app.addToCart': 'जोड़ें',
    'app.itemsInCart': 'आइटम',
    'app.viewCart': 'कार्ट देखें',
    'app.myOrders': 'मेरे ऑर्डर',
    'app.account': 'अकाउंट',
    'app.home': 'होम',
    'app.categories': 'श्रेणियां',
    'app.stores': 'स्टोर',
    'app.offers': 'ऑफ़र',
    'app.cart': 'कार्ट',
    'app.checkout': 'चेकआउट करें',
    'app.wishlist': 'विशलिस्ट',
    'app.savedForLater': 'बाद के लिए सहेजा गया',
    'app.wallet': 'वॉलेट और कॉइन्स',
    'app.referAndEarn': 'रेफर करें और कमाएं',
    'app.notifications': 'सूचनाएं',
    'app.language': 'भाषा',
    'app.darkMode': 'डार्क मोड',
    'app.lightMode': 'लाइट मोड',
    'app.openNow': 'अभी खुला है',
    'app.closedNow': 'अभी बंद है',
    'app.mins': 'मिनट',
    'app.freeDelivery': 'मुफ्त डिलीवरी',
  },
  ar: {
    'app.deliverTo': 'التوصيل إلى',
    'app.searchPlaceholder': 'ابحث عن المنتجات والالمتاجر والمتاجر...',
    'app.allCategories': 'جميع الفئات',
    'app.nearbyStores': 'المتاجر القريبة',
    'app.popularProducts': 'المنتجات الشائعة',
    'app.trendingNow': 'المنتجات الأكثر طلباً',
    'app.shopByCategories': 'تسوق حسب الفئة',
    'app.viewAll': 'عرض الكل',
    'app.addToCart': 'إضافة',
    'app.itemsInCart': 'عناصر',
    'app.viewCart': 'عرض السلة',
    'app.myOrders': 'طلباتي',
    'app.account': 'الحساب',
    'app.home': 'الرئيسية',
    'app.categories': 'الفئات',
    'app.stores': 'المتاجر',
    'app.offers': 'العروض',
    'app.cart': 'السلة',
    'app.checkout': 'إتمام الطلب',
    'app.wishlist': 'قائمة الرغبات',
    'app.savedForLater': 'محفوظ لوقت لاحق',
    'app.wallet': 'المحفظة والعملات',
    'app.referAndEarn': 'دعوة الأصدقاء والربح',
    'app.notifications': 'الإشعارات',
    'app.language': 'اللغة',
    'app.darkMode': 'الوضع الداكن',
    'app.lightMode': 'الوضع الفاتح',
    'app.openNow': 'مفتوح الآن',
    'app.closedNow': 'مغلق الآن',
    'app.mins': 'دقيقة',
    'app.freeDelivery': 'توصيل مجاني',
  },
};

export function useI18n() {
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem('hyperlocal_lang') as LanguageCode) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('hyperlocal_lang', lang);
    const selected = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.dir = selected?.dir || 'ltr';
  }, [lang]);

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return { lang, setLang, t, languages: LANGUAGES };
}
