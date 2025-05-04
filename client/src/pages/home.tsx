import React from 'react';
import { useHabit } from '@/context/HabitContext';
import Sidebar from '@/components/Sidebar';
import CategoryHeader from '@/components/CategoryHeader';
import AddHabitSection from '@/components/AddHabitSection';
import HabitCard from '@/components/HabitCard';

const Home: React.FC = () => {
  const { habits, isLoading } = useHabit();
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <CategoryHeader />
        
        <AddHabitSection />
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading habits...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No habits found</h3>
                <p className="text-gray-500">
                  Create a new habit above to get started with tracking your progress.
                </p>
              </div>
            ) : (
              habits.map(habit => (
                <HabitCard key={habit.id} habit={habit} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
