import { CloudSun, Heart, Shield, WashingMachine, MessageSquare, Map, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { CategoryFilters, DataSource } from "@shared/schema";

interface SidebarProps {
  filters: CategoryFilters;
  onFilterChange: (filters: CategoryFilters) => void;
  overallScore: number;
  dataSources: DataSource[];
}

export function Sidebar({ filters, onFilterChange, overallScore, dataSources }: SidebarProps) {
  const categories = [
    {
      key: 'weather' as keyof CategoryFilters,
      name: 'Weather',
      description: 'Temperature, precipitation, air quality',
      icon: CloudSun,
      color: 'text-blue-500',
    },
    {
      key: 'health' as keyof CategoryFilters,
      name: 'Health',
      description: 'Disease reports, hospital data',
      icon: Heart,
      color: 'text-red-500',
    },
    {
      key: 'safety' as keyof CategoryFilters,
      name: 'Safety',
      description: 'Crime rates, incident reports',
      icon: Shield,
      color: 'text-green-500',
    },
    {
      key: 'hygiene' as keyof CategoryFilters,
      name: 'Hygiene',
      description: 'Sanitation, cleanliness reports',
      icon: WashingMachine,
      color: 'text-purple-500',
    },
    {
      key: 'social' as keyof CategoryFilters,
      name: 'Social Sentiment',
      description: 'Twitter, Reddit, public opinion',
      icon: MessageSquare,
      color: 'text-indigo-500',
    },
  ];

  const handleCategoryToggle = (key: keyof CategoryFilters) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const getMoodSliderPosition = (score: number) => {
    // Convert score (0-10) to position (0-100%)
    return Math.min(100, Math.max(0, (score / 10) * 100));
  };

  const getMoodColor = (score: number) => {
    if (score >= 6) return 'text-mood-positive';
    if (score >= 4) return 'text-mood-neutral';
    return 'text-mood-negative';
  };

  const getDataSourceStatus = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-500', label: 'Active' };
      case 'limited':
        return { color: 'bg-yellow-500', label: 'Limited' };
      case 'error':
        return { color: 'bg-red-500', label: 'Error' };
      default:
        return { color: 'bg-gray-500', label: 'Unknown' };
    }
  };

  return (
    <div className="w-80 bg-surface shadow-lg z-20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Map className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">MoodMap</h1>
            <p className="text-sm text-gray-500">Geographic Mood Analysis</p>
          </div>
        </div>
      </div>

      {/* Category Controls */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood Categories</h2>
        
        <div className="space-y-4">
          {categories.map(({ key, name, description, icon: Icon, color }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => handleCategoryToggle(key)}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`${color} h-5 w-5`} />
                <div>
                  <p className="font-medium text-gray-900">{name}</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
              <Switch
                checked={filters[key]}
                onCheckedChange={() => handleCategoryToggle(key)}
              />
            </div>
          ))}
        </div>

        {/* Overall Mood Score */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Overall Regional Mood</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Negative</span>
                <span>Positive</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 relative">
                <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full"></div>
                <div 
                  className="absolute top-0 w-3 h-3 bg-white rounded-full border-2 border-gray-400 transform -translate-x-1/2"
                  style={{ left: `${getMoodSliderPosition(overallScore)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getMoodColor(overallScore)}`}>
                {overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">/ 10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Status */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Data Sources</h3>
        <div className="space-y-2">
          {dataSources.map((source) => {
            const status = getDataSourceStatus(source.status);
            return (
              <div key={source.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{source.name}</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 ${status.color} rounded-full`}></div>
                  <span className="text-xs text-gray-500">{status.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
