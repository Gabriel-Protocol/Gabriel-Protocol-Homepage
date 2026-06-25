import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useProductivityData, useMoneyData, useEvaluationData } from '../hooks/useFirebaseData';
import { 
  Clock, 
  CalendarCheck, 
  Activity, 
  BarChart4, 
  WalletCards, 
  TrendingDown, 
  CalendarDays, 
  ExternalLink,
  Award,
  ChevronRight,
  TrendingUp,
  MousePointerClick
} from 'lucide-react';
import { Button } from './ui/button';

interface MainTabProps {
  userId: string;
  figmaShareUrl: string;
  figmaEmbedUrl: string;
  figmaHeight: number;
  selectedMonth: string;
}

export function MainTab({ userId, figmaShareUrl, figmaEmbedUrl, figmaHeight, selectedMonth }: MainTabProps) {
  const prodData = useProductivityData(userId);
  const moneyData = useMoneyData(userId);
  
  // Evaluation summaries
  const { data: evalData } = useEvaluationData(userId, selectedMonth);

  // Toggle between "thisMonth" and "lastMonth" view
  const [activeView, setActiveView] = useState<'thisMonth' | 'lastMonth'>('thisMonth');
  
  // Iframe pointer-events toggle to bypass CTRL requirement
  const [fullFigmaAccess, setFullFigmaAccess] = useState(false);

  // Get month name labels for current date context
  const getMonthLabel = (offset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - offset);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Helper to calculate total days in a month dynamically
  const getDaysInMonth = (offset: number) => {
    const d = new Date();
    // Offset 0 = current month, offset 1 = last month
    return new Date(d.getFullYear(), d.getMonth() + 1 - offset, 0).getDate();
  };

  const currentProductivity = activeView === 'thisMonth' ? prodData?.thisMonth : prodData?.lastMonth;
  const currentMoney = activeView === 'thisMonth' ? moneyData?.thisMonth : moneyData?.lastMonth;
  
  const totalDays = activeView === 'thisMonth' ? getDaysInMonth(0) : getDaysInMonth(1);

  // Comparison metrics calculations
  const calculateDiffPercent = (curr: number, prev: number) => {
    if (!prev) return 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const productivityDiff = prodData ? calculateDiffPercent(prodData.thisMonth.totalHoursMonth, prodData.lastMonth.totalHoursMonth) : 0;
  const expenseDiff = moneyData ? calculateDiffPercent(moneyData.thisMonth.totalExpense, moneyData.lastMonth.totalExpense) : 0;

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      
      {/* Header and Month Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Halo Chetar</h2>
          <p className="text-slate-500 text-sm">Ini adalah Dashboard dari Gabriel Protocol.</p>
        </div>

        {/* View Differentiator: This Month vs Last Month */}
        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex items-center border border-slate-200/50 dark:border-slate-800/50 self-start md:self-auto shadow-sm">
          <button
            onClick={() => setActiveView('thisMonth')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              activeView === 'thisMonth'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Bulan Ini ({getMonthLabel(0)})
          </button>
          <button
            onClick={() => setActiveView('lastMonth')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              activeView === 'lastMonth'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Bulan Lalu ({getMonthLabel(1)})
          </button>
        </div>
      </div>

      {/* Main Grid: Productivity and Money Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Productivity Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2.5 h-6 bg-teal-600 rounded-full inline-block"></span>
              GB - Productivity
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <a href="/GB-Productivity" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka Aplikasi
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Jam</CardTitle>
                <Clock className="w-5 h-5 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                  {currentProductivity?.totalHoursMonth || 0}
                  <span className="text-sm text-slate-400 font-sans font-medium ml-1">Jam</span>
                </div>
                {activeView === 'thisMonth' && (
                  <span className={`text-[10px] font-mono mt-1 flex items-center gap-1 ${productivityDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <TrendingUp className="h-3 w-3" />
                    {productivityDiff >= 0 ? `+${productivityDiff}%` : `${productivityDiff}%`} vs Bulan Lalu
                  </span>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata / Hari</CardTitle>
                <Activity className="w-5 h-5 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                  {currentProductivity?.avgHoursDay || 0}
                  <span className="text-sm text-slate-400 font-sans font-medium ml-1">Jam</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Alokasi waktu harian</span>
              </CardContent>
            </Card>

            {/* Dynamic Days in Month Card */}
            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hari Terisi</CardTitle>
                <CalendarCheck className="w-5 h-5 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                  {currentProductivity?.daysFilled || 0}
                  <span className="text-lg text-slate-400 font-sans font-medium ml-1">/{totalDays} hari</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Akurasi kalender {activeView === 'thisMonth' ? 'bulan ini' : 'bulan lalu'}</span>
              </CardContent>
            </Card>

            {/* Indicator Day Quantities spread (Matches Gambar 1 exactly) */}
            <Card className="border border-slate-100 dark:border-slate-800 col-span-1 sm:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Penyebaran Indikator</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="space-y-1 text-xs font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
                      Bagus
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentProductivity?.bagusDays ?? 0} hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                      Cukup
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentProductivity?.cukupDays ?? 0} hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                      Jelek
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentProductivity?.jelekDays ?? 0} hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-900 inline-block"></span>
                      Sangat Jelek
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentProductivity?.sangatJelekDays ?? 0} hari</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Money Management Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2.5 h-6 bg-rose-900 rounded-full inline-block"></span>
              GB - Money Management
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <a href="/GB-MoneyManagement" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka Aplikasi
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Bersih</CardTitle>
                <WalletCards className="w-5 h-5 text-rose-900" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100 truncate">
                  <span className="text-xs font-sans text-slate-400 font-semibold mr-1">Rp</span>
                  {currentMoney?.netBalance?.toLocaleString('id-ID') || 0}
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Dana bebas terakumulasi</span>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pengeluaran</CardTitle>
                <TrendingDown className="w-5 h-5 text-rose-900" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono tracking-tighter text-rose-700 dark:text-rose-400 truncate">
                  <span className="text-xs font-sans font-semibold mr-1">Rp</span>
                  {currentMoney?.totalExpense?.toLocaleString('id-ID') || 0}
                </div>
                {activeView === 'thisMonth' && (
                  <span className={`text-[10px] font-mono mt-1 flex items-center gap-1 ${expenseDiff <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {expenseDiff <= 0 ? 'Hemat' : 'Boros'} {expenseDiff <= 0 ? `${expenseDiff}%` : `+${expenseDiff}%`} vs Bulan Lalu
                  </span>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata / Hari</CardTitle>
                <Activity className="w-5 h-5 text-rose-900" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100 truncate">
                  <span className="text-xs font-sans text-slate-400 font-semibold mr-1">Rp</span>
                  {currentMoney?.avgExpenseDay?.toLocaleString('id-ID') || 0}
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Rata-rata pengeluaran harian</span>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Limit</CardTitle>
                <CalendarDays className="w-5 h-5 text-rose-900" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100 truncate">
                  <span className="text-xs font-sans text-slate-400 font-semibold mr-1">Rp</span>
                  {currentMoney?.remainingMonthlyLimit?.toLocaleString('id-ID') || 0}
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Batas alokasi anggaran bulanan</span>
              </CardContent>
            </Card>

          </div>
        </section>

      </div>

      {/* Item 4: Evaluation Quick Panel on Main Dashboard */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="w-2.5 h-6 bg-slate-800 dark:bg-slate-400 rounded-full inline-block"></span>
          Hasil Evaluasi Bulanan
        </h3>
        
        <Card className="border border-slate-100 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Nilai Indikator (1-10) untuk Bulan {getMonthLabel(0)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {evalData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Productivity Score */}
                <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-900/20 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400">PRODUCTIVITY</span>
                    <span className="text-base font-bold font-mono text-teal-600">{evalData.productivity.score} / 10</span>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{evalData.productivity.title || 'Belum diisi'}</span>
                    <span className="block text-[11px] text-slate-400 mt-1 line-clamp-2">{evalData.productivity.description || 'Tidak ada deskripsi detail.'}</span>
                  </div>
                </div>

                {/* Money Score */}
                <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-400">MONEY</span>
                    <span className="text-base font-bold font-mono text-rose-700">{evalData.money.score} / 10</span>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{evalData.money.title || 'Belum diisi'}</span>
                    <span className="block text-[11px] text-slate-400 mt-1 line-clamp-2">{evalData.money.description || 'Tidak ada deskripsi detail.'}</span>
                  </div>
                </div>

                {/* Habits Score */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">HABITS</span>
                    <span className="text-base font-bold font-mono text-emerald-600">{evalData.habits.score} / 10</span>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{evalData.habits.title || 'Belum diisi'}</span>
                    <span className="block text-[11px] text-slate-400 mt-1 line-clamp-2">{evalData.habits.description || 'Tidak ada deskripsi detail.'}</span>
                  </div>
                </div>

                {/* Goals Score */}
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">GOALS</span>
                    <span className="text-base font-bold font-mono text-amber-600">{evalData.goals.score} / 10</span>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{evalData.goals.title || 'Belum diisi'}</span>
                    <span className="block text-[11px] text-slate-400 mt-1 line-clamp-2">{evalData.goals.description || 'Tidak ada deskripsi detail.'}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-400 italic">
                Belum ada data evaluasi bulan ini. Silakan isi di tab Evaluasi!
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Mission Panel (Mindmaps) with Hotkey Scroll Zoom override option */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="w-2.5 h-6 bg-slate-800 dark:bg-slate-400 rounded-full inline-block"></span>
            Mission Mindmap
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {/* Scroll Zoom Toggle Option (Item 3) */}
            <button
              onClick={() => setFullFigmaAccess(!fullFigmaAccess)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                fullFigmaAccess
                  ? 'bg-teal-500 text-white border-teal-600'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="Aktifkan interaksi langsung untuk melakukan zoom figma hanya dengan menggunakan scroll wheel tanpa menahan tombol CTRL"
            >
              <MousePointerClick className="h-3.5 w-3.5" />
              {fullFigmaAccess ? 'Scroll Zoom Aktif (Klik Iframe)' : 'Aktifkan Scroll Zoom'}
            </button>

            {figmaShareUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={figmaShareUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Buka di Figma
                </a>
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden border border-slate-100 dark:border-slate-800">
          <div 
            style={{ height: `${figmaHeight}px` }} 
            className="w-full bg-slate-100 dark:bg-slate-800/50 flex flex-col items-center justify-center relative min-h-[300px]"
          >
            {figmaEmbedUrl ? (
              <iframe 
                title="Mindmap Figma" 
                src={figmaEmbedUrl} 
                className={`w-full h-full border-0 absolute inset-0 transition-all ${
                  fullFigmaAccess ? 'pointer-events-auto' : 'pointer-events-none'
                }`} 
                allowFullScreen 
              />
            ) : (
              <div className="text-center p-6">
                <div className="text-slate-400 dark:text-slate-500 font-medium mb-2">Belum ada link Figma Embed</div>
                <p className="text-sm text-slate-400">Silakan atur link Figma Embed di menu Pengaturan.</p>
              </div>
            )}
            
            {/* If zoom scroll is NOT enabled, we show a beautiful overlay explaining how to zoom, or offering the toggle */}
            {!fullFigmaAccess && figmaEmbedUrl && (
              <div className="absolute inset-0 bg-slate-950/5 hover:bg-slate-950/10 pointer-events-auto flex items-end justify-center pb-4 transition-colors">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm text-xs text-slate-500 dark:text-slate-300 text-center max-w-sm">
                  <span>Pegang <strong>CTRL</strong> + scroll untuk Zoom, atau klik <strong>"Aktifkan Scroll Zoom"</strong> di atas.</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

    </div>
  );
}

export default MainTab;
