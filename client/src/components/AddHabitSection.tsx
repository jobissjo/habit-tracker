import React, { useState } from 'react';
import { useStaticHabit } from '@/context/StaticHabitContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const AddHabitSection: React.FC = () => {
  const { selectedCategoryId, createHabit } = useStaticHabit();
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    pointsPerCompletion: 10,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategoryId || !newHabit.name.trim()) {
      return;
    }
    
    await createHabit({
      name: newHabit.name.trim(),
      description: newHabit.description.trim() || undefined,
      pointsPerCompletion: Number(newHabit.pointsPerCompletion),
      categoryId: selectedCategoryId,
    });
    
    // Reset form
    setNewHabit({
      name: '',
      description: '',
      pointsPerCompletion: 10,
    });
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Add New Habit</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="e.g., Solve one LeetCode problem"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="habit-points">Points Per Completion</Label>
              <Input
                id="habit-points"
                type="number"
                min="1"
                max="100"
                value={newHabit.pointsPerCompletion}
                onChange={(e) => setNewHabit({ 
                  ...newHabit, 
                  pointsPerCompletion: Math.max(1, parseInt(e.target.value) || 1) 
                })}
                placeholder="e.g., 10"
                className="mt-1"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="habit-description">Description (Optional)</Label>
            <Textarea
              id="habit-description"
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              placeholder="Any additional details about this habit"
              rows={2}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!selectedCategoryId}>
              Add Habit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddHabitSection;
