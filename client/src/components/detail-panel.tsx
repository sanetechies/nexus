import { X, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryIcon, getCategoryColor, formatTimestamp, getMoodColor, getMoodLabel } from "@/lib/map-utils";
import type { MoodData } from "@shared/schema";

interface DetailPanelProps {
  area: MoodData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailPanel({ area, isOpen, onClose }: DetailPanelProps) {
  if (!area) return null;

  const getMoodColorClass = (score: number) => {
    if (score >= 6) return 'text-mood-positive bg-green-50';
    if (score >= 4) return 'text-mood-neutral bg-orange-50';
    return 'text-mood-negative bg-red-50';
  };

  const categories = [
    { name: 'Weather', score: area.weatherScore, icon: 'fas fa-cloud-sun', color: 'text-blue-500' },
    { name: 'Health', score: area.healthScore, icon: 'fas fa-heartbeat', color: 'text-red-500' },
    { name: 'Safety', score: area.safetyScore, icon: 'fas fa-shield-alt', color: 'text-green-500' },
    { name: 'Hygiene', score: area.hygieneScore, icon: 'fas fa-soap', color: 'text-purple-500' },
    { name: 'Social Sentiment', score: area.socialScore, icon: 'fas fa-comments', color: 'text-indigo-500' },
  ].filter(cat => cat.score !== null && cat.score !== undefined);

  return (
    <div 
      className={`absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-30 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Panel Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{area.areaName}</h3>
            <p className="text-sm text-gray-500">
              {area.latitude.toFixed(4)}° N, {area.longitude.toFixed(4)}° W
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Overall Score */}
          <div className="p-6 border-b border-gray-100">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 ${getMoodColorClass(area.overallScore)}`}>
                <span className={`text-2xl font-bold ${getMoodColor(area.overallScore)}`}>
                  {area.overallScore.toFixed(1)}
                </span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Overall Mood Score</h4>
              <p className="text-sm text-gray-500">
                {getMoodLabel(area.overallScore)} • {categories.length} active categories
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4">Category Breakdown</h4>
            <div className="space-y-4">
              {categories.map(({ name, score, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className={`${getCategoryIcon(name)} ${getCategoryColor(name)}`}></i>
                    <div>
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">
                        Last updated {formatTimestamp(area.lastUpdated.toString())}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getMoodColor(score!)}`}>
                      {score!.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {/* Mock trend indicator */}
                      {Math.random() > 0.5 ? (
                        <span className="text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{(Math.random() * 0.5).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          -{(Math.random() * 0.5).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Contributors */}
          {area.contributors && area.contributors.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4">Key Contributors</h4>
              <div className="space-y-3">
                {area.contributors.slice(0, 5).map((contributor, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      contributor.type === 'positive'
                        ? 'bg-green-50 border-green-400'
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {contributor.type === 'positive' ? (
                        <TrendingUp className="text-green-600 h-4 w-4" />
                      ) : (
                        <TrendingDown className="text-red-600 h-4 w-4" />
                      )}
                      <span
                        className={`font-medium ${
                          contributor.type === 'positive' ? 'text-green-800' : 'text-red-800'
                        }`}
                      >
                        {contributor.type === 'positive' ? 'Positive Impact' : 'Negative Impact'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{contributor.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {contributor.category} • {formatTimestamp(contributor.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mock Trend Chart */}
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">24-Hour Trend</h4>
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="w-full h-full relative p-4">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <polyline 
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="2" 
                    points="0,40 10,35 20,38 30,32 40,28 50,25 60,22 70,20 80,18 90,15 100,12"
                  />
                  <circle cx="100" cy="12" r="3" fill="var(--primary)"/>
                </svg>
                <div className="absolute top-2 left-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Mood Score</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>24h ago</span>
              <span>12h ago</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
