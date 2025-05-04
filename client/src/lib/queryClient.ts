import { QueryClient } from "@tanstack/react-query";

// This is a placeholder version of queryClient for our frontend-only implementation
// In a real application with a backend, this would handle API requests

// Mock response function - used with StaticHabitContext, no real API calls needed
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Create a mock Response object
  const mockResponse = new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
  
  return mockResponse;
}

// Mock queryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // These settings prevent unnecessary refetching
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
