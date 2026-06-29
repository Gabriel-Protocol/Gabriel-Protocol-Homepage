import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  LayoutGrid, 
  Sun, 
  Moon, 
  Sparkles, 
  Check, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface SettingsTabProps {
  userId: string;
  figmaShareUrl: string;
  figmaEmbedUrl: string;
  setFigmaShareUrl: (v: string) => void;
  setFigmaEmbedUrl: (v: string) => void;
  figmaHeight: number;
  setFigmaHeight: (h: number) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

export function SettingsTab({
  userId,
  figmaShareUrl,
  figmaEmbedUrl,
  setFigmaShareUrl,
  setFigmaEmbedUrl,
  figmaHeight,
  setFigmaHeight,
  theme,
  setTheme,
}: SettingsTabProps) {
  const [share, setShare] = useState(figmaShareUrl);
  const [embed, setEmbed] = useState(figmaEmbedUrl);
  const [height, setHeight] = useState(figmaHeight);

  // States for manual Firestore Fetch / Sync
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string>('');
  const [syncStats, setSyncStats] = useState<{ 
    configCount: number; 
    dataCount: number;
    hasSummary: boolean;
    summaryData?: {
      netBalance?: number;
      totalExpense?: number;
      avgExpenseDay?: number;
      remainingMonthlyLimit?: number;
    } | null;
  } | null>(null);

  useEffect(() => setShare(figmaShareUrl), [figmaShareUrl]);
  useEffect(() => setEmbed(figmaEmbedUrl), [figmaEmbedUrl]);
  useEffect(() => setHeight(figmaHeight), [figmaHeight]);

  const handleSaveFigma = () => {
    setFigmaShareUrl(share.trim());
    setFigmaEmbedUrl(embed.trim());
    setFigmaHeight(height);
  };

  const handleFetchMoneyData = async () => {
    setSyncStatus('loading');
    setSyncError('');
    setSyncStats(null);

    try {
      if (!userId) {
        throw new Error("ID Pengguna tidak ditemukan. Silakan masuk terlebih dahulu.");
      }

      // Fetch config collection
      const configRef = collection(db, 'users', userId, 'config');
      const configSnap = await getDocs(configRef);

      // Fetch data collection
      const dataRef = collection(db, 'users', userId, 'data');
      const dataSnap = await getDocs(dataRef);

      // Fetch summary/money document
      const summaryMoneyRef = doc(db, 'users', userId, 'summary', 'money');
      const summaryMoneySnap = await getDoc(summaryMoneyRef);
      const hasSummary = summaryMoneySnap.exists();
      const summaryData = hasSummary ? summaryMoneySnap.data() : null;

      setSyncStats({
        configCount: configSnap.size,
        dataCount: dataSnap.size,
        hasSummary,
        summaryData: summaryData as any
      });
      setSyncStatus('success');
    } catch (err: any) {
      console.error("Manual fetch failed:", err);
      setSyncStatus('error');
      
      let friendlyError = err?.message || String(err);
      if (userId === 'demo-user-id') {
        friendlyError = "Anda saat ini sedang menggunakan Akun Demo. Firestore menolak permintaan ini karena aturan keamanan membutuhkan login akun Google asli (request.auth != null). Silakan keluar lalu masuk dengan Akun Google untuk mensimulasikan koneksi Firestore yang sesungguhnya.";
      } else if (friendlyError.includes('permission-denied') || friendlyError.includes('Missing or insufficient permissions')) {
        friendlyError = "Izin Firebase Ditolak (Permission Denied). Aturan keamanan (Rules) Firestore Anda membatasi akses ini. Pastikan Anda telah mengonfigurasi rules agar mengizinkan akses ke sub-koleksi 'config' dan 'data' di bawah 'users/{userId}'.";
      }
      
      setSyncError(friendlyError);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Setting</h2>
        <p className="text-slate-500 mb-6 text-sm">Konfigurasi tampilan, tema, serta ukuran mindmap Anda.</p>
      </div>

      {/* Theme Selection */}
      <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-teal-600" />
            Tema Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Theme Option */}
            <button
              onClick={() => setTheme('light')}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                theme === 'light'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/10 ring-2 ring-teal-600/20'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Sun className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Terang (Default)</span>
                <span className="block text-xs text-slate-400 mt-1">Estetika off-white bersih, cerah, dan lembut di mata.</span>
              </div>
              {theme === 'light' && <Check className="h-4 w-4 text-teal-600 shrink-0 mt-1" />}
            </button>

            {/* Dark Theme Option */}
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                theme === 'dark'
                  ? 'border-teal-500 bg-teal-50/10 dark:bg-teal-900/10 ring-2 ring-teal-600/20'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Moon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Gelap</span>
                <span className="block text-xs text-slate-400 mt-1">Sesuai dengan panduan gaya, berdasar slate obsidian gelap matte.</span>
              </div>
              {theme === 'dark' && <Check className="h-4 w-4 text-teal-600 shrink-0 mt-1" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* GB - Money Management Sync */}
      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-teal-600" />
            Sinkronisasi GB - Money Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Ambil data alokasi anggaran (<code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">config</code>) 
            dan transaksi keuangan (<code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">data</code>) secara manual 
            dari database Firestore <strong>GB - Money Management</strong> Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Button 
              onClick={handleFetchMoneyData}
              disabled={syncStatus === 'loading'}
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium"
            >
              <RefreshCw className={`h-4 w-4 ${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
              {syncStatus === 'loading' ? 'Meminta Data...' : 'Minta Data Sekarang'}
            </Button>
            
            <span className="text-xs text-slate-400 dark:text-slate-500 font-sans leading-tight">
              Pembaruan otomatis tetap berjalan di latar belakang secara real-time.
            </span>
          </div>

          {/* Success Panel */}
          {syncStatus === 'success' && syncStats && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm flex gap-3 items-start animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Sinkronisasi Berhasil!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-1">
                  Koneksi ke Firestore aktif. Ditemukan <strong>{syncStats.configCount} data konfigurasi</strong> (limit bulanan), <strong>{syncStats.dataCount} rekaman transaksi</strong>{syncStats.hasSummary ? ', dan dokumen ringkasan (summary/money) yang utuh' : ''}. Data ini telah berhasil disinkronkan ke dasbor Anda.
                </p>

                {syncStats.hasSummary && syncStats.summaryData && (
                  <div className="mt-3 p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-emerald-200/50 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-sans shadow-sm">
                    <p className="font-semibold text-teal-700 dark:text-teal-400 mb-2 flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      Nilai Ringkasan Terdeteksi (summary/money):
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div className="text-slate-500 dark:text-slate-400">Net Balance:</div>
                      <div className="font-semibold text-right text-slate-900 dark:text-slate-100">Rp {(syncStats.summaryData.netBalance || 0).toLocaleString('id-ID')}</div>
                      
                      <div className="text-slate-500 dark:text-slate-400">Total Pengeluaran:</div>
                      <div className="font-semibold text-right text-rose-600 dark:text-rose-400">Rp {(syncStats.summaryData.totalExpense || 0).toLocaleString('id-ID')}</div>
                      
                      <div className="text-slate-500 dark:text-slate-400">Sisa Limit Bulanan:</div>
                      <div className="font-semibold text-right text-teal-600 dark:text-teal-400">Rp {(syncStats.summaryData.remainingMonthlyLimit || 0).toLocaleString('id-ID')}</div>
                      
                      <div className="text-slate-500 dark:text-slate-400">Rata-rata Harian:</div>
                      <div className="font-semibold text-right text-slate-900 dark:text-slate-100">Rp {Math.round(syncStats.summaryData.avgExpenseDay || 0).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning / Failure Alert Panel */}
          {syncStatus === 'error' && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-300 text-sm flex gap-3 items-start animate-in fade-in duration-200">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-semibold">Gagal Meminta Data dari Firestore</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-mono bg-amber-100/50 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200/30 break-all leading-relaxed">
                  {syncError}
                </p>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Tips Solusi:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Pastikan Anda sudah login menggunakan Google Account yang valid di server ini.</li>
                    <li>Verifikasi bahwa database Firestore Anda di Firebase Console memiliki koleksi <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">users/{userId}/data</code>.</li>
                    <li>Gunakan tombol <strong>"Open in new tab"</strong> jika iframe AI Studio memblokir request Firestore.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Figma Sizing & Links */}
      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            Figma Mindmap & Ukuran Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Figma Share URL</label>
              <input
                value={share}
                onChange={(e) => setShare(e.target.value)}
                placeholder="https://www.figma.com/board/..."
                className="mt-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100"
              />
              <p className="text-xs text-slate-400 mt-1">Digunakan untuk tombol "Buka di Figma".</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Figma Embed URL</label>
              <input
                value={embed}
                onChange={(e) => setEmbed(e.target.value)}
                placeholder="https://embed.figma.com/board/..."
                className="mt-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100"
              />
              <p className="text-xs text-slate-400 mt-1">Digunakan untuk penayangan peta pikiran langsung.</p>
            </div>
          </div>

          {/* Figma Panel Height Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Tinggi Panel Figma</label>
              <span className="text-xs font-bold font-mono text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200/50">
                {height}px
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="1000"
              step="50"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>300px</span>
              <span>650px</span>
              <span>1000px</span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={handleSaveFigma}>Simpan Pengaturan Figma</Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default SettingsTab;
