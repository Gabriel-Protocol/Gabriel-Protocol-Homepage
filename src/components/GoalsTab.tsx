import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Goal, useGoalsData } from '../hooks/useFirebaseData';
import { Target, Flag, CalendarDays, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from './ui/button';

export function GoalsTab({ userId }: { userId: string }) {
  const { data, addResolution, toggleResolution, removeResolution } = useGoalsData(userId);
  const [newRes, setNewRes] = useState('');

  const handleAddResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRes.trim()) {
      addResolution(newRes.trim());
      setNewRes('');
    }
  };

  const renderGoalList = (title: string, icon: React.ReactNode, goals: Goal[] | undefined, onAdd?: (text: string) => void, onToggle?: (id: string, status: boolean) => void, onRemove?: (id: string) => void) => (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        <ul className="space-y-3 flex-1">
          {goals && goals.length > 0 ? goals.map(goal => (
            <li key={goal.id} className="flex items-start gap-3 group">
              {onToggle ? (
                 <button onClick={() => onToggle(goal.id, goal.completed)} className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors">
                     {goal.completed ? <CheckCircle2 className="h-5 w-5 text-teal-600" /> : <Circle className="h-5 w-5" />}
                 </button>
              ) : (
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
              )}
              <span className={`flex-1 text-sm ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                {goal.text}
              </span>
              {onRemove && (
                 <button onClick={() => onRemove(goal.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all">
                    <Trash2 className="h-4 w-4" />
                 </button>
              )}
            </li>
          )) : (
            <div className="text-sm text-slate-400 italic text-center py-4">Belum ada tujuan ditambahkan.</div>
          )}
        </ul>

        {onAdd && (
           <form onSubmit={(e) => { e.preventDefault(); /* For weekly/monthly we can expand the hook later if needed, now we just handle annual */ }} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
             {title === "Resolusi Tahunan" ? (
                 <>
                   <input 
                     type="text" 
                     placeholder="Tambah resolusi..." 
                     value={newRes}
                     onChange={e => setNewRes(e.target.value)}
                     className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                   />
                   <Button size="icon" onClick={handleAddResolution} type="submit" disabled={!newRes.trim()}>
                      <Plus className="h-4 w-4" />
                   </Button>
                 </>
             ) : (
                <div className="text-xs text-slate-400 w-full text-center py-2">
                    Sinkronisasi otomatis dipusatkan dari Web B/C.
                </div>
             )}
           </form>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Goals & Missions</h2>
        <p className="text-slate-500 mb-6">Track your ongoing resolutions, targets, and view your mindmaps.</p>
      </div>

      {/* Mission Panel (Mindmaps) */}
      <section>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <span className="w-2 h-6 bg-slate-800 dark:bg-slate-400 rounded-full inline-block"></span>
          Mission Mindmap
        </h3>
        <Card className="overflow-hidden">
          <div className="aspect-[21/9] w-full bg-slate-100 dark:bg-slate-800/50 flex flex-col items-center justify-center p-6 border-b border-slate-100 dark:border-slate-800 relative">
             <div className="absolute inset-0 flex items-center justify-center">
                 <iframe 
                   title="Mindmap Figma" 
                   src="https://www.figma.com/board/lpkNGdGBGM8eRenQZvGDcX/GB---Goals?t=cDi6auQGNZfUHAAV-1" 
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

      {/* Goals Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {renderGoalList(
            "Resolusi Tahunan", 
            <Target className="h-5 w-5 text-rose-900" />, 
            data?.yearlyResolutions,
            addResolution,
            toggleResolution,
            removeResolution
         )}
         
         {renderGoalList(
            "Tujuan Bulanan", 
            <CalendarDays className="h-5 w-5 text-teal-600" />, 
            data?.monthlyGoals || [],
            (text) => {}, // Mocked for display
         )}

         {renderGoalList(
            "Tujuan Mingguan", 
            <Flag className="h-5 w-5 text-teal-600" />, 
            data?.weeklyGoals || [],
            (text) => {}, // Mocked for display
         )}
      </section>

    </div>
  );
}
