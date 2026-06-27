import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useEvaluationData, MonthEvaluation, EvaluationPanel } from '../hooks/useFirebaseData';
import { Clock, WalletCards, Activity, Target, Save, Check, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';

interface EvaluationTabProps {
  userId: string;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
}

export const MONTHS_LIST = [
  { value: '2026-05', label: 'Mei 2026' },
  { value: '2026-06', label: 'Juni 2026' },
  { value: '2026-07', label: 'Juli 2026' },
  { value: '2026-08', label: 'Agustus 2026' },
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-10', label: 'Oktober 2026' },
  { value: '2026-11', label: 'November 2026' },
  { value: '2026-12', label: 'Desember 2026' },
];

export function EvaluationTab({ userId, selectedMonth, setSelectedMonth }: EvaluationTabProps) {
  const { data, saveEvaluations } = useEvaluationData(userId, selectedMonth);
  const [activeSubTab, setActiveSubTab] = useState<keyof MonthEvaluation>('productivity');
  
  const [localData, setLocalData] = useState<MonthEvaluation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Keep references of latest localData, data, and saveEvaluations for unmount auto-saving
  const localDataRef = React.useRef<MonthEvaluation | null>(null);
  const dataRef = React.useRef<MonthEvaluation | null>(null);
  const saveEvaluationsRef = React.useRef(saveEvaluations);

  useEffect(() => {
    localDataRef.current = localData;
  }, [localData]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    saveEvaluationsRef.current = saveEvaluations;
  }, [saveEvaluations]);

  // Sync state from Firebase only on initial load or month change
  useEffect(() => {
    if (data && !localData) {
      setLocalData(data);
    }
  }, [data, localData]);

  // Reset local state when selected month changes (triggers a fresh load)
  useEffect(() => {
    setLocalData(null);
  }, [selectedMonth]);

  // Auto-save on component unmount (switching main tabs)
  useEffect(() => {
    return () => {
      if (localDataRef.current && dataRef.current) {
        const hasChanges = JSON.stringify(localDataRef.current) !== JSON.stringify(dataRef.current);
        if (hasChanges) {
          saveEvaluationsRef.current(localDataRef.current).catch(console.error);
        }
      }
    };
  }, []);

  const handlePanelChange = (id: string, field: keyof EvaluationPanel, value: any) => {
    if (!localData) return;
    setLocalData((prev) => {
      if (!prev) return null;
      const updatedPanels = prev[activeSubTab].map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      );
      return {
        ...prev,
        [activeSubTab]: updatedPanels,
      };
    });
  };

  const handleAddPanel = () => {
    if (!localData) return;
    const defaultTitles: Record<keyof MonthEvaluation, string> = {
      productivity: 'Evaluasi Produktivitas Baru',
      money: 'Evaluasi Keuangan Baru',
      habits: 'Evaluasi Kebiasaan Baru',
      goals: 'Evaluasi Resolusi & Goals Baru'
    };
    const defaultDescs: Record<keyof MonthEvaluation, string> = {
      productivity: 'Refleksi pencapaian produktivitas kerja dan alokasi waktu.',
      money: 'Refleksi kepatuhan anggaran dan pengeluaran harian.',
      habits: 'Refleksi konsistensi rutinitas harian dan kedisiplinan diri.',
      goals: 'Refleksi pencapaian target mingguan dan bulanan.'
    };

    const newPanel: EvaluationPanel = {
      id: Date.now().toString(),
      title: defaultTitles[activeSubTab],
      description: defaultDescs[activeSubTab],
      score: 5
    };
    setLocalData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [activeSubTab]: [...prev[activeSubTab], newPanel],
      };
    });
  };

  const handleRemovePanel = (id: string) => {
    if (!localData) return;
    setLocalData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [activeSubTab]: prev[activeSubTab].filter((p) => p.id !== id),
      };
    });
  };

  const handleSaveSubTab = async () => {
    if (!localData) return;
    setIsSaving(true);
    try {
      await saveEvaluations(localData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubTabChange = async (newTab: keyof MonthEvaluation) => {
    if (localData && data) {
      // Auto-save if there are unsaved changes in the active subtab
      const hasChanges = JSON.stringify(localData[activeSubTab]) !== JSON.stringify(data[activeSubTab]);
      if (hasChanges) {
        try {
          await saveEvaluations(localData);
        } catch (e) {
          console.error("Auto-save on sub-tab change failed", e);
        }
      }
    }
    setActiveSubTab(newTab);
  };

  const handleMonthChange = async (newMonth: string) => {
    if (localData && data) {
      // Auto-save if there are any changes before changing month
      const hasChanges = JSON.stringify(localData) !== JSON.stringify(data);
      if (hasChanges) {
        try {
          await saveEvaluations(localData);
        } catch (e) {
          console.error("Auto-save on month change failed", e);
        }
      }
    }
    setSelectedMonth(newMonth);
  };

  const tabConfigs: {
    key: keyof MonthEvaluation;
    title: string;
    icon: React.ReactNode;
    colorClass: string;
    activeColorClass: string;
  }[] = [
    {
      key: 'productivity',
      title: 'Productivity',
      icon: <Clock className="h-4 w-4" />,
      colorClass: 'text-slate-600 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800',
      activeColorClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/30 ring-1 ring-teal-500/10'
    },
    {
      key: 'money',
      title: 'Money',
      icon: <WalletCards className="h-4 w-4" />,
      colorClass: 'text-slate-600 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800',
      activeColorClass: 'bg-rose-50 text-rose-950 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/30 ring-1 ring-rose-500/10'
    },
    {
      key: 'habits',
      title: 'Habits',
      icon: <Activity className="h-4 w-4" />,
      colorClass: 'text-slate-600 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800',
      activeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 ring-1 ring-emerald-500/10'
    },
    {
      key: 'goals',
      title: 'Goals',
      icon: <Target className="h-4 w-4" />,
      colorClass: 'text-slate-600 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800',
      activeColorClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 ring-1 ring-amber-500/10'
    },
  ];

  const getSubTabHeaderColor = () => {
    switch (activeSubTab) {
      case 'productivity': return 'text-teal-600';
      case 'money': return 'text-rose-900';
      case 'habits': return 'text-emerald-600';
      case 'goals': return 'text-amber-600';
      default: return 'text-teal-600';
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
      
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Evaluasi Bulanan</h2>
          <p className="text-slate-500 text-sm">Nilai pencapaian dan buat evaluasi detail untuk setiap pilar kehidupan Anda.</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bulan:</label>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-700 dark:text-slate-200"
          >
            {MONTHS_LIST.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tabs Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/60 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        {tabConfigs.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                handleSubTabChange(tab.key);
                setIsSuccess(false);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                isActive ? tab.activeColorClass : `${tab.colorClass} border-transparent`
              }`}
            >
              {tab.icon}
              {tab.title}
            </button>
          );
        })}
      </div>

      {/* Active Sub-Tab Editor Container */}
      <div className="space-y-6">
        
        {/* Sub-Tab Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-6 rounded-full inline-block ${
              activeSubTab === 'productivity' ? 'bg-teal-600' :
              activeSubTab === 'money' ? 'bg-rose-900' :
              activeSubTab === 'habits' ? 'bg-emerald-600' : 'bg-amber-500'
            }`}></span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              Kelola Panel Evaluasi - {activeSubTab}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Add Panel Button */}
            <Button
              onClick={handleAddPanel}
              variant="outline"
              size="sm"
              className="border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-1.5 text-teal-600" />
              Tambah Panel
            </Button>

            {/* Save Sub-Tab Button */}
            <Button
              onClick={handleSaveSubTab}
              size="sm"
              className={`rounded-xl px-4 ${
                isSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5 text-xs">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Semua Tersimpan!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="h-4 w-4" />
                  Simpan Evaluasi
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* List of custom evaluation panels inside active sub-tab */}
        <div className="space-y-6">
          {!localData ? (
            <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-teal-600 mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="text-slate-500 font-medium text-sm">Memuat data evaluasi...</div>
            </div>
          ) : localData[activeSubTab] && localData[activeSubTab].length > 0 ? (
            localData[activeSubTab].map((panel, idx) => (
              <Card key={panel.id} className="border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden">
                
                {/* Decorative Indicator line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  activeSubTab === 'productivity' ? 'bg-teal-600' :
                  activeSubTab === 'money' ? 'bg-rose-900' :
                  activeSubTab === 'habits' ? 'bg-emerald-600' : 'bg-amber-500'
                }`}></div>

                <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50 flex flex-row items-center justify-between pl-6">
                  <CardTitle className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <span className="bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded">
                      Panel #{idx + 1}
                    </span>
                  </CardTitle>

                  {/* Remove Button (Allow removing panels freely) */}
                  <button
                    onClick={() => handleRemovePanel(panel.id)}
                    className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    title="Hapus panel evaluasi ini"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardHeader>

                <CardContent className="pt-6 pl-6 pr-6 space-y-6">
                  
                  {/* Grid fields for Title & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Judul Evaluasi
                      </label>
                      <input
                        type="text"
                        value={panel.title}
                        onChange={(e) => handlePanelChange(panel.id, 'title', e.target.value)}
                        placeholder="Contoh: Sangat Memuaskan / Perlu Perbaikan..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Deskripsi Refleksi
                      </label>
                      <textarea
                        rows={2}
                        value={panel.description}
                        onChange={(e) => handlePanelChange(panel.id, 'description', e.target.value)}
                        placeholder="Tulis refleksi detail, kendala, atau pembelajaran utama bulan ini..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100 resize-none"
                      />
                    </div>
                  </div>

                  {/* Rating selection (1 - 10 Grid buttons) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Indikator Nilai Pencapaian
                      </label>
                      <span className={`text-xs font-extrabold font-mono px-3 py-1 rounded-full border shadow-sm ${
                        activeSubTab === 'productivity' ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-900/30 dark:text-teal-400' :
                        activeSubTab === 'money' ? 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400' :
                        activeSubTab === 'habits' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' :
                        'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                      }`}>
                        Skor: {panel.score} / 10
                      </span>
                    </div>

                    {/* Numeric Selector */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
                        const isSelected = panel.score === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handlePanelChange(panel.id, 'score', val)}
                            className={`h-10 rounded-xl text-sm font-bold font-mono transition-all flex items-center justify-center ${
                              isSelected
                                ? activeSubTab === 'productivity' ? 'bg-teal-600 text-white shadow-inner scale-105' :
                                  activeSubTab === 'money' ? 'bg-rose-900 text-white shadow-inner scale-105' :
                                  activeSubTab === 'habits' ? 'bg-emerald-600 text-white shadow-inner scale-105' :
                                  'bg-amber-500 text-white shadow-inner scale-105'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <HelpCircle className="h-8 w-8 mx-auto text-slate-300 mb-3" />
              <div className="text-slate-500 font-semibold text-sm">Tidak ada panel evaluasi di sub-tab ini</div>
              <p className="text-slate-400 text-xs mt-1">Klik "+ Tambah Panel" di atas untuk menambahkan panel evaluasi baru.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default EvaluationTab;
