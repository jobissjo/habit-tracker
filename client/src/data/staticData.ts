import { 
  UserResponse, 
  CategoryResponse, 
  HabitResponse, 
  StreakDay 
} from '../types/apiResponseTypes';
import { format, subDays } from 'date-fns';

// Create a current user with some points
export const currentUser: UserResponse = {
  id: 1,
  username: 'testuser',
  points: 250,
};

// Create categories for habit organization
export const categories: CategoryResponse[] = [
  {
    id: 1,
    name: 'Health',
    description: 'Track your health-related habits',
    color: '#6366f1',
    userId: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Learning',
    description: 'Track your learning progress and keep up with coding challenges',
    color: '#8b5cf6',
    userId: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Productivity',
    description: 'Track work and productivity habits',
    color: '#10b981',
    userId: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Fitness',
    description: 'Track exercise and fitness activities',
    color: '#f59e0b',
    userId: 1,
    createdAt: new Date().toISOString(),
  },
];

// Generate streak data for habits
const generateStreakData = (patternType: 'regular' | 'gaps' | 'recent'): StreakDay[] => {
  const today = new Date();
  const streakData: StreakDay[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    let isCompleted = false;
    let isPointRedeemed = false;
    
    if (patternType === 'regular') {
      // Skip days 1, 16, 17 to create gaps
      if (i !== 1 && i !== 16 && i !== 17) {
        isCompleted = true;
        
        // Day 8 is a point redeemed day
        if (i === 8) {
          isCompleted = false;
          isPointRedeemed = true;
        }
      }
    } else if (patternType === 'gaps') {
      // More gaps for a less regular habit
      if (i !== 0 && i !== 3 && i !== 4 && i !== 10 && i !== 11 && i !== 18 && i !== 29) {
        isCompleted = true;
        
        // Day 12 is a point redeemed day
        if (i === 12) {
          isCompleted = false;
          isPointRedeemed = true;
        }
      }
    } else if (patternType === 'recent') {
      // Only recent activity in the last 8 days
      if (i < 8) {
        isCompleted = true;
      }
    }
    
    streakData.push({
      date: dateStr,
      isCompleted,
      isPointRedeemed,
    });
  }
  
  return streakData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Calculate current streak
const calculateCurrentStreak = (streakData: StreakDay[]): number => {
  if (!streakData || streakData.length === 0) return 0;
  
  // Sort by date in descending order (newest first)
  const sortedData = [...streakData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get today's date and yesterday
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  
  // Check if today or yesterday is completed to continue the streak
  const todayCompleted = sortedData.find(day => 
    day.date === todayStr && (day.isCompleted || day.isPointRedeemed)
  );
  
  const yesterdayCompleted = sortedData.find(day => 
    day.date === yesterdayStr && (day.isCompleted || day.isPointRedeemed)
  );
  
  // If neither today nor yesterday is completed, streak is broken
  if (!todayCompleted && !yesterdayCompleted) return 0;
  
  // Count consecutive days
  let streak = 0;
  let currentDate = todayCompleted ? today : new Date(yesterdayStr);
  
  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayData = sortedData.find(day => day.date === dateStr);
    
    if (dayData && (dayData.isCompleted || dayData.isPointRedeemed)) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Create sample habits
export const habits: HabitResponse[] = [
  {
    id: 1,
    name: 'Solve one LeetCode problem',
    description: 'Improve algorithm problem-solving skills daily',
    pointsPerCompletion: 10,
    categoryId: 2, // Learning category
    userId: 1,
    createdAt: subDays(new Date(), 30).toISOString(),
    category: categories.find(c => c.id === 2),
    streakData: generateStreakData('regular'),
    currentStreak: 15, // This will be calculated dynamically in a real app
  },
  {
    id: 2,
    name: 'Read technical article',
    description: 'Stay updated with the latest tech trends',
    pointsPerCompletion: 5,
    categoryId: 2, // Learning category
    userId: 1,
    createdAt: subDays(new Date(), 25).toISOString(),
    category: categories.find(c => c.id === 2),
    streakData: generateStreakData('gaps'),
    currentStreak: 3, // This will be calculated dynamically in a real app
  },
  {
    id: 3,
    name: 'Code review contributions',
    description: 'Review pull requests and give feedback to peers',
    pointsPerCompletion: 15,
    categoryId: 2, // Learning category
    userId: 1,
    createdAt: subDays(new Date(), 10).toISOString(),
    category: categories.find(c => c.id === 2),
    streakData: generateStreakData('recent'),
    currentStreak: 8, // This will be calculated dynamically in a real app
  },
];