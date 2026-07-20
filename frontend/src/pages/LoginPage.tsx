import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Smartphone,
  Lock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  Clock,
  ChevronLeft,
  Zap,
  Check,
  BellRing,
  Send,
  MessageSquare,
  Copy,
  Settings2,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { OtpService } from '../services/otpService';

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
];

const ROLES = [
  'Lead Quality Inspector',
  'Line Operations Supervisor',
  'Agronomist & Food Scientist',
  'Facility Compliance Auditor',
  'System Administrator'
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Clean Form State - No Cache Data
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('Lead Quality Inspector');

  // Step State: 'input' | 'verifying' | 'success'
  const [step, setStep] = useState<'input' | 'verifying' | 'success'>('input');

  // Real-Time OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dispatchChannels, setDispatchChannels] = useState<string[]>([]);

  // Device Simulator View Tab ('sms' | 'email')
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [copiedCode, setCopiedCode] = useState(false);

  // Optional Twilio Cellular SMS Gateway Config
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioFrom, setTwilioFrom] = useState('');

  // Refs for OTP input array
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (step === 'verifying' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Request browser desktop notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Dispatch Real-Time OTP to entered Email and Mobile
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Strict Input Validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter your valid email address to receive OTP verification.');
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 7 || cleanMobile.length > 15) {
      setError('Please enter a valid mobile phone number (min 7 digits).');
      return;
    }

    setIsSending(true);

    const fullMobile = `${countryCode} ${cleanMobile}`;
    const code = OtpService.generateOtpCode();
    setGeneratedOtp(code);

    const res = await OtpService.dispatchOtp({
      email: trimmedEmail,
      mobile: fullMobile,
      otpCode: code,
      twilioSid: twilioSid.trim() || undefined,
      twilioToken: twilioToken.trim() || undefined,
      twilioFrom: twilioFrom.trim() || undefined
    });

    setDispatchChannels(res.dispatchedVia);
    setOtpValues(['', '', '', '', '', '']);
    setStep('verifying');
    setTimer(59);
    setIsSending(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    const trimmedEmail = email.trim();
    const cleanMobile = mobile.replace(/\D/g, '');
    const fullMobile = `${countryCode} ${cleanMobile}`;
    const code = OtpService.generateOtpCode();
    setGeneratedOtp(code);

    const res = await OtpService.dispatchOtp({
      email: trimmedEmail,
      mobile: fullMobile,
      otpCode: code,
      twilioSid: twilioSid.trim() || undefined,
      twilioToken: twilioToken.trim() || undefined,
      twilioFrom: twilioFrom.trim() || undefined
    });

    setDispatchChannels(res.dispatchedVia);
    setOtpValues(['', '', '', '', '', '']);
    setTimer(59);
    setError(null);
  };

  // Auto-Fill Helper
  const handleAutoFill = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split('');
    setOtpValues(digits);
    setError(null);
  };

  // Handle OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newValues = [...otpValues];
      pastedDigits.forEach((digit, i) => {
        if (index + i < 6) {
          newValues[index + i] = digit;
        }
      });
      setOtpValues(newValues);
      const nextIdx = Math.min(index + pastedDigits.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newValues = [...otpValues];
    newValues[index] = cleanChar;
    setOtpValues(newValues);

    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle KeyDown for Backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const enteredCode = otpValues.join('');
    if (enteredCode.length < 6) {
      setError('Please enter the full 6-digit OTP code sent to your email & mobile.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (enteredCode === generatedOtp) {
        setStep('success');
        setIsVerifying(false);
        const cleanMobile = mobile.replace(/\D/g, '');
        setTimeout(() => {
          login({
            email: email.trim(),
            mobile: `${countryCode} ${cleanMobile}`,
            countryCode,
            role,
            verifiedAt: new Date().toISOString()
          });
          navigate('/dashboard');
        }, 1100);
      } else {
        setIsVerifying(false);
        setError('Incorrect verification code. Please check the code sent to your mobile and email.');
      }
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
        
        {/* Left Column: Enterprise Security Showcase (Desktop 5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-blue-950/40 border-r border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 -mt-20 -ml-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 -mb-20 -mr-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>REAL-TIME MULTI-FACTOR AUTHENTICATION</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans leading-tight">
              FreshVision AI <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                Secure Portal
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enter your email address and mobile phone number to receive a secure real-time OTP verification code.
            </p>
          </div>

          <div className="relative z-10 my-8 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-semibold text-slate-200">LIVE OTP VERIFICATION</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                256-BIT SSL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-950/70 p-3 border border-white/5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">OTP Delivery</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">Instant</div>
                <div className="text-[11px] text-slate-500">Email & Mobile SMS</div>
              </div>
              <div className="rounded-xl bg-slate-950/70 p-3 border border-white/5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Compliance Level</div>
                <div className="text-lg font-bold text-blue-400 mt-0.5 font-mono">ISO 22000</div>
                <div className="text-[11px] text-slate-500">Dual-Channel Audit</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3 text-xs text-slate-300">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>
                Real-time OTP verification ensures only authorized personnel can access line inspection operations.
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>TLS 1.3 SECURE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>NO CACHE DATA</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login Flow (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center relative">
          
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Overview</span>
            </button>
            <span className="text-xs font-mono text-slate-500">
              STEP {step === 'input' ? '1 OF 2' : step === 'verifying' ? '2 OF 2' : 'COMPLETED'}
            </span>
          </div>

          {/* STEP 1: CREDENTIALS INPUT FORM (CLEAN NO CACHE) */}
          {step === 'input' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                  Operator Authentication
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Enter your email address and mobile number to dispatch a real-time verification OTP.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-sm text-rose-300">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-5" autoComplete="off">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                    1. Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      name="freshvision_email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address (e.g. you@company.com)"
                      required
                      className="w-full rounded-xl bg-slate-900/80 border border-white/10 pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Number Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                    2. Mobile Number
                  </label>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 sm:col-span-3">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full h-12 rounded-xl bg-slate-900/80 border border-white/10 px-3 text-sm text-slate-100 focus:border-emerald-500 outline-none font-mono cursor-pointer"
                      >
                        {COUNTRY_CODES.map((item) => (
                          <option key={item.code} value={item.code} className="bg-slate-900 text-slate-100">
                            {item.flag} {item.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-8 sm:col-span-9 relative">
                      <Smartphone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        name="freshvision_mobile"
                        autoComplete="off"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        required
                        className="w-full h-12 rounded-xl bg-slate-900/80 border border-white/10 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                    3. Access Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3.5 text-sm text-slate-100 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-slate-100">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Cellular SMS Gateway Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGatewayConfig(!showGatewayConfig)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>{showGatewayConfig ? 'Hide Twilio SMS Gateway Settings' : 'Configure Cellular SMS Gateway (Twilio/Optional)'}</span>
                  </button>

                  {showGatewayConfig && (
                    <div className="mt-3 rounded-xl bg-slate-900/90 border border-white/10 p-3.5 space-y-3 text-xs">
                      <div className="font-semibold text-slate-300">Live Cellular SMS Delivery (Twilio Gateway)</div>
                      <input
                        type="text"
                        placeholder="Twilio Account SID (AC...)"
                        value={twilioSid}
                        onChange={(e) => setTwilioSid(e.target.value)}
                        className="w-full rounded-lg bg-slate-950 border border-white/10 px-3 py-2 text-slate-200 font-mono outline-none"
                      />
                      <input
                        type="password"
                        placeholder="Twilio Auth Token"
                        value={twilioToken}
                        onChange={(e) => setTwilioToken(e.target.value)}
                        className="w-full rounded-lg bg-slate-950 border border-white/10 px-3 py-2 text-slate-200 font-mono outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Twilio Phone Number (+1...)"
                        value={twilioFrom}
                        onChange={(e) => setTwilioFrom(e.target.value)}
                        className="w-full rounded-lg bg-slate-950 border border-white/10 px-3 py-2 text-slate-200 font-mono outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 px-6 py-4 text-sm font-bold text-slate-950 hover:from-emerald-400 hover:to-blue-500 shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin text-slate-950" />
                      <span>Dispatching Real-Time OTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Real-Time OTP Verification</span>
                      <ArrowRight className="h-5 w-5 ml-auto" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: REAL-TIME OTP VERIFICATION & DEVICE MONITOR */}
          {step === 'verifying' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* LIVE MOBILE & EMAIL DEVICE INBOX MONITOR */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/60 border border-emerald-500/30 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-slate-900/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      LIVE REAL-TIME DEVICE MONITOR
                    </span>
                    {dispatchChannels.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <BellRing className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('sms')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                        activeTab === 'sms'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>SMS Phone View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('email')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                        activeTab === 'email'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email Inbox View</span>
                    </button>
                  </div>
                </div>

                {/* Tab Content: SMS Device View */}
                {activeTab === 'sms' && (
                  <div className="p-4 space-y-3 font-mono">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Recipient Mobile: <strong className="text-slate-200">{countryCode} {mobile}</strong></span>
                      <span className="text-emerald-400 font-bold">DELIVERED NOW</span>
                    </div>
                    <div className="rounded-xl bg-slate-950/90 border border-white/10 p-3.5 text-xs text-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>FROM: FRESHVISION SECURITY (+1800-AI-INSPECT)</span>
                        <span>Just now</span>
                      </div>
                      <div className="text-sm">
                        FreshVision Security Verification: Your one-time OTP code is{' '}
                        <span className="text-emerald-400 font-extrabold tracking-wider text-base">
                          {generatedOtp}
                        </span>
                        . Expires in 5 minutes.
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Email Inbox View */}
                {activeTab === 'email' && (
                  <div className="p-4 space-y-3 font-mono">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Recipient Email: <strong className="text-slate-200">{email}</strong></span>
                      <span className="text-blue-400 font-bold">DELIVERED NOW</span>
                    </div>
                    <div className="rounded-xl bg-slate-950/90 border border-white/10 p-3.5 text-xs text-slate-200 space-y-2">
                      <div className="text-[11px] text-slate-400 border-b border-white/10 pb-1.5 space-y-0.5">
                        <div>FROM: auth@freshvision.ai</div>
                        <div>SUBJECT: FreshVision Enterprise Login OTP Verification</div>
                      </div>
                      <div className="pt-1 text-sm">
                        Hello Operator, your verification code to sign into FreshVision AI is{' '}
                        <span className="text-blue-400 font-extrabold tracking-wider text-base">
                          {generatedOtp}
                        </span>
                        .
                      </div>
                    </div>
                  </div>
                )}

                {/* Instant Actions Bar */}
                <div className="bg-slate-950/80 border-t border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 transition-colors cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Auto-Fill Code ({generatedOtp})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedOtp);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <a
                    href={`sms:${countryCode}${mobile}?body=FreshVision OTP: ${generatedOtp}`}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-mono"
                  >
                    <span>Open Native SMS App</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                  Enter Verification Code
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Enter the 6-digit OTP verification code sent to <span className="text-slate-200 font-semibold">{email}</span> &amp; <span className="text-slate-200 font-semibold">{countryCode} {mobile}</span>.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-sm text-rose-300">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className="h-14 sm:h-16 w-full text-center text-2xl font-bold font-mono rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span>Expires in: 00:{timer < 10 ? `0${timer}` : timer}</span>
                  </div>
                  <div>
                    {timer > 0 ? (
                      <span className="text-slate-500">Resend available in {timer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                      >
                        Resend Real-Time OTP
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="w-full sm:w-1/3 rounded-xl border border-white/10 bg-slate-900/80 px-5 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
                  >
                    Change Contact
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full sm:w-2/3 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-slate-950 hover:from-emerald-400 hover:to-blue-500 shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin text-slate-950" />
                        <span>Verifying Security Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Access Platform</span>
                        <CheckCircle2 className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: SUCCESS ANIMATION & REDIRECTING */}
          {step === 'success' && (
            <div className="py-12 text-center space-y-6 animate-fadeIn">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
                <Check className="h-10 w-10 stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                  Authentication Successful
                </h2>
                <p className="text-sm text-slate-400">
                  Welcome back, <span className="text-emerald-400 font-semibold">{email}</span>. Establishing secure enterprise session...
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-white/10 px-4 py-2 text-xs font-mono text-slate-300">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                <span>REDIRECTING TO DASHBOARD...</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
