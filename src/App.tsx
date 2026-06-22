import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from './firebase';
import { MainTab } from './components/MainTab';
import { GoalsTab } from './components/GoalsTab';
import { 
  LayoutDashboard, 
  Target, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { Button } from './components/ui/button';

type TabView = 'main' | 'goals';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabView>('main');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-teal-50 to-slate-50 dark:from-teal-950/20 dark:to-slate-950 z-0" />
        
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 z-10 text-center">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-2">
            Gabriel Protocol Server
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
            Unified authentication and synchronization hub for Productivity, Money, and Goals.
          </p>
          <Button onClick={loginWithGoogle} size="lg" className="w-full h-12 text-base font-semibold">
            Sign in with Google
          </Button>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Ensure you have provided your Firebase Configuration in the environment variables to enable login.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 font-semibold text-slate-800 dark:text-slate-50 text-lg tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-inner">
               <ShieldCheck className="h-4 w-4" />
            </div>
            Protocol Hub
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setCurrentTab('main')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${currentTab === 'main' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Main Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('goals')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${currentTab === 'goals' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'}`}
          >
            <Target className="h-4 w-4" />
            Goals
          </button>
        </nav>
        
        {/* Apps Links */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Connected Apps</div>
          <div className="space-y-1">
            <a href="/productivity" className="flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              <span>Productivity</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-50" />
            </a>
            <a href="/money" className="flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              <span>Money Management</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-50" />
            </a>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-2 overflow-hidden">
               <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-8 h-8 rounded-full border border-slate-200" alt="avatar" />
               <div className="flex flex-col items-start truncate">
                 <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate w-full">{user.displayName || "Agent"}</span>
               </div>
             </div>
             <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-900 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Logout">
                <LogOut className="h-4 w-4" />
             </button>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-50">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            Protocol Hub
         </div>
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
           {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
         </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-slate-900 pt-16 flex flex-col">
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => { setCurrentTab('main'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${currentTab === 'main' ? 'bg-teal-50 text-teal-700' : 'text-slate-600'}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Main Dashboard
            </button>
            <button
              onClick={() => { setCurrentTab('goals'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${currentTab === 'goals' ? 'bg-teal-50 text-teal-700' : 'text-slate-600'}`}
            >
              <Target className="h-5 w-5" />
              Goals
            </button>
          </nav>
          <div className="p-4 border-t border-slate-100">
             <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium">
               <LogOut className="h-5 w-5" />
               Sign Out
             </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen pt-14 md:pt-0">
        {currentTab === 'main' && <MainTab userId={user.uid} />}
        {currentTab === 'goals' && <GoalsTab userId={user.uid} />}
      </main>
    </div>
  );
}
