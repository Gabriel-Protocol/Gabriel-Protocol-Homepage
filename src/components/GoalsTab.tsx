import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Goal, useGoalsData } from '../hooks/useFirebaseData';
import { Target, Flag, CalendarDays, Plus, Trash2, CheckCircle2, Circle, ExternalLink, Info } from 'lucide-react';
import { Button } from './ui/button';

interface GoalsTabProps {
  userId: string;
  figmaShareUrl: string;
  figmaEmbedUrl: string;
  figmaHeight: number;
}

export function GoalsTab({ userId, figmaShareUrl, figmaEmbedUrl, figmaHeight }: GoalsTabProps) {
  const { 
    data, 
    addResolution, 
    toggleResolution, 
    removeResolution,
    addMonthlyGoal,
    toggleMonthlyGoal,
    removeMonthlyGoal,
    addWeeklyGoal,
    toggleWeeklyGoal,
    removeWeeklyGoal
  } = useGoalsData(userId);

  const [newRes, setNewRes] = useState('');
  const [newMonthGoal, setNewMonthGoal] = useState('');
  const [newWeekGoal, setNewWeekGoal] = useState('');

  const handleAddResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRes.trim()) {
      addResolution(newRes.trim());
      setNewRes('');
    }
  };

  const handleAddMonthly = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMonthGoal.trim()) {
      addMonthlyGoal(newMonthGoal.trim());
      setNewMonthGoal('');
    }
  };

  const handleAddWeekly = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeekGoal.trim()) {
      addWeeklyGoal(newWeekGoal.trim());
      setNewWeekGoal('');
    }
  };

  const renderGoalList = (
    title: string, 
    icon: React.ReactNode, 
    goals: Goal[] | undefined, 
    onAdd: (text: string) => void, 
    onToggle: (id: string, status: boolean) => void, 
    onRemove: (id: string) => void,
    inputValue: string,
    setInputValue: (val: string) => void,
    placeholderText: string
  ) => (
    <Card className="flex flex-col h-full border border-slate-100 dark:border-slate-800">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col justify-between">
        <ul className="space-y-3 flex-1 min-h-[200px] max-h-[350px] overflow-y-auto pr-1">
          {goals && goals.length > 0 ? goals.map(goal => (
            <li key={goal.id} className="flex items-start gap-3 group">
              <button 
                onClick={() => onToggle(goal.id, goal.completed)} 
                className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors shrink-0"
              >
                {goal.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <span className={`flex-1 text-sm ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                {goal.text}
              </span>
              <button 
                onClick={() => onRemove(goal.id)} 
                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all ml-1 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          )) : (
            <div className="text-sm text-slate-400 italic text-center py-8">Belum ada tujuan ditambahkan.</div>
          )}
        </ul>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              onAdd(inputValue.trim());
              setInputValue('');
            }
          }} 
          className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2"
        >
          <input 
            type="text" 
            placeholder={placeholderText} 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100"
          />
          <Button size="icon" type="submit" disabled={!inputValue.trim()}>
             <Plus className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Goals & Missions</h2>
        <p className="text-slate-500 mb-6 font-medium">Pantau resolusi tahunan, tujuan bulanan, dan mingguan Anda secara terintegrasi.</p>
      </div>

      {/* Mission Panel (Mindmaps) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-6 bg-slate-800 dark:bg-slate-400 rounded-full inline-block"></span>
            Mission Mindmap
          </h3>
          {figmaShareUrl && (
            <a 
              href={figmaShareUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-9 px-3 text-slate-700 dark:text-slate-300"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Buka di Figma
            </a>
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

      {/* Goals Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {renderGoalList(
            "Resolusi Tahunan", 
            <Target className="h-5 w-5 text-rose-900" />, 
            data?.yearlyResolutions,
            addResolution,
            toggleResolution,
            removeResolution,
            newRes,
            setNewRes,
            "Tambah resolusi tahunan..."
         )}
         
         {renderGoalList(
            "Tujuan Bulanan", 
            <CalendarDays className="h-5 w-5 text-teal-600" />, 
            data?.monthlyGoals,
            addMonthlyGoal,
            toggleMonthlyGoal,
            removeMonthlyGoal,
            newMonthGoal,
            setNewMonthGoal,
            "Tambah tujuan bulanan..."
         )}

         {renderGoalList(
            "Tujuan Mingguan", 
            <Flag className="h-5 w-5 text-teal-600" />, 
            data?.weeklyGoals,
            addWeeklyGoal,
            toggleWeeklyGoal,
            removeWeeklyGoal,
            newWeekGoal,
            setNewWeekGoal,
            "Tambah tujuan mingguan..."
         )}
      </section>

    </div>
  );
}

export default GoalsTab;
