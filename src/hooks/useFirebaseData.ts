import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Mock types
export interface ProductivityData {
  totalHoursMonth: number;
  avgHoursDay: number;
  daysFilled: number;
  indicatorSpread: string;
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

// Hook for Productivity Data
export function useProductivityData(userId: string | undefined) {
  const [data, setData] = useState<ProductivityData | null>(null);

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'summary', 'productivity'), (doc) => {
      if (doc.exists()) {
        setData(doc.data() as ProductivityData);
      } else {
        // Fallback or init
        setData({ totalHoursMonth: 0, avgHoursDay: 0, daysFilled: 0, indicatorSpread: 'N/A' });
      }
    });
    return () => unsub();
  }, [userId]);

  return data;
}

// Hook for Money Management Data
export function useMoneyData(userId: string | undefined) {
  const [data, setData] = useState<MoneyData | null>(null);

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'summary', 'money'), (doc) => {
      if (doc.exists()) {
        setData(doc.data() as MoneyData);
      } else {
        setData({ netBalance: 0, totalExpense: 0, avgExpenseDay: 0, remainingMonthlyLimit: 0 });
      }
    });
    return () => unsub();
  }, [userId]);

  return data;
}

// Hook for Goals Data
export function useGoalsData(userId: string | undefined) {
  const [data, setData] = useState<GoalsData | null>(null);

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'summary', 'goals'), (doc) => {
      if (doc.exists()) {
        setData(doc.data() as GoalsData);
      } else {
        setData({ yearlyResolutions: [], monthlyGoals: [], weeklyGoals: [] });
      }
    });
    return () => unsub();
  }, [userId]);

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
  }

  return { data, addResolution, toggleResolution, removeResolution };
}
