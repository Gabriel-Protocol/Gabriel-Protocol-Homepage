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
  title: string;
  description: string;
  score: number; // 1 to 10
}

export interface MonthEvaluation {
  productivity: EvaluationPanel;
  money: EvaluationPanel;
  habits: EvaluationPanel;
  goals: EvaluationPanel;
}

// Hook for Productivity Data supporting comparative months
export function useProductivityData(userId: string | undefined) {
  const [data, setData] = useState<{ thisMonth: ProductivityData; lastMonth: ProductivityData } | null>(null);

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'summary', 'productivity'), (docSnap) => {
      const defaultThisMonth: ProductivityData = {
        totalHoursMonth: 124,
        avgHoursDay: 4.8,
        daysFilled: 26,
        indicatorSpread: 'Bagus',
        bagusDays: 16,
        cukupDays: 6,
        jelekDays: 3,
        sangatJelekDays: 1
      };

      const defaultLastMonth: ProductivityData = {
        totalHoursMonth: 115,
        avgHoursDay: 4.1,
        daysFilled: 28,
        indicatorSpread: 'Cukup',
        bagusDays: 11,
        cukupDays: 12,
        jelekDays: 4,
        sangatJelekDays: 1
      };

      if (docSnap.exists()) {
        const docData = docSnap.data();
        setData({
          thisMonth: docData.thisMonth || { ...defaultThisMonth, ...docData },
          lastMonth: docData.lastMonth || defaultLastMonth,
        });
      } else {
        setData({
          thisMonth: defaultThisMonth,
          lastMonth: defaultLastMonth,
        });
      }
    });
    return () => unsub();
  }, [userId]);

  return data;
}

// Hook for Money Management Data supporting comparative months
export function useMoneyData(userId: string | undefined) {
  const [data, setData] = useState<{ thisMonth: MoneyData; lastMonth: MoneyData } | null>(null);

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'summary', 'money'), (docSnap) => {
      const defaultThisMonth: MoneyData = {
        netBalance: 4500000,
        totalExpense: 1250000,
        avgExpenseDay: 41600,
        remainingMonthlyLimit: 1750000
      };

      const defaultLastMonth: MoneyData = {
        netBalance: 3800000,
        totalExpense: 1680000,
        avgExpenseDay: 54100,
        remainingMonthlyLimit: 1320000
      };

      if (docSnap.exists()) {
        const docData = docSnap.data();
        setData({
          thisMonth: docData.thisMonth || { ...defaultThisMonth, ...docData },
          lastMonth: docData.lastMonth || defaultLastMonth,
        });
      } else {
        setData({
          thisMonth: defaultThisMonth,
          lastMonth: defaultLastMonth,
        });
      }
    });
    return () => unsub();
  }, [userId]);

  return data;
}

// Hook for Goals Data with full management for Resolutions, Monthly, and Weekly goals
export function useGoalsData(userId: string | undefined) {
  const [data, setData] = useState<GoalsData | null>(null);

  useEffect(() => {
    if (!userId) return;
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

  // Yearly Resolution management
  const addResolution = async (text: string) => {
    if (!userId) return;
    const newGoal: Goal = { id: Date.now().toString(), text, completed: false };
    const current = data?.yearlyResolutions || [];
    await setDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      ...data,
      yearlyResolutions: [...current, newGoal]
    }, { merge: true });
  };
  
  const toggleResolution = async (id: string, currentStatus: boolean) => {
    if (!userId || !data) return;
    const updated = data.yearlyResolutions.map(g => g.id === id ? { ...g, completed: !currentStatus } : g);
    await updateDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      yearlyResolutions: updated
    });
  };

  const removeResolution = async (id: string) => {
    if (!userId || !data) return;
    const updated = data.yearlyResolutions.filter(g => g.id !== id);
    await updateDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      yearlyResolutions: updated
    });
  };

  // Monthly Goals management
  const addMonthlyGoal = async (text: string) => {
    if (!userId) return;
    const newGoal: Goal = { id: Date.now().toString(), text, completed: false };
    const current = data?.monthlyGoals || [];
    await setDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      ...data,
      monthlyGoals: [...current, newGoal]
    }, { merge: true });
  };

  const toggleMonthlyGoal = async (id: string, currentStatus: boolean) => {
    if (!userId || !data) return;
    const updated = data.monthlyGoals.map(g => g.id === id ? { ...g, completed: !currentStatus } : g);
    await updateDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      monthlyGoals: updated
    });
  };

  const removeMonthlyGoal = async (id: string) => {
    if (!userId || !data) return;
    const updated = data.monthlyGoals.filter(g => g.id !== id);
    await updateDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      monthlyGoals: updated
    });
  };

  // Weekly Goals management
  const addWeeklyGoal = async (text: string) => {
    if (!userId) return;
    const newGoal: Goal = { id: Date.now().toString(), text, completed: false };
    const current = data?.weeklyGoals || [];
    await setDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      ...data,
      weeklyGoals: [...current, newGoal]
    }, { merge: true });
  };

  const toggleWeeklyGoal = async (id: string, currentStatus: boolean) => {
    if (!userId || !data) return;
    const updated = data.weeklyGoals.map(g => g.id === id ? { ...g, completed: !currentStatus } : g);
    await updateDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      weeklyGoals: updated
    });
  };

  const removeWeeklyGoal = async (id: string) => {
    if (!userId || !data) return;
    const updated = data.weeklyGoals.filter(g => g.id !== id);
    await updateDoc(doc(db, 'users', userId, 'summary', 'goals'), {
      weeklyGoals: updated
    });
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

// Hook for Evaluation Data by Year-Month
export function useEvaluationData(userId: string | undefined, monthYearKey: string) {
  const [data, setData] = useState<MonthEvaluation | null>(null);

  useEffect(() => {
    if (!userId || !monthYearKey) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'evaluations', monthYearKey), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as MonthEvaluation);
      } else {
        setData({
          productivity: { title: 'Evaluasi Produktivitas', description: 'Evaluasi pencapaian kerja dan alokasi waktu bulan ini.', score: 8 },
          money: { title: 'Evaluasi Keuangan', description: 'Analisis rasio tabungan, pengeluaran impulsif, dan kepatuhan budget.', score: 7 },
          habits: { title: 'Evaluasi Kebiasaan (Habits)', description: 'Tingkat konsistensi rutinitas harian dan kedisiplinan diri.', score: 9 },
          goals: { title: 'Evaluasi Resolusi & Goals', description: 'Progress capaian target mingguan dan bulanan.', score: 6 }
        });
      }
    });
    return () => unsub();
  }, [userId, monthYearKey]);

  const updateEvaluation = async (panelKey: keyof MonthEvaluation, fields: Partial<EvaluationPanel>) => {
    if (!userId || !monthYearKey || !data) return;
    const updatedPanel = { ...data[panelKey], ...fields };
    const updatedData = { ...data, [panelKey]: updatedPanel };
    await setDoc(doc(db, 'users', userId, 'evaluations', monthYearKey), updatedData, { merge: true });
  };

  return { data, updateEvaluation };
}
