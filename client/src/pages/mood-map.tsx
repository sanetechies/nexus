import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { MapView } from "@/components/map-view";
import { DetailPanel } from "@/components/detail-panel";
import { useMoodData, useDataSources, useOverallMood, useRefreshMoodData } from "@/hooks/use-mood-data";
import type { CategoryFilters, MoodData } from "@shared/schema";

export default function MoodMapPage() {
  const [filters, setFilters] = useState<CategoryFilters>({
    weather: true,
    health: true,
    safety: false,
    hygiene: false,
    social: true,
  });

  const [selectedArea, setSelectedArea] = useState<MoodData | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const { data: moodData = [], isLoading: isMoodDataLoading } = useMoodData(filters);
  const { data: dataSources = [] } = useDataSources();
  const { data: overallMood } = useOverallMood(filters);
  const refreshMutation = useRefreshMoodData();

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMutation.mutate();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshMutation]);

  const handleAreaClick = (area: MoodData) => {
    setSelectedArea(area);
    setIsDetailPanelOpen(true);
  };

  const handleDetailPanelClose = () => {
    setIsDetailPanelOpen(false);
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  if (isMoodDataLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading MoodMap</h3>
          <p className="text-gray-600">Fetching mood data from all sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-hidden">
      <Sidebar
        filters={filters}
        onFilterChange={setFilters}
        overallScore={overallMood?.overallScore || 0}
        dataSources={dataSources}
      />

      <MapView
        moodData={moodData}
        onAreaClick={handleAreaClick}
        onRefresh={handleRefresh}
        isRefreshing={refreshMutation.isPending}
      />

      <DetailPanel
        area={selectedArea}
        isOpen={isDetailPanelOpen}
        onClose={handleDetailPanelClose}
      />
    </div>
  );
}
