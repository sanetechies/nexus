import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { MoodData, DataSource, CategoryFilters } from "@shared/schema";

export function useMoodData(filters: CategoryFilters) {
  return useQuery({
    queryKey: ['/api/mood-data', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        weather: filters.weather.toString(),
        health: filters.health.toString(),
        safety: filters.safety.toString(),
        hygiene: filters.hygiene.toString(),
        social: filters.social.toString(),
      });
      
      const response = await fetch(`/api/mood-data?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mood data');
      }
      return response.json() as Promise<(MoodData & { filteredScore: number })[]>;
    },
  });
}

export function useMoodDataByArea(areaId: string) {
  return useQuery({
    queryKey: ['/api/mood-data', areaId],
    queryFn: async () => {
      const response = await fetch(`/api/mood-data/${areaId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch area data');
      }
      return response.json() as Promise<MoodData>;
    },
    enabled: !!areaId,
  });
}

export function useDataSources() {
  return useQuery({
    queryKey: ['/api/data-sources'],
    queryFn: async () => {
      const response = await fetch('/api/data-sources');
      if (!response.ok) {
        throw new Error('Failed to fetch data sources');
      }
      return response.json() as Promise<DataSource[]>;
    },
  });
}

export function useOverallMood(filters: CategoryFilters) {
  return useQuery({
    queryKey: ['/api/overall-mood', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        weather: filters.weather.toString(),
        health: filters.health.toString(),
        safety: filters.safety.toString(),
        hygiene: filters.hygiene.toString(),
        social: filters.social.toString(),
      });
      
      const response = await fetch(`/api/overall-mood?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch overall mood');
      }
      return response.json() as Promise<{ overallScore: number; activeCategories: number }>;
    },
  });
}

export function useRefreshMoodData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (areaId?: string) => {
      const url = areaId ? `/api/mood-data/${areaId}/refresh` : '/api/mood-data/refresh';
      const response = await apiRequest('POST', url);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/overall-mood'] });
    },
  });
}
