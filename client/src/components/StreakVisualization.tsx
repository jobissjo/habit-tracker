import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { StreakDay } from '@shared/types';

interface StreakVisualizationProps {
  streakData: StreakDay[];
  timeframe?: '30' | '90' | 'year' | 'all';
}

const StreakVisualization: React.FC<StreakVisualizationProps> = ({ 
  streakData, 
  timeframe = '30' 
}) => {
  // Ensure we have data for visualization
  const data = streakData || [];
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Activity</h4>
        <span className="text-xs text-gray-500">
          {timeframe === '30' && 'Last 30 days'}
          {timeframe === '90' && 'Last 90 days'}
          {timeframe === 'year' && 'This year'}
          {timeframe === 'all' && 'All time'}
        </span>
      </div>
      <div className="flex flex-wrap">
        {data.map((day, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`streak-cell ${
                    day.isPointRedeemed 
                      ? 'bg-warning-500 opacity-70' 
                      : day.isCompleted 
                        ? 'bg-success-500 opacity-100' 
                        : 'bg-success-500 opacity-30'
                  }`}
                >
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {format(new Date(day.date), 'MMM d')}: 
                  {day.isPointRedeemed 
                    ? ' Used points to continue streak' 
                    : day.isCompleted 
                      ? ' Completed' 
                      : ' Not completed'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {/* Show message when no data */}
        {data.length === 0 && (
          <div className="text-sm text-gray-500 py-2">
            No activity data available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakVisualization;
