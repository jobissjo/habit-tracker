import React from 'react';
import { useStaticHabit } from '@/context/StaticHabitContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HabitResponse } from '@shared/types';

interface DeleteHabitModalProps {
  habit: HabitResponse;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteHabitModal: React.FC<DeleteHabitModalProps> = ({ habit, isOpen, onClose }) => {
  const { deleteHabit } = useStaticHabit();
  
  const handleDelete = async () => {
    await deleteHabit(habit.id);
    onClose();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Habit</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{habit.name}"? This action cannot be undone and you will lose all streak data associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-error-500 hover:bg-red-600"
          >
            Delete Habit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteHabitModal;
