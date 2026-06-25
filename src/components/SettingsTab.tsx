import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useGoalsData } from '../hooks/useFirebaseData';
import { Target, CalendarDays, Flag, LayoutGrid, Sun, Moon, Sparkles, Check, Trash2, Plus } from 'lucide-react';

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
  
  const { 
    data: goalsData, 
    addMonthlyGoal, 
    removeMonthlyGoal, 
    addWeeklyGoal, 
    removeWeeklyGoal 
  } = useGoalsData(userId);

  const [newMonthlyText, setNewMonthlyText] = useState('');
  const [newWeeklyText, setNewWeeklyText] = useState('');

  useEffect(() => setShare(figmaShareUrl), [figmaShareUrl]);
  useEffect(() => setEmbed(figmaEmbedUrl), [figmaEmbedUrl]);
  useEffect(() => setHeight(figmaHeight), [figmaHeight]);

  const handleSaveFigma = () => {
    setFigmaShareUrl(share.trim());
    setFigmaEmbedUrl(embed.trim());
    setFigmaHeight(height);
  };

  const handleAddMonthly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMonthlyText.trim()) {
      await addMonthlyGoal(newMonthlyText.trim());
      setNewMonthlyText('');
    }
  };

  const handleAddWeekly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeeklyText.trim()) {
      await addWeeklyGoal(newWeeklyText.trim());
      setNewWeeklyText('');
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Pengaturan</h2>
        <p className="text-slate-500 mb-6">Konfigurasi tampilan, tema, ukuran mindmap, serta kelola tujuan bulanan dan mingguan Anda.</p>
      </div>

      {/* Theme Selection */}
      <Card className="overflow-hidden border border-slate-100 dark:border-slate-800">
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

      {/* Figma Sizing & Links */}
      <Card className="border border-slate-100 dark:border-slate-800">
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

      {/* Manual Goals Editor (Bulanan & Mingguan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monthly Goals manual manager */}
        <Card className="border border-slate-100 dark:border-slate-800 flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-teal-600" />
              Kelola Tujuan Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col">
            <form onSubmit={handleAddMonthly} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMonthlyText}
                onChange={(e) => setNewMonthlyText(e.target.value)}
                placeholder="Tambah tujuan bulanan..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100"
              />
              <Button size="icon" type="submit" disabled={!newMonthlyText.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <ul className="space-y-2 flex-1 max-h-[250px] overflow-y-auto pr-1">
              {goalsData?.monthlyGoals && goalsData.monthlyGoals.length > 0 ? (
                goalsData.monthlyGoals.map((goal) => (
                  <li key={goal.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2">{goal.text}</span>
                    <button
                      onClick={() => removeMonthlyGoal(goal.id)}
                      className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-6">Belum ada tujuan bulanan.</div>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Weekly Goals manual manager */}
        <Card className="border border-slate-100 dark:border-slate-800 flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="h-4 w-4 text-teal-600" />
              Kelola Tujuan Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col">
            <form onSubmit={handleAddWeekly} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newWeeklyText}
                onChange={(e) => setNewWeeklyText(e.target.value)}
                placeholder="Tambah tujuan mingguan..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100"
              />
              <Button size="icon" type="submit" disabled={!newWeeklyText.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <ul className="space-y-2 flex-1 max-h-[250px] overflow-y-auto pr-1">
              {goalsData?.weeklyGoals && goalsData.weeklyGoals.length > 0 ? (
                goalsData.weeklyGoals.map((goal) => (
                  <li key={goal.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2">{goal.text}</span>
                    <button
                      onClick={() => removeWeeklyGoal(goal.id)}
                      className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-6">Belum ada tujuan mingguan.</div>
              )}
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default SettingsTab;
