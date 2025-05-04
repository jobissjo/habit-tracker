import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useStaticHabit } from '@/context/StaticHabitContext';
import { useMobile } from '@/hooks/use-mobile';
import PointSystem from './PointSystem';
import CategoryList from './CategoryList';

const Sidebar: React.FC = () => {
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside className={`w-full md:w-64 bg-white border-r border-gray-200 ${isMobile ? 'h-auto' : 'md:h-screen md:sticky md:top-0'}`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-200 md:block">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="text-xl font-semibold text-gray-800">Habit Tracker</h1>
        </div>
        {isMobile && (
          <button onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {(!isMobile || isOpen) && (
        <>
          <PointSystem />
          
          <CategoryList />
          
          <div className="p-4 mt-auto border-t border-gray-200">
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
