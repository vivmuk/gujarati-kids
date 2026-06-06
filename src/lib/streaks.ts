export interface StreakData {
  currentStreak: number;
  lastLoginDate: string | null;
  bestStreak: number;
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') return { currentStreak: 0, lastLoginDate: null, bestStreak: 0 };
  
  const raw = localStorage.getItem('guju_streak');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // parse error
    }
  }
  return { currentStreak: 0, lastLoginDate: null, bestStreak: 0 };
}

export function updateStreak(): StreakData {
  const data = getStreakData();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  if (data.lastLoginDate === today) {
    // Already logged in today
    return data;
  }
  
  if (!data.lastLoginDate) {
    // First ever login
    data.currentStreak = 1;
    data.bestStreak = 1;
    data.lastLoginDate = today;
  } else {
    // Check if the difference is exactly 1 day
    const lastDate = new Date(data.lastLoginDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      data.currentStreak += 1;
      if (data.currentStreak > data.bestStreak) {
        data.bestStreak = data.currentStreak;
      }
    } else if (diffDays > 1) {
      // Streak broken
      data.currentStreak = 1;
    }
    data.lastLoginDate = today;
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('guju_streak', JSON.stringify(data));
  }
  
  return data;
}

export const BELT_TIERS = [
  { max: 10, name: 'White Kite (સફેદ પતંગ)', color: 'bg-white text-gray-800' },
  { max: 25, name: 'Yellow Charkha (પીળો ચરખો)', color: 'bg-yellow-400 text-yellow-900' },
  { max: 40, name: 'Orange Garba (નારંગી ગરબા)', color: 'bg-orange-500 text-white' },
  { max: 60, name: 'Green Mango (લીલી કેરી)', color: 'bg-green-500 text-white' },
  { max: 80, name: 'Blue Peacock (વાદળી મોર)', color: 'bg-blue-500 text-white' },
  { max: 100, name: 'Golden Lion (સુવર્ણ સિંહ)', color: 'bg-yellow-500 text-white border-2 border-yellow-200' },
];

export function getBeltForPercentage(percent: number) {
  for (const tier of BELT_TIERS) {
    if (percent <= tier.max) {
      return tier;
    }
  }
  return BELT_TIERS[BELT_TIERS.length - 1];
}
