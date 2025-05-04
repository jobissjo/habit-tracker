import React, { useState, useEffect } from 'react';
import { useHabit } from '@/context/HabitContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HabitResponse } from '@shared/types';

interface EditHabitModalProps {
  habit: HabitResponse;
  isOpen: boolean;
  onClose: () => void;
}

const EditHabitModal: React.FC<EditHabitModalProps> = ({ habit, isOpen, onClose }) => {
  const { categories, updateHabit } = useHabit();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsPerCompletion: 0,
    categoryId: 0,
  });
  
  // Initialize form data when habit changes or modal opens
  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        pointsPerCompletion: habit.pointsPerCompletion,
        categoryId: habit.categoryId,
      });
    }
  }, [habit, isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateHabit(habit.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      pointsPerCompletion: formData.pointsPerCompletion,
      categoryId: formData.categoryId,
    });
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-habit-name">Habit Name</Label>
              <Input
                id="edit-habit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-habit-category">Category</Label>
              <Select 
                value={String(formData.categoryId)} 
                onValueChange={(value) => setFormData({ ...formData, categoryId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-habit-points">Points Per Completion</Label>
              <Input
                id="edit-habit-points"
                type="number"
                min="1"
                value={formData.pointsPerCompletion}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  pointsPerCompletion: Math.max(1, parseInt(e.target.value) || 1) 
                })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-habit-description">Description (Optional)</Label>
              <Textarea
                id="edit-habit-description"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHabitModal;
