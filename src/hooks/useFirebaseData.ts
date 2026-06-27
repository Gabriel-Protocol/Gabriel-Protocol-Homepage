import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Types
export interface ProductivityData {
  totalHoursMonth: number;
  avgHoursDay: number;
  daysFilled: number;
  indicatorSpread: string;
  bagusDays?: number;
  cukupDays?: number;
  jelekDays?: number;
  sangatJelekDays?: number;
}

export interface MoneyData {
  netBalance: number;
  totalExpense: number;
  avgExpenseDay: number;
  remainingMonthlyLimit: number;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface GoalsData {
  yearlyResolutions: Goal[];
  monthlyGoals: Goal[];
  weeklyGoals: Goal[];
}

export interface EvaluationPanel {
  id: string;
  title: string;
  description: string;
  score: number; // 1 to 10
}

export interface MonthEvaluation {
  productivity: EvaluationPanel[];
  money: EvaluationPanel[];
  habits: EvaluationPanel[];
  goals: EvaluationPanel[];
}

// Helper to calculate previous month key (e.g. '2026-06' -> '2026-05')
export function getPreviousMonthKey(key: string): string {
  if (!key) return '';
  const parts = key.split('-');
  if (parts.length !== 2) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month)) return '';
  
  if (month === 1) {
    return `${year - 1}-12`;
  }
  const prevMonthStr = String(month - 1).padStart(2, '0');
  return `${year}-${prevMonthStr}`;
}

// Hook for Productivity Data supporting comparative months dynamically
export function useProductivityData(userId: string | undefined, monthYearKey: string) {
  const [data, setData] = useState<{ thisMonth: ProductivityData; lastMonth: ProductivityData } | null>(null);

  useEffect(() => {
    if (!userId || !monthYearKey) return;
    
    const prevKey = getPreviousMonthKey(monthYearKey);
    
    // Default values based on the month
    const getDefaultProductivity = (key: string): ProductivityData => {
      if (key === '2026-06') {
        return {
          totalHoursMonth: 124,
          avgHoursDay: 4.8,
          daysFilled: 26,
          indicatorSpread: 'Bagus',
          bagusDays: 16,
          cukupDays: 6,
          jelekDays: 3,
          sangatJelekDays: 1
        };
      } else if (key === '2026-05') {
        return {
          totalHoursMonth: 115,
          avgHoursDay: 4.1,
          daysFilled: 28,
          indicatorSpread: 'Cukup',
          bagusDays: 11,
          cukupDays: 12,
          jelekDays: 4,
          sangatJelekDays: 1
        };
      }
      
      // Sensible defaults for other months
      return {
        totalHoursMonth: 100,
        avgHoursDay: 4.0,
        daysFilled: 25,
        indicatorSpread: 'Cukup',
        bagusDays: 10,
        cukupDays: 10,
        jelekDays: 4,
        sangatJelekDays: 1
      };
    };

    if (userId === 'demo-user-id') {
      const getDemoData = (key: string): ProductivityData => {
        try {
          const stored = localStorage.getItem(`demo_productivity_${key}`);
          if (stored) return JSON.parse(stored);
        } catch (e) {}
        return getDefaultProductivity(key);
      };
      setData({
        thisMonth: getDemoData(monthYearKey),
        lastMonth: getDemoData(prevKey)
      });
      return;
    }

    const docRefThis = doc(db, 'users', userId, 'productivity', monthYearKey);
    const docRefPrev = doc(db, 'users', userId, 'productivity', prevKey);
    
    let thisData = getDefaultProductivity(monthYearKey);
    let prevData = getDefaultProductivity(prevKey);

    const unsubThis = onSnapshot(docRefThis, (snap) => {
      if (snap.exists()) {
        thisData = { ...getDefaultProductivity(monthYearKey), ...snap.data() };
      } else {
        thisData = getDefaultProductivity(monthYearKey);
      }
      setData({ thisMonth: thisData, lastMonth: prevData });
    });

    const unsubPrev = onSnapshot(docRefPrev, (snap) => {
      if (snap.exists()) {
        prevData = { ...getDefaultProductivity(prevKey), ...snap.data() };
      } else {
        prevData = getDefaultProductivity(prevKey);
      }
      setData({ thisMonth: thisData, lastMonth: prevData });
    });

    return () => {
      unsubThis();
      unsubPrev();
    };
  }, [userId, monthYearKey]);

  return data;
}

