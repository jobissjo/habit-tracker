import React, { useState } from 'react';
import { useStaticHabit } from '@/context/StaticHabitContext';
import UsePointsModal from './modals/UsePointsModal';

const PointSystem: React.FC = () => {
  const { user } = useStaticHabit();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Define max points for progress bar (could be dynamic based on user level)
  const maxPoints = 500;
  const currentPoints = user?.points || 0;
  const progressPercentage = Math.min((currentPoints / maxPoints) * 100, 100);
  
  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className="bg-primary-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-700">Your Points</h2>
            <span className="text-lg font-semibold text-primary-600">{currentPoints}</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{maxPoints}</span>
            </div>
          </div>
          <button 
            className="mt-2 w-full text-sm bg-primary-500 hover:bg-primary-600 text-white font-medium py-1 px-3 rounded transition duration-200"
            onClick={() => setIsModalOpen(true)}
            disabled={currentPoints <= 0}
          >
            Use Points
          </button>
        </div>
      </div>

      <UsePointsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default PointSystem;
