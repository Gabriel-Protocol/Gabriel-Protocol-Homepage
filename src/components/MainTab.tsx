import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useProductivityData, useMoneyData, useEvaluationData } from '../hooks/useFirebaseData';
import { 
  Clock, 
  CalendarCheck, 
  Activity, 
  WalletCards, 
  TrendingDown, 
  CalendarDays, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { Button } from './ui/button';

interface MainTabProps {
  userId: string;
  figmaShareUrl: string;
  figmaEmbedUrl: string;
  figmaHeight: number;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
}

const MONTHS_INDONESIAN = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
];

export function MainTab({ 
  userId, 
  figmaShareUrl, 
  figmaEmbedUrl, 
  figmaHeight, 
  selectedMonth,
  setSelectedMonth 
}: MainTabProps) {
  
  // Load data for the selected month (thisMonth will be the selected month, lastMonth will be previous month)
  const prodData = useProductivityData(userId, selectedMonth);
  const moneyData = useMoneyData(userId, selectedMonth);
  
  // Evaluation summaries
  const { data: evalData } = useEvaluationData(userId, selectedMonth);

  const [currentYear, currentMonth] = selectedMonth.split('-');

  const handlePrevMonth = () => {
    let year = parseInt(currentYear, 10);
    let month = parseInt(currentMonth, 10);
    if (month === 1) {
      year -= 1;
      month = 12;
    } else {
      month -= 1;
    }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let year = parseInt(currentYear, 10);
    let month = parseInt(currentMonth, 10);
    if (month === 12) {
      year += 1;
      month = 1;
    } else {
      month += 1;
    }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  const getMonthName = (mCode: string) => {
    return MONTHS_INDONESIAN.find(m => m.value === mCode)?.label || 'Juni';
  };

  const currentProductivity = prodData?.thisMonth;
  const currentMoney = moneyData?.thisMonth;

  // Helper to calculate total days in a month dynamically
  const getDaysInSelectedMonth = () => {
    const year = parseInt(currentYear, 10) || 2026;
    const month = parseInt(currentMonth, 10) || 6;
    return new Date(year, month, 0).getDate();
  };

  const totalDays = getDaysInSelectedMonth();

  // Dynamic sum of day quantities from indicators (GP - Productivity)
  const sumDaysInIndicators = 
    (currentProductivity?.bagusDays ?? 0) + 
    (currentProductivity?.cukupDays ?? 0) + 
    (currentProductivity?.jelekDays ?? 0) + 
    (currentProductivity?.sangatJelekDays ?? 0);

  // If sum is greater than 0, use it to ensure perfect sync with GP - Productivity distribution panel!
  const displayDaysFilled = sumDaysInIndicators > 0 ? sumDaysInIndicators : (currentProductivity?.daysFilled || 0);

  // Comparison metrics calculations
  const calculateDiffPercent = (curr: number, prev: number) => {
    if (!prev) return 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const productivityDiff = prodData ? calculateDiffPercent(prodData.thisMonth.totalHoursMonth, prodData.lastMonth.totalHoursMonth) : 0;
  const expenseDiff = moneyData ? calculateDiffPercent(moneyData.thisMonth.totalExpense, moneyData.lastMonth.totalExpense) : 0;

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      
      {/* Header and Month/Year Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Halo Chetar</h2>
          <p className="text-slate-500 text-sm">Ini adalah Dashboard dari Gabriel Protocol.</p>
        </div>

        {/* Dynamic Month Selector Dropdown & Year Dropdown */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm self-start md:self-auto">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg">
            <span className="text-sm font-semibold">←</span>
          </Button>
          
          <select
            value={currentMonth}
            onChange={(e) => setSelectedMonth(`${currentYear}-${e.target.value}`)}
            className="bg-transparent border-0 text-sm font-semibold focus:ring-0 text-slate-700 dark:text-slate-300 py-1 px-2 cursor-pointer outline-none"
          >
            {MONTHS_INDONESIAN.map((m) => (
              <option key={m.value} value={m.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => setSelectedMonth(`${e.target.value}-${currentMonth}`)}
            className="bg-transparent border-0 text-sm font-semibold focus:ring-0 text-slate-700 dark:text-slate-300 py-1 px-2 cursor-pointer outline-none border-l border-slate-200 dark:border-slate-800"
          >
            {Array.from({ length: 7 }, (_, i) => String(2024 + i)).map((y) => (
              <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {y}
              </option>
            ))}
          </select>

          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg">
            <span className="text-sm font-semibold">→</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Productivity and Money Section (Both styled to match equal height and form) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Productivity Section */}
        <section className="flex flex-col space-y-4 h-full justify-between">
          <div className="flex items-center justify-between shrink-0">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Jam</CardTitle>
                <Clock className="w-5 h-5 text-teal-600" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                  {currentProductivity?.totalHoursMonth || 0}
                  <span className="text-sm text-slate-400 font-sans font-medium ml-1">Jam</span>
                </div>
                <span className={`text-[10px] font-mono mt-1 flex items-center gap-1 ${productivityDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <TrendingUp className="h-3 w-3 animate-pulse" />
                  {productivityDiff >= 0 ? `+${productivityDiff}%` : `${productivityDiff}%`} vs Bulan Lalu
                </span>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata / Hari</CardTitle>
                <Activity className="w-5 h-5 text-teal-600" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                  {currentProductivity?.avgHoursDay || 0}
                  <span className="text-sm text-slate-400 font-sans font-medium ml-1">Jam</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Alokasi waktu harian</span>
              </CardContent>
            </Card>

            {/* Dynamic Days in Month Card */}
            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hari Terisi</CardTitle>
                <CalendarCheck className="w-5 h-5 text-teal-600" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                  {displayDaysFilled}
                  <span className="text-lg text-slate-400 font-sans font-medium ml-1">/{totalDays} hari</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Sesuai dengan jumlah data penyebaran hari</span>
              </CardContent>
            </Card>

            {/* Indicator Day Quantities spread (Matches Gambar 1 exactly) */}
            <Card className="border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Penyebaran Indikator</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3 flex-1 flex flex-col justify-center">
                <div className="space-y-1 text-xs font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      Bagus
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentProductivity?.bagusDays ?? 0} Hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                      Cukup
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentProductivity?.cukupDays ?? 0} Hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      Jelek
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentProductivity?.jelekDays ?? 0} Hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
                      Sangat Jelek
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentProductivity?.sangatJelekDays ?? 0} Hari</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Money Management Section */}
        <section className="flex flex-col space-y-4 h-full justify-between">
          <div className="flex items-center justify-between shrink-0">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Bersih</CardTitle>
                <WalletCards className="w-5 h-5 text-rose-900" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-2xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100 truncate">
                  <span className="text-xs font-sans text-slate-400 font-semibold mr-1">Rp</span>
                  {currentMoney?.netBalance?.toLocaleString('id-ID') || 0}
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Dana bebas terakumulasi</span>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pengeluaran</CardTitle>
                <TrendingDown className="w-5 h-5 text-rose-900" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-2xl font-bold font-mono tracking-tighter text-rose-700 dark:text-rose-400 truncate">
                  <span className="text-xs font-sans font-semibold mr-1">Rp</span>
                  {currentMoney?.totalExpense?.toLocaleString('id-ID') || 0}
                </div>
                <span className={`text-[10px] font-mono mt-1 flex items-center gap-1 ${expenseDiff <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {expenseDiff <= 0 ? 'Hemat' : 'Boros'} {expenseDiff <= 0 ? `${expenseDiff}%` : `+${expenseDiff}%`} vs Bulan Lalu
                </span>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata / Hari</CardTitle>
                <Activity className="w-5 h-5 text-rose-900" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-2xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100 truncate">
                  <span className="text-xs font-sans text-slate-400 font-semibold mr-1">Rp</span>
                  {currentMoney?.avgExpenseDay?.toLocaleString('id-ID') || 0}
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Rata-rata pengeluaran harian</span>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Limit</CardTitle>
                <CalendarDays className="w-5 h-5 text-rose-900" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
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

      {/* Item 4: Evaluation Quick Panel on Main Dashboard mapping multi-panels dynamically */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="w-2.5 h-6 bg-slate-800 dark:bg-slate-400 rounded-full inline-block"></span>
          Hasil Evaluasi Bulanan
        </h3>
        
        <Card className="border border-slate-100 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Nilai Indikator (1-10) untuk Bulan {getMonthName(currentMonth)} {currentYear}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {evalData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Productivity Column */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-1">PRODUCTIVITY</span>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {evalData.productivity && evalData.productivity.length > 0 ? (
                      evalData.productivity.map((panel) => (
                        <div key={panel.id} className="p-4 rounded-xl bg-teal-50/40 dark:bg-teal-950/10 border border-teal-100/50 dark:border-teal-900/10 flex flex-col justify-between space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">{panel.title || 'Evaluasi Produktivitas'}</span>
                            <span className="text-[10px] font-bold font-mono text-teal-600 bg-teal-100/50 dark:bg-teal-950/40 px-1 py-0.5 rounded shrink-0">{panel.score}/10</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-3">{panel.description || 'Tidak ada deskripsi detail.'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">Belum ada evaluasi.</div>
                    )}
                  </div>
                </div>

                {/* Money Column */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-1">MONEY</span>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {evalData.money && evalData.money.length > 0 ? (
                      evalData.money.map((panel) => (
                        <div key={panel.id} className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/10 flex flex-col justify-between space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">{panel.title || 'Evaluasi Keuangan'}</span>
                            <span className="text-[10px] font-bold font-mono text-rose-700 bg-rose-100/50 dark:bg-rose-950/40 px-1 py-0.5 rounded shrink-0">{panel.score}/10</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-3">{panel.description || 'Tidak ada deskripsi detail.'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">Belum ada evaluasi.</div>
                    )}
                  </div>
                </div>

                {/* Habits Column */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-1">HABITS</span>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {evalData.habits && evalData.habits.length > 0 ? (
                      evalData.habits.map((panel) => (
                        <div key={panel.id} className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/10 flex flex-col justify-between space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">{panel.title || 'Evaluasi Kebiasaan'}</span>
                            <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/40 px-1 py-0.5 rounded shrink-0">{panel.score}/10</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-3">{panel.description || 'Tidak ada deskripsi detail.'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">Belum ada evaluasi.</div>
                    )}
                  </div>
                </div>

                {/* Goals Column */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-1">GOALS</span>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {evalData.goals && evalData.goals.length > 0 ? (
                      evalData.goals.map((panel) => (
                        <div key={panel.id} className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/10 flex flex-col justify-between space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">{panel.title || 'Evaluasi Resolusi & Goals'}</span>
                            <span className="text-[10px] font-bold font-mono text-amber-600 bg-amber-100/50 dark:bg-amber-950/40 px-1 py-0.5 rounded shrink-0">{panel.score}/10</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-3">{panel.description || 'Tidak ada deskripsi detail.'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">Belum ada evaluasi.</div>
                    )}
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

      {/* Mission Panel (Mindmaps) with fully active scroll/move capabilities by default */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="w-2.5 h-6 bg-slate-800 dark:bg-slate-400 rounded-full inline-block"></span>
            Mission Mindmap
          </h3>
          {figmaShareUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={figmaShareUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka di Figma
              </a>
            </Button>
          )}
        </div>

        <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col">
          <div 
            style={{ height: `${figmaHeight}px` }} 
            className="w-full bg-slate-100 dark:bg-slate-800/50 relative min-h-[350px]"
          >
            {figmaEmbedUrl ? (
              <iframe 
                title="Mindmap Figma" 
                src={figmaEmbedUrl} 
                className="w-full h-full border-0 absolute inset-0 pointer-events-auto" 
                allowFullScreen 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="text-slate-400 dark:text-slate-500 font-medium mb-2">Belum ada link Figma Embed</div>
                <p className="text-sm text-slate-400">Silakan atur link Figma Embed di menu Setting.</p>
              </div>
            )}
          </div>
          
          {figmaEmbedUrl && (
            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Gunakan <strong>Scroll Mouse</strong> untuk menggerakkan layar mindmap. Untuk melakukan zoom, gunakan pintasan keyboard <strong>Scroll Mouse</strong> (tanpa CTRL pada Figma embed, atau CTRL + Scroll jika dikendalikan browser).</span>
            </div>
          )}
        </Card>
      </section>

    </div>
  );
}

export default MainTab;