// Hook for Money Management Data supporting comparative months dynamically
export function useMoneyData(userId: string | undefined, monthYearKey: string) {
  const [data, setData] = useState<{ thisMonth: MoneyData; lastMonth: MoneyData } | null>(null);

  useEffect(() => {
    if (!userId || !monthYearKey) return;
    
    const prevKey = getPreviousMonthKey(monthYearKey);

    const getDefaultMoney = (key: string): MoneyData => {
      if (key === '2026-06') {
        return {
          netBalance: 4500000,
          totalExpense: 1250000,
          avgExpenseDay: 41600,
          remainingMonthlyLimit: 1750000
        };
      } else if (key === '2026-05') {
        return {
          netBalance: 3800000,
          totalExpense: 1680000,
          avgExpenseDay: 54100,
          remainingMonthlyLimit: 1320000
        };
      }
      
      return {
        netBalance: 4000000,
        totalExpense: 1500000,
        avgExpenseDay: 50000,
        remainingMonthlyLimit: 1500000
      };
    };

    if (userId === 'demo-user-id') {
      const getDemoData = (key: string): MoneyData => {
        try {
          const stored = localStorage.getItem(`demo_money_${key}`);
          if (stored) return JSON.parse(stored);
        } catch (e) {}
        return getDefaultMoney(key);
      };
      setData({
        thisMonth: getDemoData(monthYearKey),
        lastMonth: getDemoData(prevKey)
      });
      return;
    }

    const docRefThis = doc(db, 'users', userId, 'money', monthYearKey);
    const docRefPrev = doc(db, 'users', userId, 'money', prevKey);
    
    let thisData = getDefaultMoney(monthYearKey);
    let prevData = getDefaultMoney(prevKey);

    const unsubThis = onSnapshot(docRefThis, (snap) => {
      if (snap.exists()) {
        thisData = { ...getDefaultMoney(monthYearKey), ...snap.data() };
      } else {
        thisData = getDefaultMoney(monthYearKey);
      }
      setData({ thisMonth: thisData, lastMonth: prevData });
    });

    const unsubPrev = onSnapshot(docRefPrev, (snap) => {
      if (snap.exists()) {
        prevData = { ...getDefaultMoney(prevKey), ...snap.data() };
      } else {
        prevData = getDefaultMoney(prevKey);
      }
      setData({ thisMonth: thisData, lastMonth: prevData });
    });

    return () => {
      unsubThis();
      unsubPrev();
    };
  }, [userId, monthYearKey]);

  return data;
}

