import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStaticHabit } from '@/context/StaticHabitContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const COLORS = [
  { value: '#6366f1', label: 'Primary' },
  { value: '#8b5cf6', label: 'Secondary' },
  { value: '#10b981', label: 'Success' },
  { value: '#f59e0b', label: 'Warning' },
  { value: '#ef4444', label: 'Danger' },
  { value: '#3b82f6', label: 'Info' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#14b8a6', label: 'Teal' },
];

const CategoryList: React.FC = () => {
  const { categories, selectedCategoryId, selectCategory, createCategory } = useStaticHabit();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: COLORS[0].value,
  });

  const handleCategoryClick = (categoryId: number) => {
    selectCategory(categoryId);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newCategory.name.trim()) {
      await createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
        color: newCategory.color,
      });
      
      // Reset form and close dialog
      setNewCategory({
        name: '',
        description: '',
        color: COLORS[0].value,
      });
      setIsAddCategoryOpen(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Categories</h2>
        <button 
          className="text-primary-500 hover:text-primary-600"
          onClick={() => setIsAddCategoryOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-1">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer ${
              category.id === selectedCategoryId ? 'bg-gray-100' : ''
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div 
              className="w-2 h-2 rounded-full mr-2" 
              style={{ backgroundColor: category.color }}
            ></div>
            <span className="text-sm">{category.name}</span>
          </div>
        ))}
        
        {categories.length === 0 && (
          <div className="text-sm text-gray-500 p-2">
            No categories yet. Add one to get started!
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Learning, Health, Work"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category-description">Description (Optional)</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="What kind of habits belong in this category?"
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Category Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <div
                      key={color.value}
                      className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                        newCategory.color === color.value ? 'border-gray-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                      title={color.label}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryList;
