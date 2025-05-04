import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  CategoryResponse, 
  HabitResponse, 
  UserResponse,
  CreateCategoryRequest,
  CreateHabitRequest,
  UpdateHabitRequest,
  CompleteHabitRequest,
  UsePointsRequest,
  AddNoteRequest
} from '@shared/types';
import { apiRequest } from '@/lib/queryClient';

interface HabitContextType {
  // User data
  user: UserResponse | null;
  categories: CategoryResponse[];
  habits: HabitResponse[];
  selectedCategoryId: number | null;
  
  // Data loading states
  isLoading: boolean;
  
  // Actions
  selectCategory: (categoryId: number | null) => void;
  createCategory: (data: CreateCategoryRequest) => Promise<void>;
  createHabit: (data: CreateHabitRequest) => Promise<void>;
  updateHabit: (id: number, data: UpdateHabitRequest) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  completeHabit: (data: CompleteHabitRequest) => Promise<void>;
  usePoints: (data: UsePointsRequest) => Promise<void>;
  addNote: (data: AddNoteRequest) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | null>(null);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Fetch user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Set initial selected category once loaded
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Fetch habits based on selected category
  const { data: habits = [], isLoading: isHabitsLoading } = useQuery({
    queryKey: ['/api/habits', selectedCategoryId],
    enabled: selectedCategoryId !== null,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      await apiRequest('POST', '/api/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: 'Category created',
        description: 'New category has been created successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create category: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: async (data: CreateHabitRequest) => {
      await apiRequest('POST', '/api/habits', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit created',
        description: 'New habit has been created successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create habit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update habit mutation
  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateHabitRequest }) => {
      await apiRequest('PATCH', `/api/habits/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit updated',
        description: 'Habit has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update habit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit deleted',
        description: 'Habit has been deleted successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete habit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Complete habit mutation
  const completeHabitMutation = useMutation({
    mutationFn: async (data: CompleteHabitRequest) => {
      await apiRequest('POST', '/api/completions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: 'Habit completed',
        description: 'Habit has been marked as completed for today.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to complete habit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Use points mutation
  const usePointsMutation = useMutation({
    mutationFn: async (data: UsePointsRequest) => {
      await apiRequest('POST', '/api/points/use', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: 'Points used',
        description: 'Points have been used to continue your streak.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to use points: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (data: AddNoteRequest) => {
      await apiRequest('POST', '/api/notes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Note added',
        description: 'Note has been added successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add note: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Context value
  const value: HabitContextType = {
    user,
    categories,
    habits,
    selectedCategoryId,
    isLoading: isUserLoading || isCategoriesLoading || isHabitsLoading,
    
    selectCategory: (categoryId: number | null) => {
      setSelectedCategoryId(categoryId);
    },
    
    createCategory: async (data: CreateCategoryRequest) => {
      await createCategoryMutation.mutateAsync(data);
    },
    
    createHabit: async (data: CreateHabitRequest) => {
      await createHabitMutation.mutateAsync(data);
    },
    
    updateHabit: async (id: number, data: UpdateHabitRequest) => {
      await updateHabitMutation.mutateAsync({ id, data });
    },
    
    deleteHabit: async (id: number) => {
      await deleteHabitMutation.mutateAsync(id);
    },
    
    completeHabit: async (data: CompleteHabitRequest) => {
      await completeHabitMutation.mutateAsync(data);
    },
    
    usePoints: async (data: UsePointsRequest) => {
      await usePointsMutation.mutateAsync(data);
    },
    
    addNote: async (data: AddNoteRequest) => {
      await addNoteMutation.mutateAsync(data);
    },
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabit must be used within a HabitProvider');
  }
  return context;
};