// Hook for Goals Data with full management for Resolutions, Monthly, and Weekly goals
export function useGoalsData(userId: string | undefined) {
  const [data, setData] = useState<GoalsData | null>(null);

  useEffect(() => {
    if (!userId) return;

    if (userId === 'demo-user-id') {
      const loadDemoGoals = () => {
        try {
          const stored = localStorage.getItem('demo_goals');
          if (stored) {
            setData(JSON.parse(stored));
            return;
          }
        } catch (e) {}
        setData({ yearlyResolutions: [], monthlyGoals: [], weeklyGoals: [] });
      };
      loadDemoGoals();
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', userId, 'summary', 'goals'), (docSnap) => {
      if (docSnap.exists()) {
        const docData = docSnap.data() as GoalsData;
        setData({
          yearlyResolutions: docData.yearlyResolutions || [],
          monthlyGoals: docData.monthlyGoals || [],
          weeklyGoals: docData.weeklyGoals || []
        });
      } else {
        setData({ yearlyResolutions: [], monthlyGoals: [], weeklyGoals: [] });
      }
    });
    return () => unsub();
  }, [userId]);

  const saveGoals = async (updated: GoalsData) => {
    if (!userId) return;
    if (userId === 'demo-user-id') {
      try {
        localStorage.setItem('demo_goals', JSON.stringify(updated));
        setData(updated);
      } catch (e) {}
      return;
    }
    await setDoc(doc(db, 'users', userId, 'summary', 'goals'), updated, { merge: true });
  };

  // Yearly Resolution management
  const addResolution = async (text: string) => {
    if (!userId) return;
    const newGoal: Goal = { id: Date.now().toString(), text, completed: false };
    const current = data?.yearlyResolutions || [];
    const updated: GoalsData = {
      yearlyResolutions: [...current, newGoal],
      monthlyGoals: data?.monthlyGoals || [],
      weeklyGoals: data?.weeklyGoals || []
    };
    await saveGoals(updated);
  };
  
  const toggleResolution = async (id: string, currentStatus: boolean) => {
    if (!userId || !data) return;
    const updatedResolutions = data.yearlyResolutions.map(g => g.id === id ? { ...g, completed: !currentStatus } : g);
    const updated: GoalsData = {
      yearlyResolutions: updatedResolutions,
      monthlyGoals: data.monthlyGoals,
      weeklyGoals: data.weeklyGoals
    };
    await saveGoals(updated);
  };

  const removeResolution = async (id: string) => {
    if (!userId || !data) return;
    const updatedResolutions = data.yearlyResolutions.filter(g => g.id !== id);
    const updated: GoalsData = {
      yearlyResolutions: updatedResolutions,
      monthlyGoals: data.monthlyGoals,
      weeklyGoals: data.weeklyGoals
    };
    await saveGoals(updated);
  };

  // Monthly Goals management
  const addMonthlyGoal = async (text: string) => {
    if (!userId) return;
    const newGoal: Goal = { id: Date.now().toString(), text, completed: false };
    const current = data?.monthlyGoals || [];
    const updated: GoalsData = {
      yearlyResolutions: data?.yearlyResolutions || [],
      monthlyGoals: [...current, newGoal],
      weeklyGoals: data?.weeklyGoals || []
    };
    await saveGoals(updated);
  };

  const toggleMonthlyGoal = async (id: string, currentStatus: boolean) => {
    if (!userId || !data) return;
    const updatedMonthly = data.monthlyGoals.map(g => g.id === id ? { ...g, completed: !currentStatus } : g);
    const updated: GoalsData = {
      yearlyResolutions: data.yearlyResolutions,
      monthlyGoals: updatedMonthly,
      weeklyGoals: data.weeklyGoals
    };
    await saveGoals(updated);
  };

  const removeMonthlyGoal = async (id: string) => {
    if (!userId || !data) return;
    const updatedMonthly = data.monthlyGoals.filter(g => g.id !== id);
    const updated: GoalsData = {
      yearlyResolutions: data.yearlyResolutions,
      monthlyGoals: updatedMonthly,
      weeklyGoals: data.weeklyGoals
    };
    await saveGoals(updated);
  };

  // Weekly Goals management
  const addWeeklyGoal = async (text: string) => {
    if (!userId) return;
    const newGoal: Goal = { id: Date.now().toString(), text, completed: false };
    const current = data?.weeklyGoals || [];
    const updated: GoalsData = {
      yearlyResolutions: data?.yearlyResolutions || [],
      monthlyGoals: data?.monthlyGoals || [],
      weeklyGoals: [...current, newGoal]
    };
    await saveGoals(updated);
  };

  const toggleWeeklyGoal = async (id: string, currentStatus: boolean) => {
    if (!userId || !data) return;
    const updatedWeekly = data.weeklyGoals.map(g => g.id === id ? { ...g, completed: !currentStatus } : g);
    const updated: GoalsData = {
      yearlyResolutions: data.yearlyResolutions,
      monthlyGoals: data.monthlyGoals,
      weeklyGoals: updatedWeekly
    };
    await saveGoals(updated);
  };

  const removeWeeklyGoal = async (id: string) => {
    if (!userId || !data) return;
    const updatedWeekly = data.weeklyGoals.filter(g => g.id !== id);
    const updated: GoalsData = {
      yearlyResolutions: data.yearlyResolutions,
      monthlyGoals: data.monthlyGoals,
      weeklyGoals: updatedWeekly
    };
    await saveGoals(updated);
  };

  return { 
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
  };
}

