import React, { useState } from 'react';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { useHabit } from '@/context/HabitContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { HabitResponse } from '@shared/types';

interface UsePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UsePointsModal: React.FC<UsePointsModalProps> = ({ isOpen, onClose }) => {
  const { user, habits, usePoints } = useHabit();
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(subDays(new Date(), 1));
  
  const selectedHabit = selectedHabitId 
    ? habits.find(h => h.id === selectedHabitId) 
    : null;
  
  // Calculate cost - more points needed for older dates
  const getPointCost = (habit: HabitResponse, date: Date) => {
    if (!habit) return 0;
    
    const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const baseCost = habit.pointsPerCompletion * 5;
    const additionalCost = daysAgo > 1 ? (daysAgo - 1) * 10 : 0;
    
    return baseCost + additionalCost;
  };
  
  const pointsNeeded = selectedHabit && selectedDate
    ? getPointCost(selectedHabit, selectedDate)
    : 0;
  
  const canUsePoints = user && selectedHabit && selectedDate && user.points >= pointsNeeded;
  
  // Limit selectable dates to past dates that aren't already completed
  const isDateDisabled = (date: Date) => {
    // Can't use points for future or today
    if (isAfter(date, new Date()) || format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
      return true;
    }
    
    // Can't use points for dates more than 30 days ago
    if (isBefore(date, subDays(new Date(), 30))) {
      return true;
    }
    
    // Can't use points for dates that are already completed
    if (selectedHabit && selectedHabit.streakData) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = selectedHabit.streakData.find(d => d.date === dateStr);
      if (dayData && (dayData.isCompleted || dayData.isPointRedeemed)) {
        return true;
      }
    }
    
    return false;
  };
  
  const handleUsePoints = async () => {
    if (!selectedHabit || !selectedDate || !canUsePoints) return;
    
    await usePoints({
      habitId: selectedHabit.id,
      completionDate: format(selectedDate, 'yyyy-MM-dd')
    });
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use Points to Continue Streak</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            You can use your accumulated points to maintain your streak when you miss a day. 
            This will mark the missed day as completed.
          </p>
          
          <div className="mb-4 p-3 bg-primary-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Your Points:</span>
              <span className="text-lg font-semibold text-primary-600">{user?.points || 0}</span>
            </div>
          </div>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="habit-select">Select Habit</Label>
              <Select 
                value={selectedHabitId?.toString() || ""} 
                onValueChange={(value) => setSelectedHabitId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a habit" />
                </SelectTrigger>
                <SelectContent>
                  {habits.map((habit) => (
                    <SelectItem key={habit.id} value={habit.id.toString()}>
                      {habit.name} ({habit.pointsPerCompletion * 5} points minimum)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Select Missed Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className="rounded-md border"
              />
            </div>
            
            {selectedHabit && selectedDate && (
              <div className="text-center p-2 bg-gray-50 rounded-md">
                <p className="text-sm font-medium">
                  Cost: <span className="text-primary-600">{pointsNeeded} points</span>
                </p>
                {!canUsePoints && (
                  <p className="text-sm text-error-500 mt-1">
                    Not enough points available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUsePoints}
            disabled={!canUsePoints}
          >
            Use {pointsNeeded} Points
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsePointsModal;
