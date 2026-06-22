import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useProductivityData, useMoneyData } from '../hooks/useFirebaseData';
import { Clock, CalendarCheck, Activity, BarChart4, WalletCards, TrendingDown, CalendarDays, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export function MainTab({ userId }: { userId: string }) {
  const prodData = useProductivityData(userId);
  const moneyData = useMoneyData(userId);

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Welcome back.</h2>
        <p className="text-slate-500 mb-6">Here is your consolidated overview across all your connected apps.</p>
      </div>

      {/* Productivity Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-6 bg-teal-600 rounded-full inline-block"></span>
            GB - Productivity
          </h3>
          <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
            <a href="/productivity" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open App
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">Total Jam Bulan Ini</CardTitle>
              <Clock className="w-5 h-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                {prodData?.totalHoursMonth || 0}<span className="text-lg text-slate-400 font-sans ml-1">hrs</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">Rata-rata / Hari</CardTitle>
              <Activity className="w-5 h-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                {prodData?.avgHoursDay || 0}<span className="text-lg text-slate-400 font-sans ml-1">hrs</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">Hari Terisi</CardTitle>
              <CalendarCheck className="w-5 h-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                {prodData?.daysFilled || 0}<span className="text-lg text-slate-400 font-sans ml-1">/31</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">Distribusi Indikator</CardTitle>
              <BarChart4 className="w-5 h-5 text-teal-600" />
            </CardHeader>
            <CardContent>
               <div className="text-xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 truncate mt-1">
                {prodData?.indicatorSpread || 'Belum ada data'}
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Money Management Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-6 bg-rose-900 rounded-full inline-block"></span>
            GB - Money Management
          </h3>
          <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
            <a href="/money" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open App
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">Saldo Bersih</CardTitle>
              <WalletCards className="w-5 h-5 text-rose-900" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100 truncate">
                <span className="text-sm font-sans text-slate-400 mr-1">Rp</span>
                {moneyData?.netBalance?.toLocaleString('id-ID') || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">Total Pengeluaran</CardTitle>
              <TrendingDown className="w-5 h-5 text-rose-900" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tracking-tighter text-rose-700 dark:text-rose-400 truncate">
                <span className="text-sm font-sans mr-1">Rp</span>
                {moneyData?.totalExpense?.toLocaleString('id-ID') || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">Rata-rata / Hari</CardTitle>
              <Activity className="w-5 h-5 text-rose-900" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100 truncate">
                <span className="text-sm font-sans text-slate-400 mr-1">Rp</span>
                {moneyData?.avgExpenseDay?.toLocaleString('id-ID') || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">Sisa Limit</CardTitle>
              <CalendarDays className="w-5 h-5 text-rose-900" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold font-mono tracking-tighter text-slate-800 dark:text-slate-100 truncate">
                <span className="text-sm font-sans text-slate-400 mr-1">Rp</span>
                {moneyData?.remainingMonthlyLimit?.toLocaleString('id-ID') || 0}
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Mission Panel (Mindmaps) */}
      <section>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <span className="w-2 h-6 bg-slate-800 dark:bg-slate-400 rounded-full inline-block"></span>
          Mission Mindmap
        </h3>
        <Card className="overflow-hidden">
          <div className="aspect-[21/9] w-full bg-slate-100 dark:bg-slate-800/50 flex flex-col items-center justify-center p-6 border-b border-slate-100 dark:border-slate-800 relative">
             {/* Note: This is where user places their Figma iframe */}
             <div className="absolute inset-0 flex items-center justify-center">
                 <iframe 
                   title="Mindmap Figma" 
                   src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2F" 
                   className="w-full h-full opacity-5 hover:opacity-100 transition-opacity" 
                   allowFullScreen 
                 />
             </div>
             
             <div className="text-center z-10 pointer-events-none">
                <div className="text-slate-400 dark:text-slate-500 font-medium mb-2">Figma Embed Placeholder</div>
                <p className="text-sm text-slate-400">Embed URL should be replaced in source code</p>
             </div>
          </div>
        </Card>
      </section>

    </div>
  );
}