// Hook for Evaluation Data by Year-Month supporting multiple panels per category with migration normalizer
export function useEvaluationData(userId: string | undefined, monthYearKey: string) {
  const [data, setData] = useState<MonthEvaluation | null>(null);

  useEffect(() => {
    if (!userId || !monthYearKey) return;

    if (userId === 'demo-user-id') {
      const getDemoEval = () => {
        try {
          const stored = localStorage.getItem(`demo_evaluations_${monthYearKey}`);
          if (stored) {
            setData(JSON.parse(stored));
            return;
          }
        } catch (e) {}
        
        setData({
          productivity: [{ id: '1', title: 'Evaluasi Produktivitas (Demo)', description: 'Evaluasi pencapaian kerja dan alokasi waktu bulan ini.', score: 8 }],
          money: [{ id: '1', title: 'Evaluasi Keuangan (Demo)', description: 'Analisis rasio tabungan, pengeluaran impulsif, dan kepatuhan budget.', score: 7 }],
          habits: [{ id: '1', title: 'Evaluasi Kebiasaan (Demo)', description: 'Tingkat konsistensi rutinitas harian dan kedisiplinan diri.', score: 9 }],
          goals: [{ id: '1', title: 'Evaluasi Resolusi & Goals (Demo)', description: 'Progress capaian target mingguan dan bulanan.', score: 6 }]
        });
      };
      getDemoEval();
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', userId, 'evaluations', monthYearKey), (docSnap) => {
      // Helper to normalize old database objects or arrays into consistent array format
      const normalize = (val: any, defaultTitle: string, defaultDesc: string, defaultScore: number): EvaluationPanel[] => {
        if (!val) {
          return [{ id: '1', title: defaultTitle, description: defaultDesc, score: defaultScore }];
        }
        if (Array.isArray(val)) {
          return val.map((item, index) => ({
            id: item.id || String(index + 1),
            title: item.title ?? '',
            description: item.description ?? '',
            score: typeof item.score === 'number' ? item.score : 5
          }));
        }
        // It's a single object (legacy format)
        return [{
          id: '1',
          title: val.title ?? defaultTitle,
          description: val.description ?? defaultDesc,
          score: typeof val.score === 'number' ? val.score : defaultScore
        }];
      };

      if (docSnap.exists()) {
        const docData = docSnap.data();
        setData({
          productivity: normalize(docData.productivity, 'Evaluasi Produktivitas', 'Evaluasi pencapaian kerja dan alokasi waktu bulan ini.', 8),
          money: normalize(docData.money, 'Evaluasi Keuangan', 'Analisis rasio tabungan, pengeluaran impulsif, dan kepatuhan budget.', 7),
          habits: normalize(docData.habits, 'Evaluasi Kebiasaan (Habits)', 'Tingkat konsistensi rutinitas harian dan kedisiplinan diri.', 9),
          goals: normalize(docData.goals, 'Evaluasi Resolusi & Goals', 'Progress capaian target mingguan dan bulanan.', 6),
        });
      } else {
        setData({
          productivity: [{ id: '1', title: 'Evaluasi Produktivitas', description: 'Evaluasi pencapaian kerja dan alokasi waktu bulan ini.', score: 8 }],
          money: [{ id: '1', title: 'Evaluasi Keuangan', description: 'Analisis rasio tabungan, pengeluaran impulsif, dan kepatuhan budget.', score: 7 }],
          habits: [{ id: '1', title: 'Evaluasi Kebiasaan (Habits)', description: 'Tingkat konsistensi rutinitas harian dan kedisiplinan diri.', score: 9 }],
          goals: [{ id: '1', title: 'Evaluasi Resolusi & Goals', description: 'Progress capaian target mingguan dan bulanan.', score: 6 }]
        });
      }
    });
    return () => unsub();
  }, [userId, monthYearKey]);

  const saveEvaluations = async (updatedData: MonthEvaluation) => {
    if (!userId || !monthYearKey) return;

    if (userId === 'demo-user-id') {
      try {
        localStorage.setItem(`demo_evaluations_${monthYearKey}`, JSON.stringify(updatedData));
        setData(updatedData);
      } catch (e) {}
      return;
    }

    await setDoc(doc(db, 'users', userId, 'evaluations', monthYearKey), updatedData, { merge: true });
  };

  return { data, saveEvaluations };
}
