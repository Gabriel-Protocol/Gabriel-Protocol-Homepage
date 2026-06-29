import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from './firebase';
import { MainTab } from './components/MainTab';
import { GoalsTab } from './components/GoalsTab';
import { EvaluationTab } from './components/EvaluationTab';
import { SettingsTab } from './components/SettingsTab';
import gabrielLogoImg from './assets/images/gabriel_logo_1782728087789.jpg';
import { 
  LayoutDashboard, 
  Target, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Settings,
  ClipboardList,
  Copy,
  Check
} from 'lucide-react';
import { Button } from './components/ui/button';

type TabView = 'main' | 'goals' | 'evaluation' | 'settings';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabView>('main');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedPre, setCopiedPre] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [figmaShareUrl, setFigmaShareUrl] = useState(() => {
    try {
      return localStorage.getItem('figmaShareUrl') || 'https://www.figma.com/board/lpkNGdGBGM8eRenQZvGDcX/GB---Goals?t=cDi6auQGNZfUHAAV-1';
    } catch (e) {
      return 'https://www.figma.com/board/lpkNGdGBGM8eRenQZvGDcX/GB---Goals?t=cDi6auQGNZfUHAAV-1';
    }
  });

  const [figmaEmbedUrl, setFigmaEmbedUrl] = useState(() => {
    try {
      return localStorage.getItem('figmaEmbedUrl') || 'https://embed.figma.com/board/lpkNGdGBGM8eRenQZvGDcX/GB---Goals?node-id=0-1&embed-host=share';
    } catch (e) {
      return 'https://embed.figma.com/board/lpkNGdGBGM8eRenQZvGDcX/GB---Goals?node-id=0-1&embed-host=share';
    }
  });

  const [figmaHeight, setFigmaHeight] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('figmaHeight')) || 450;
    } catch (e) {
      return 450;
    }
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  useEffect(() => {
    const handleFirestoreError = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.includes('permission-denied')) {
        setFirestoreError("Izin Firebase Ditolak. Pastikan Rules di Firebase Console sudah di-set ke: allow read, write: if request.auth != null && request.auth.uid == userId;");
      } else {
        setFirestoreError(customEvent.detail);
      }
      setTimeout(() => setFirestoreError(null), 10000);
    };
    
    window.addEventListener('firestore-error', handleFirestoreError);
    return () => window.removeEventListener('firestore-error', handleFirestoreError);
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setAuthError(err?.message || String(err));
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const updateFigmaHeight = (h: number) => {
    setFigmaHeight(h);
    try {
      localStorage.setItem('figmaHeight', h.toString());
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="h-12 w-12 text-teal-600 mb-4" />
          <p className="text-slate-500 font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const devDomain = currentHostname.includes('-pre-') ? currentHostname.replace('-pre-', '-dev-') : currentHostname || "ais-dev-oddwbotqvxzcffpnamhn3i-1020233461781.asia-southeast1.run.app";
  const preDomain = currentHostname.includes('-dev-') ? currentHostname.replace('-dev-', '-pre-') : currentHostname || "ais-pre-oddwbotqvxzcffpnamhn3i-1020233461781.asia-southeast1.run.app";

  const handleCopy = (text: string, type: 'dev' | 'pre') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'dev') {
        setCopiedDev(true);
        setTimeout(() => setCopiedDev(false), 2000);
      } else {
        setCopiedPre(true);
        setTimeout(() => setCopiedPre(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-teal-50 to-slate-50 dark:from-teal-950/20 dark:to-slate-950 z-0" />
        
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-2">
              Gabriel Protocol Server
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
              Unified authentication and synchronization hub for Productivity, Money, and Goals.
            </p>
            
            <Button onClick={handleLogin} size="lg" className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all">
              Sign in with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">atau coba offline</span>
              </div>
            </div>

            <Button 
              onClick={() => {
                setUser({
                  uid: 'demo-user-id',
                  email: 'qodiri.hompimpa@gmail.com',
                  displayName: 'Chetar (Demo Mode)'
                } as any);
              }} 
              variant="outline"
              size="lg" 
              className="w-full h-12 text-sm font-semibold border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            >
              Masuk dengan Akun Demo
            </Button>
          </div>

          {/* Diagnostic Box for Firebase Auth Errors */}
          {authError && (
            <div className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0 animate-ping"></span>
                <div>
                  <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                    Error Terdeteksi (Auth Error)
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-mono mt-1 break-all bg-rose-100/50 dark:bg-rose-950/40 p-2 rounded">
                    {authError}
                  </p>
                </div>
              </div>

              {/* Guide for auth/unauthorized-domain */}
              {authError.includes('unauthorized-domain') && (
                <div className="pt-2 border-t border-rose-100 dark:border-rose-900/20 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    💡 Cara mengatasi "unauthorized-domain":
                  </p>
                  <ol className="list-decimal pl-4 space-y-2 font-sans">
                    <li>Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-semibold">Firebase Console</a> Anda.</li>
                    <li>Pilih proyek Firebase Anda, lalu buka menu <strong>Authentication</strong> &gt; tab <strong>Settings</strong> &gt; sub-tab <strong>Authorized domains</strong>.</li>
                    <li>Klik <strong>Add domain</strong> dan masukkan kedua domain ini:
                      <div className="my-2 space-y-2">
                        <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded font-mono text-slate-700 dark:text-slate-300">
                          <code className="text-[10px] select-all truncate">{devDomain}</code>
                          <button 
                            onClick={() => handleCopy(devDomain, 'dev')}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                            title="Salin domain"
                          >
                            {copiedDev ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded font-mono text-slate-700 dark:text-slate-300">
                          <code className="text-[10px] select-all truncate">{preDomain}</code>
                          <button 
                            onClick={() => handleCopy(preDomain, 'pre')}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                            title="Salin domain"
                          >
                            {copiedPre ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </li>
                    <li>Setelah disimpan, coba muat ulang halaman ini dan klik login kembali!</li>
                  </ol>
                </div>
              )}

              {/* Guide for blocked popups / internal assertion */}
              {(authError.includes('cancelled-popup-request') || authError.includes('assertion') || authError.includes('popup')) && (
                <div className="pt-2 border-t border-rose-100 dark:border-rose-900/20 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    💡 Cara mengatasi kendala Popup / Iframe:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 font-sans">
                    <li>Karena aplikasi ini berjalan di dalam bingkai iframe AI Studio, browser Anda mungkin memblokir popup autentikasi Google demi keamanan.</li>
                    <li>Silakan buka aplikasi di <strong>Tab Baru</strong> dengan mengeklik tombol <strong>Open in new tab</strong> di bagian kanan atas layar pratinjau AI Studio Anda.</li>
                    <li>Pastikan juga pemblokir iklan (AdBlocker) dinonaktifkan sementara untuk domain ini.</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Ensure you have provided your Firebase Configuration in the environment variables to enable login.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950"
      style={{ 
        backgroundImage: 'linear-gradient(to right, rgba(13, 148, 136, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(13, 148, 136, 0.02) 1px, transparent 1px)', 
        backgroundSize: '24px 24px' 
      }}
    >
      {/* Premium Top Navigation Bar */}
      <header className="w-full border-b border-slate-200/60 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        {/* Left: Logo + Title + Status Pill */}
        <div className="flex items-center gap-4">
          {/* Gabriel Protocol Planet Logo (Gambar 2) */}
          <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-transform hover:scale-105 duration-300">
            <img 
              src={gabrielLogoImg} 
              alt="Gabriel Protocol Logo" 
              className="w-14 h-14 object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-50 tracking-tight leading-tight uppercase">
              GABRIEL PROTOCOL
            </h1>
            <div className="mt-1 flex items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-teal-50/80 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-100/60 dark:border-teal-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Tersinkron
              </span>
            </div>
          </div>
        </div>

        {/* Right: Tab segmented control + User profile */}
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          {/* Segmented control tab bar (Pill style like Gambar 1) */}
          <div className="bg-slate-100/85 dark:bg-slate-800/85 p-1 rounded-2xl flex items-center shadow-inner border border-slate-200/10 max-w-full overflow-x-auto scrollbar-none">
            <button
              onClick={() => setCurrentTab('main')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                currentTab === 'main'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('goals')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                currentTab === 'goals'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setCurrentTab('evaluation')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                currentTab === 'evaluation'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Evaluation
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                currentTab === 'settings'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Pengaturan
            </button>
          </div>

          {/* User profile dropdown & logout */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" 
                alt="avatar" 
              />
              <span className="hidden lg:inline text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                {user.displayName || "User"}
              </span>
            </div>
            <button 
              onClick={logout} 
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" 
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
        {currentTab === 'main' && (
          <MainTab
            userId={user.uid}
            figmaShareUrl={figmaShareUrl}
            figmaEmbedUrl={figmaEmbedUrl}
            figmaHeight={figmaHeight}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        )}
        {currentTab === 'goals' && (
          <GoalsTab
            userId={user.uid}
            figmaShareUrl={figmaShareUrl}
            figmaEmbedUrl={figmaEmbedUrl}
            figmaHeight={figmaHeight}
          />
        )}
        {currentTab === 'evaluation' && (
          <EvaluationTab
            userId={user.uid}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        )}
        {currentTab === 'settings' && (
          <SettingsTab
            userId={user.uid}
            figmaShareUrl={figmaShareUrl}
            figmaEmbedUrl={figmaEmbedUrl}
            setFigmaShareUrl={(v: string) => { setFigmaShareUrl(v); try { localStorage.setItem('figmaShareUrl', v); } catch {} }}
            setFigmaEmbedUrl={(v: string) => { setFigmaEmbedUrl(v); try { localStorage.setItem('figmaEmbedUrl', v); } catch {} }}
            figmaHeight={figmaHeight}
            setFigmaHeight={updateFigmaHeight}
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>

      {/* Global Firestore Error Toast */}
      {firestoreError && (
        <div className="fixed bottom-4 right-4 max-w-sm w-full bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 rounded-xl shadow-lg p-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">Firebase Error</h4>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{firestoreError}</p>
            </div>
            <button 
              onClick={() => setFirestoreError(null)}
              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
