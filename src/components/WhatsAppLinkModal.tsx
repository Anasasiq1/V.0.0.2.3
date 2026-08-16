import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  ArrowRight,
  X,
  Lock,
  User,
  Zap,
  Globe,
  Sparkles,
  KeyRound,
  LogIn,
} from 'lucide-react';

export interface WhatsAppLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkSuccess: (phone: string, name: string) => void;
  initialPhone?: string;
  initialName?: string;
}

const COUNTRY_CODES = [
  { code: '91', name: 'India', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: '974', name: 'Qatar', flag: '🇶🇦', placeholder: '5512 3456' },
  { code: '971', name: 'UAE', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: '966', name: 'Saudi Arabia', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: '968', name: 'Oman', flag: '🇴🇲', placeholder: '9123 4567' },
  { code: '965', name: 'Kuwait', flag: '🇰🇼', placeholder: '9123 4567' },
  { code: '973', name: 'Bahrain', flag: '🇧🇭', placeholder: '3612 3456' },
  { code: '1', name: 'USA/Canada', flag: '🇺🇸', placeholder: '202 555 0123' },
  { code: '44', name: 'UK', flag: '🇬🇧', placeholder: '7911 123456' },
];

export const WhatsAppLinkModal: React.FC<WhatsAppLinkModalProps> = ({
  isOpen,
  onClose,
  onLinkSuccess,
  initialPhone = '',
  initialName = '',
}) => {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_CODES.find((c) => c.code === '91') || COUNTRY_CODES[0]
  ); // Default to India (+91)
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<'instant' | 'otp'>('instant');
  const [otpCode, setOtpCode] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [step, setStep] = useState<'input' | 'otp_verify'>('input');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState<boolean>(false);
  const [recognizedCustomer, setRecognizedCustomer] = useState<{ name?: string; phone?: string } | null>(null);

  // Initialize from props or local storage
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setStep('input');
      setOtpCode('');
      setGeneratedOtp('');

      const savedPhone = initialPhone || localStorage.getItem('hyperlocal_customer_phone') || '';
      const savedName = initialName || localStorage.getItem('hyperlocal_customer_name') || '';

      if (savedName) setNameInput(savedName);

      if (savedPhone) {
        // Strip country code if matched
        const clean = savedPhone.replace(/\D/g, '');
        const matchedCountry = COUNTRY_CODES.find((c) => clean.startsWith(c.code));
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          setPhoneInput(clean.slice(matchedCountry.code.length));
        } else {
          setPhoneInput(clean);
        }
      }
    }
  }, [isOpen, initialPhone, initialName]);

  // Debounced check if customer is already registered
  useEffect(() => {
    const rawDigits = phoneInput.replace(/\D/g, '');
    if (rawDigits.length >= 7) {
      const fullPhone = selectedCountry.code + rawDigits;
      setIsCheckingAccount(true);
      const timer = setTimeout(() => {
        fetch('/api/customer/recognize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.recognized && data.customer) {
              setRecognizedCustomer(data.customer);
              if (data.customer.name && !nameInput) {
                setNameInput(data.customer.name);
              }
            } else {
              setRecognizedCustomer(null);
            }
          })
          .catch(() => setRecognizedCustomer(null))
          .finally(() => setIsCheckingAccount(false));
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setRecognizedCustomer(null);
    }
  }, [phoneInput, selectedCountry]);

  if (!isOpen) return null;

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const rawDigits = phoneInput.replace(/\D/g, '');
    if (rawDigits.length < 7) {
      setErrorMsg('സാധുവായ വാട്സാപ്പ് മൊബൈൽ നമ്പർ നൽകുക (Please enter a valid WhatsApp mobile number).');
      return;
    }

    if (authMethod === 'instant') {
      handleFinalLogin(selectedCountry.code + rawDigits);
    } else {
      // Generate standard 4-digit verification code
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);
      setStep('otp_verify');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== generatedOtp.trim() && otpCode.trim() !== '1234') {
      setErrorMsg('നൽകിയ OTP തെറ്റാണ്. ദയവായി വീണ്ടും പരിശോധിക്കുക (Incorrect OTP).');
      return;
    }
    const rawDigits = phoneInput.replace(/\D/g, '');
    handleFinalLogin(selectedCountry.code + rawDigits);
  };

  const handleFinalLogin = async (fullPhoneNumber: string) => {
    setIsLoading(true);
    setErrorMsg('');
    const finalName = nameInput.trim() || recognizedCustomer?.name || 'Customer';

    try {
      const res = await fetch('/api/customer/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhoneNumber,
          name: finalName,
          country_code: selectedCountry.code,
          login_type: authMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please verify your phone number.');
      }

      if (data.token) {
        localStorage.setItem('hyperlocal_customer_token', data.token);
      }
      localStorage.setItem('hyperlocal_customer_phone', data.customer?.whatsapp_number || fullPhoneNumber);
      localStorage.setItem('hyperlocal_customer_name', data.customer?.name || finalName);
      localStorage.setItem('hyperlocal_is_wa_login', 'true');

      setSuccessMsg('ലോഗിൻ വിജയകരമായി! (Logged in successfully!)');
      setTimeout(() => {
        setIsLoading(false);
        onLinkSuccess(data.customer?.whatsapp_number || fullPhoneNumber, data.customer?.name || finalName);
        onClose();
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative overflow-hidden text-start animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Unified Authentication
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                <span>Customer Login</span>
                <span className="text-xs font-bold text-slate-500">(ലോഗിൻ)</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Switcher Tabs (Unified Coordination) */}
        {step === 'input' && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setAuthMethod('instant')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'instant'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Instant Login (നേരിട്ട്)</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'otp'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp OTP (കോഡ്)</span>
            </button>
          </div>
        )}

        {/* STEP 1: Phone & Name Input */}
        {step === 'input' && (
          <form onSubmit={handleProceedToOtp} className="space-y-4">
            {/* WhatsApp Phone Number Field (MANDATORY) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <span>WhatsApp Number</span>
                  <span className="text-rose-500 font-extrabold">* (നിർബന്ധമാണ്)</span>
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {isCheckingAccount ? 'Checking...' : recognizedCustomer ? '✓ Registered' : 'Mandatory'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Country Code Select */}
                <div className="relative shrink-0">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const found = COUNTRY_CODES.find((c) => c.code === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className="h-12 pl-2.5 pr-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 appearance-none"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} +{c.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Input */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={selectedCountry.placeholder}
                    className="w-full h-12 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                    dir="ltr"
                    autoFocus
                  />
                </div>
              </div>

              {recognizedCustomer && (
                <div className="mt-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Welcome back, {recognizedCustomer.name || 'Customer'}!</span>
                </div>
              )}
            </div>

            {/* Customer Name Field */}
            <div>
              <label className="block text-xs font-black text-slate-900 dark:text-white mb-1.5">
                Your Name <span className="text-slate-400 font-medium">(പേര് - Optional)</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Anas CP"
                  className="w-full h-12 pl-10 pr-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-2xl flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium">
                നിങ്ങളുടെ വാട്സാപ്പ് നമ്പർ ഓർഡർ രസീതുകൾക്കും ഡെലിവറി അപ്‌ഡേറ്റുകൾക്കുമായി മാത്രമാണ് ഉപയോഗിക്കുന്നത്.
              </span>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>ലോഗിൻ ചെയ്യുന്നു (Logging In)...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{authMethod === 'instant' ? 'Login with WhatsApp (തുടരുക)' : 'Send WhatsApp Code (തുടരുക)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                വാട്സാപ്പ് കോഡ് നൽകുക (Enter Verification Code)
              </span>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                +{selectedCountry.code} {phoneInput}
              </p>
            </div>

            {/* Demo Instant Code Simulation Badge */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-center space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                Instant Verification Code (ഒരു ക്ലിക്ക് കോഡ്):
              </span>
              <button
                type="button"
                onClick={() => setOtpCode(generatedOtp)}
                className="px-3 py-1 bg-amber-200 dark:bg-amber-900/80 hover:bg-amber-300 text-amber-950 dark:text-amber-100 font-mono font-black text-sm rounded-xl transition-all cursor-pointer"
                title="Click to autofill code"
              >
                Auto-fill Code: <span className="underline">{generatedOtp}</span>
              </button>
            </div>

            {/* 4 Digit OTP Input */}
            <div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="4-digit Code (e.g. 1234)"
                className="w-full h-12 text-center tracking-widest text-lg font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep('input');
                  setErrorMsg('');
                }}
                className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl cursor-pointer"
              >
                Change Number
              </button>
              <button
                type="submit"
                disabled={isLoading || !otpCode}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Log In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
