import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useEvaluationData, MonthEvaluation } from '../hooks/useFirebaseData';
import { Clock, WalletCards, Activity, Target, Save, Check } from 'lucide-react';
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
  const { data, updateEvaluation } = useEvaluationData(userId, selectedMonth);
  const [savingKeys, setSavingKeys] = useState<{ [key: string]: boolean }>({});
  const [successKeys, setSuccessKeys] = useState<{ [key: string]: boolean }>({});

  const [localFields, setLocalFields] = useState<{
    [key: string]: { title: string; description: string; score: number };
  }>({});

  // Sync state from firebase when data changes
  React.useEffect(() => {
    if (data) {
      setLocalFields({
        productivity: { ...data.productivity },
        money: { ...data.money },
        habits: { ...data.habits },
        goals: { ...data.goals },
      });
    }
  }, [data]);

  const handleFieldChange = (panelKey: keyof MonthEvaluation, field: string, value: any) => {
    setLocalFields((prev) => ({
      ...prev,
      [panelKey]: {
        ...prev[panelKey],
        [field]: value,
      },
    }));
  };

  const handleSavePanel = async (panelKey: keyof MonthEvaluation) => {
    const fields = localFields[panelKey];
    if (!fields) return;

    setSavingKeys((prev) => ({ ...prev, [panelKey]: true }));
    try {
      await updateEvaluation(panelKey, fields);
      setSuccessKeys((prev) => ({ ...prev, [panelKey]: true }));
      setTimeout(() => {
        setSuccessKeys((prev) => ({ ...prev, [panelKey]: false }));
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingKeys((prev) => ({ ...prev, [panelKey]: false }));
    }
  };

  const panelConfigs: {
    key: keyof MonthEvaluation;
    title: string;
    icon: React.ReactNode;
    colorClass: string;
  }[] = [
    {
      key: 'productivity',
      title: 'Productivity',
      icon: <Clock className="h-5 w-5" />,
      colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/30',
    },
    {
      key: 'money',
      title: 'Money Management',
      icon: <WalletCards className="h-5 w-5" />,
      colorClass: 'text-rose-900 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-950/30',
    },
    {
      key: 'habits',
      title: 'Habits',
      icon: <Activity className="h-5 w-5" />,
      colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
    },
    {
      key: 'goals',
      title: 'Goals',
      icon: <Target className="h-5 w-5" />,
      colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
    },
  ];

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Evaluasi Bulanan</h2>
          <p className="text-slate-500">Nilai pencapaian dan buat evaluasi detail untuk setiap pilar kehidupan Anda.</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Bulan:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-700 dark:text-slate-200"
          >
            {MONTHS_LIST.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {panelConfigs.map((panel) => {
          const localData = localFields[panel.key] || { title: '', description: '', score: 5 };
          const isSaving = savingKeys[panel.key];
          const isSuccess = successKeys[panel.key];

          return (
            <Card key={panel.key} className="flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${panel.colorClass}`}>
                    {panel.icon}
                  </div>
                  <CardTitle className="text-lg font-bold">{panel.title}</CardTitle>
                </div>
                <Button
                  onClick={() => handleSavePanel(panel.key)}
                  size="sm"
                  variant="outline"
                  className={isSuccess ? "border-emerald-500 text-emerald-600" : ""}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1.5 text-xs">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Tersimpan
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Save className="h-3.5 w-3.5" />
                      Simpan
                    </span>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-5 flex-1">
                {/* Title Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Judul Evaluasi
                  </label>
                  <input
                    type="text"
                    value={localData.title}
                    onChange={(e) => handleFieldChange(panel.key, 'title', e.target.value)}
                    placeholder="Contoh: Sangat Memuaskan / Perlu Perbaikan..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Deskripsi Detail
                  </label>
                  <textarea
                    rows={3}
                    value={localData.description}
                    onChange={(e) => handleFieldChange(panel.key, 'description', e.target.value)}
                    placeholder="Tulis detail refleksi, hambatan, dan pembelajaran bulan ini..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100 resize-none"
                  />
                </div>

                {/* Rating Input 1 - 10 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Indikator Nilai
                    </label>
                    <span className="text-sm font-bold font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-teal-900/30">
                      {localData.score} / 10
                    </span>
                  </div>
                  
                  {/* Rating Numbers Group */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
                      const isSelected = localData.score === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleFieldChange(panel.key, 'score', val)}
                          className={`h-10 rounded-xl text-sm font-bold font-mono transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-teal-600 text-white shadow-inner scale-105'
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
          );
        })}
      </div>
    </div>
  );
}

export default EvaluationTab;
