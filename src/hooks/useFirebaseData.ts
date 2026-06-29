import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, collection } from 'firebase/firestore';
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

    let thresholds = { veryBad: 2, bad: 4, fair: 6 };
    let latestDaysSnap: any = null;

    const calculateData = () => {
      if (!latestDaysSnap) return;
      
      const calcForMonth = (key: string): ProductivityData => {
        const days = latestDaysSnap.docs.filter((d: any) => d.id.startsWith(key));
        const filled = days.length;
        if (filled === 0) return { totalHoursMonth: 0, avgHoursDay: 0, daysFilled: 0, indicatorSpread: 'Bagus', bagusDays: 0, cukupDays: 0, jelekDays: 0, sangatJelekDays: 0 };
        let total = 0;
        let b = 0, c = 0, j = 0, sj = 0;
        days.forEach((d: any) => {
          const h = d.data().hours || 0;
          total += h;
          if (h <= thresholds.veryBad) sj++;
          else if (h <= thresholds.bad) j++;
          else if (h <= thresholds.fair) c++;
          else b++;
        });
        return {
          totalHoursMonth: Number(total.toFixed(1)),
          avgHoursDay: Number((total / filled).toFixed(1)),
          daysFilled: filled,
          indicatorSpread: b >= c && b >= j && b >= sj ? 'Bagus' : (c >= j && c >= sj ? 'Cukup' : (j >= sj ? 'Jelek' : 'Sangat Jelek')),
          bagusDays: b,
          cukupDays: c,
          jelekDays: j,
          sangatJelekDays: sj
        };
      };
      
      setData({
        thisMonth: calcForMonth(monthYearKey),
        lastMonth: calcForMonth(prevKey)
      });
    };

    const unsubConfig = onSnapshot(collection(db, 'users', userId, 'config'), (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0].data();
        thresholds = { 
           veryBad: typeof d.thresholdVeryBad === 'number' ? d.thresholdVeryBad : 2, 
           bad: typeof d.thresholdBad === 'number' ? d.thresholdBad : 4, 
           fair: typeof d.thresholdFair === 'number' ? d.thresholdFair : 6 
        };
        calculateData();
      }
    });

    const unsubDays = onSnapshot(collection(db, 'users', userId, 'days'), (snap) => {
      latestDaysSnap = snap;
      calculateData();
    }, (error) => {
      console.error("Firestore permission error:", error);
      window.dispatchEvent(new CustomEvent('firestore-error', { detail: error.message }));
      const emptyProd = { totalHoursMonth: 0, avgHoursDay: 0, daysFilled: 0, indicatorSpread: 'Bagus', bagusDays: 0, cukupDays: 0, jelekDays: 0, sangatJelekDays: 0 };
      setData({ thisMonth: emptyProd, lastMonth: emptyProd });
    });

    return () => {
      unsubConfig();
      unsubDays();
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

    const INDONESIAN_MONTHS_MAP: { [key: string]: number } = {
      januari: 1, jan: 1, january: 1,
      februari: 2, feb: 2, february: 2,
      maret: 3, mar: 3, march: 3,
      april: 4, apr: 4,
      mei: 5, may: 5,
      juni: 6, jun: 6, june: 6,
      juli: 7, jul: 7, july: 7,
      agustus: 8, agu: 8, agt: 8, august: 8,
      september: 9, sep: 9,
      oktober: 10, okt: 10, october: 10,
      november: 11, nov: 11,
      desember: 12, des: 12, december: 12
    };

    const parseMonthName = (m: any): number => {
      if (!m) return 0;
      if (typeof m === 'number') return m;
      const s = String(m).toLowerCase().trim();
      const num = parseInt(s, 10);
      if (!isNaN(num)) return num;
      return INDONESIAN_MONTHS_MAP[s] || 0;
    };

    const parseYearName = (y: any): number => {
      if (!y) return 0;
      if (typeof y === 'number') return y;
      const s = String(y).trim();
      const num = parseInt(s, 10);
      if (!isNaN(num)) return num;
      return 0;
    };

    let limitBulanan = 800000;
    let latestDataSnap: any = null;

    const calculateData = () => {
      if (!latestDataSnap) return;

      const calcForMonth = (key: string): MoneyData => {
        let totalIncome = 0;
        let totalExpense = 0;
        let dates = new Set<string>();

        latestDataSnap.docs.forEach((d: any) => {
           const val = d.data();
           
           let year = 0;
           let month = 0;
           let dateStr = "";

           const rawDate = val.date || val.tanggal || val.createdAt || val.timestamp || val.waktu || val.created_at || val.time;
           if (rawDate) {
              if (typeof rawDate === 'string') {
                 dateStr = rawDate;
              } else if (typeof rawDate === 'number') {
                 const dt = new Date(rawDate);
                 if (!isNaN(dt.getTime())) {
                     year = dt.getFullYear();
                     month = dt.getMonth() + 1;
                 }
              } else if (rawDate.toDate && typeof rawDate.toDate === 'function') {
                 const dt = rawDate.toDate();
                 year = dt.getFullYear();
                 month = dt.getMonth() + 1;
              } else if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
                 year = rawDate.getFullYear();
                 month = rawDate.getMonth() + 1;
              }
           } else if (val.year && val.month) {
              year = parseYearName(val.year);
              month = parseMonthName(val.month);
              dateStr = `${year}-${String(month).padStart(2, '0')}-${String(val.day || 1).padStart(2, '0')}`;
           } else if (val.tahun && val.bulan) {
              year = parseYearName(val.tahun);
              month = parseMonthName(val.bulan);
              dateStr = `${year}-${String(month).padStart(2, '0')}-${String(val.hari || val.day || 1).padStart(2, '0')}`;
           }
           
           if (!year || !month) {
             if (!dateStr) dateStr = String(d.id);
             
             const cleanDateStr = dateStr.toLowerCase().trim();

             // Check for Indonesian/English month name inside string
             let foundMonth = 0;
             for (const [mName, mVal] of Object.entries(INDONESIAN_MONTHS_MAP)) {
               const regex = new RegExp(`\\b${mName}\\b`);
               if (regex.test(cleanDateStr)) {
                 foundMonth = mVal;
                 break;
               }
             }

             if (foundMonth) {
               month = foundMonth;
               const yearMatch = cleanDateStr.match(/\b(20\d{2})\b/);
               if (yearMatch) {
                 year = parseInt(yearMatch[1], 10);
               }
             } else {
               // Check for YYYY-MM-DD or DD-MM-YYYY with various separators (-, /, .)
               const yyyyMmDdMatch = cleanDateStr.match(/(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
               const ddMmYyyyMatch = cleanDateStr.match(/(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/);
               
               if (yyyyMmDdMatch) {
                  year = parseInt(yyyyMmDdMatch[1], 10);
                  month = parseInt(yyyyMmDdMatch[2], 10);
               } else if (ddMmYyyyMatch) {
                  year = parseInt(ddMmYyyyMatch[3], 10);
                  month = parseInt(ddMmYyyyMatch[2], 10);
               } else if (/^\d+$/.test(cleanDateStr)) {
                   const dt = new Date(parseInt(cleanDateStr, 10));
                   if (!isNaN(dt.getTime())) {
                     year = dt.getFullYear();
                     month = dt.getMonth() + 1;
                   }
               } else {
                   const parsedDate = new Date(cleanDateStr);
                   if (!isNaN(parsedDate.getTime())) {
                     year = parsedDate.getFullYear();
                     month = parsedDate.getMonth() + 1;
                   }
               }
             }
           }

           const [keyYearStr, keyMonthStr] = key.split('-');
           const keyYear = parseInt(keyYearStr, 10);
           const keyMonth = parseInt(keyMonthStr, 10);
           
           let isMatch = false;
           if (year && month) {
             isMatch = (year === keyYear && month === keyMonth);
           } else {
             // Fallback string match
             isMatch = dateStr.includes(key) || dateStr.includes(`${keyMonthStr}-${keyYearStr}`) || dateStr.includes(`${keyYearStr}${keyMonthStr}`);
           }

           if (!isMatch) return;

           const parseAmount = (v: any): number => {
              if (typeof v === 'number') return Math.abs(v);
              if (typeof v === 'string') {
                  let cleaned = v.split(',')[0].replace(/[^0-9]/g, '');
                  return Number(cleaned) || 0;
              }
              return 0;
           };

           const isNegativeValue = (v: any): boolean => {
              if (typeof v === 'number') return v < 0;
              if (typeof v === 'string') return v.includes('-');
              return false;
           };

           const isNegative = isNegativeValue(val.amount) || isNegativeValue(val.nominal) || isNegativeValue(val.jumlah) || isNegativeValue(val.value) || isNegativeValue(val.total) || isNegativeValue(val.harga);
           let amount = parseAmount(val.amount) || parseAmount(val.nominal) || parseAmount(val.jumlah) || parseAmount(val.value) || parseAmount(val.total) || parseAmount(val.harga);
           const typeStr = String(val.type || val.tipe || val.jenis || val.kategori || val.status || '').toLowerCase().trim();
           
           let isProcessed = false;
           if (val.pemasukan !== undefined && val.pemasukan !== null && parseAmount(val.pemasukan) > 0) {
              totalIncome += parseAmount(val.pemasukan);
              isProcessed = true;
           }
           if (val.pengeluaran !== undefined && val.pengeluaran !== null && parseAmount(val.pengeluaran) > 0) {
              totalExpense += parseAmount(val.pengeluaran);
              isProcessed = true;
           }
           if (val.income !== undefined && val.income !== null && parseAmount(val.income) > 0) {
              totalIncome += parseAmount(val.income);
              isProcessed = true;
           }
           if (val.expense !== undefined && val.expense !== null && parseAmount(val.expense) > 0) {
              totalExpense += parseAmount(val.expense);
              isProcessed = true;
           }

           if (!isProcessed) {
              if (val.isIncome === true || val.isPemasukan === true) {
                 totalIncome += amount;
              } else if (val.isExpense === true || val.isPengeluaran === true) {
                 totalExpense += amount;
              } else if (isNegative) {
                 totalExpense += amount;
              } else {
                  if (['income', 'pemasukan', 'in', 'masuk'].includes(typeStr)) {
                    totalIncome += amount;
                  } else if (['expense', 'pengeluaran', 'out', 'keluar'].includes(typeStr) || typeStr === '') {
                    // Default to expense if empty/unrecognized
                    totalExpense += amount;
                  }
              }
           }
           
           // For unique dates count
           let dateKey = dateStr;
           if (year && month) {
              const dt = new Date(year, month - 1, val.day || 1); // rough fallback
              if (rawDate && (typeof rawDate === 'number' || rawDate.toDate || rawDate instanceof Date)) {
                let actualDt = rawDate instanceof Date ? rawDate : (rawDate.toDate ? rawDate.toDate() : new Date(rawDate));
                dateKey = `${actualDt.getFullYear()}-${actualDt.getMonth()+1}-${actualDt.getDate()}`;
              } else if (dateStr) {
                dateKey = dateStr.slice(0, 10);
              }
           }
           dates.add(dateKey);
        });

        const daysFilled = dates.size || 1; // avoid div by 0
        
        return {
          netBalance: totalIncome - totalExpense,
          totalExpense: totalExpense,
          avgExpenseDay: totalExpense / daysFilled,
          remainingMonthlyLimit: limitBulanan - totalExpense
        };
      };

      setData({
        thisMonth: calcForMonth(monthYearKey),
        lastMonth: calcForMonth(prevKey)
      });
    };

    const unsubConfig = onSnapshot(collection(db, 'users', userId, 'config'), (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0].data();
        if (typeof d.limitBulanan === 'number') {
           limitBulanan = d.limitBulanan;
        } else if (typeof d.monthlyLimit === 'number') {
           limitBulanan = d.monthlyLimit;
        }
        calculateData();
      }
    });

    const unsubData = onSnapshot(collection(db, 'users', userId, 'data'), (snap) => {
      latestDataSnap = snap;
      calculateData();
    }, (error) => {
      console.error("Firestore permission error:", error);
      window.dispatchEvent(new CustomEvent('firestore-error', { detail: error.message }));
      const emptyMoney = { netBalance: 0, totalExpense: 0, avgExpenseDay: 0, remainingMonthlyLimit: limitBulanan };
      setData({ thisMonth: emptyMoney, lastMonth: emptyMoney });
    });

    return () => {
      unsubConfig();
      unsubData();
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
    }, (error) => {
      console.error("Firestore permission error:", error);
      window.dispatchEvent(new CustomEvent('firestore-error', { detail: error.message }));
      setData({ yearlyResolutions: [], monthlyGoals: [], weeklyGoals: [] });
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

    const docRef = doc(db, 'users', userId, 'evaluations', monthYearKey);

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

    const unsub = onSnapshot(docRef, (docSnap) => {
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
          productivity: [],
          money: [],
          habits: [],
          goals: []
        });
      }
    }, (error) => {
      console.error("Firestore permission error:", error);
      window.dispatchEvent(new CustomEvent('firestore-error', { detail: error.message }));
      setData({
        productivity: [],
        money: [],
        habits: [],
        goals: []
      });
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

    const docRef = doc(db, 'users', userId, 'evaluations', monthYearKey);
    await setDoc(docRef, updatedData, { merge: true });
  };

  return { data, saveEvaluations };
}
