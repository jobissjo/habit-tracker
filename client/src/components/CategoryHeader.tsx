import React from 'react';
import { useHabit } from '@/context/HabitContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const TIMEFRAMES = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' },
];

const CategoryHeader: React.FC = () => {
  const { categories, selectedCategoryId } = useHabit();
  
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  
  if (!selectedCategory) {
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Select a Category</h1>
        <p className="text-sm text-gray-600">Choose a category from the sidebar or create a new one</p>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: selectedCategory.color }}
          ></div>
          <h1 className="text-2xl font-semibold text-gray-800">{selectedCategory.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((timeframe) => (
                <SelectItem key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {selectedCategory.description && (
        <p className="text-sm text-gray-600">{selectedCategory.description}</p>
      )}
    </div>
  );
};

export default CategoryHeader;
