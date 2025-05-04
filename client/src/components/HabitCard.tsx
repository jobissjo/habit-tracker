import React, { useState } from 'react';
import { Clock, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { useStaticHabit } from '@/context/StaticHabitContext';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HabitResponse } from '@shared/types';
import StreakVisualization from './StreakVisualization';
import EditHabitModal from './modals/EditHabitModal';
import DeleteHabitModal from './modals/DeleteHabitModal';

interface HabitCardProps {
  habit: HabitResponse;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { completeHabit, addNote } = useStaticHabit();
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Check if habit was completed today
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCompletion = habit.streakData?.find(day => 
    day.date === today && (day.isCompleted || day.isPointRedeemed)
  );
  const isCompletedToday = !!todayCompletion;

  const handleToggleCompletion = async () => {
    if (!isCompletedToday) {
      await completeHabit({
        habitId: habit.id,
        completionDate: today
      });
    }
    // Note: We don't handle unchecking as that would break the streak logic
  };

  const handleSaveNote = async () => {
    if (noteContent.trim() && todayCompletion) {
      await addNote({
        completionId: todayCompletion.id,
        content: noteContent.trim()
      });
      setNoteContent('');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-800">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>{habit.currentStreak || 0}</span>
              <span className="ml-1">day streak</span>
            </div>
            <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{habit.pointsPerCompletion}</span>
              <span className="ml-1">pts/day</span>
            </div>
          </div>
        </div>
        
        {/* Streak Visualization */}
        <StreakVisualization streakData={habit.streakData || []} />
        
        {/* Today's Action */}
        <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Today:</span>
            <div className="flex items-center">
              <Checkbox 
                id={`complete-habit-${habit.id}`} 
                checked={isCompletedToday} 
                onCheckedChange={handleToggleCompletion}
                disabled={isCompletedToday}
              />
              <label 
                htmlFor={`complete-habit-${habit.id}`} 
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                {isCompletedToday ? 'Marked as completed' : 'Mark as completed'}
              </label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button 
              className="text-gray-400 hover:text-error-500"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="mt-4">
          <button 
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
            onClick={() => setIsNotesVisible(!isNotesVisible)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 mr-1 transition-transform ${isNotesVisible ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{isNotesVisible ? 'Hide notes' : 'Add notes for today'}</span>
          </button>
          
          {isNotesVisible && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              {/* Previous notes for today */}
              {todayCompletion && todayCompletion.notes && todayCompletion.notes.length > 0 && (
                <div className="mb-2 pb-2 border-b border-gray-200">
                  {todayCompletion.notes.map(note => (
                    <div key={note.id} className="flex justify-between items-start">
                      <p className="text-sm text-gray-700">{note.content}</p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(note.createdAt), 'h:mm a')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new note form */}
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={`Add ${todayCompletion?.notes?.length ? 'more ' : ''}notes about your habit completion today...`}
                rows={2}
                className="w-full"
                disabled={!isCompletedToday}
              />
              <div className="mt-2 flex justify-end">
                <Button 
                  onClick={handleSaveNote} 
                  size="sm"
                  disabled={!noteContent.trim() || !isCompletedToday}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Modals */}
      <EditHabitModal 
        habit={habit} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
      
      <DeleteHabitModal 
        habit={habit} 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
      />
    </Card>
  );
};

export default HabitCard;
