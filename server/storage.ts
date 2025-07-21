import { moodData, dataSource, type MoodData, type InsertMoodData, type DataSource, type InsertDataSource } from "@shared/schema";

export interface IStorage {
  // Mood data operations
  getMoodData(): Promise<MoodData[]>;
  getMoodDataByArea(areaId: string): Promise<MoodData | undefined>;
  createMoodData(data: InsertMoodData): Promise<MoodData>;
  updateMoodData(areaId: string, data: Partial<InsertMoodData>): Promise<MoodData | undefined>;
  
  // Data source operations
  getDataSources(): Promise<DataSource[]>;
  updateDataSource(name: string, status: string, errorMessage?: string): Promise<DataSource | undefined>;
  createDataSource(data: InsertDataSource): Promise<DataSource>;
}

export class MemStorage implements IStorage {
  private moodDataMap: Map<string, MoodData>;
  private dataSourceMap: Map<string, DataSource>;
  private currentMoodId: number;
  private currentSourceId: number;

  constructor() {
    this.moodDataMap = new Map();
    this.dataSourceMap = new Map();
    this.currentMoodId = 1;
    this.currentSourceId = 1;
    
    // Initialize with default data sources
    this.initializeDataSources();
    this.initializeSampleAreas();
  }

  private initializeDataSources() {
    const sources = [
      { name: "Twitter API", status: "active", errorMessage: null },
      { name: "Reddit Feed", status: "active", errorMessage: null },
      { name: "Weather API", status: "active", errorMessage: null },
      { name: "Health Reports", status: "limited", errorMessage: "Rate limited" },
    ];

    sources.forEach(source => {
      const dataSource: DataSource = {
        id: this.currentSourceId++,
        name: source.name,
        status: source.status,
        lastSync: new Date(),
        errorMessage: source.errorMessage,
      };
      this.dataSourceMap.set(source.name, dataSource);
    });
  }

  private initializeSampleAreas() {
    const areas = [
      // San Francisco Areas
      {
        areaId: "sf_downtown",
        areaName: "Downtown San Francisco",
        latitude: 37.7749,
        longitude: -122.4194,
        coordinates: [
          { lat: 37.7849, lng: -122.4294 },
          { lat: 37.7849, lng: -122.4094 },
          { lat: 37.7649, lng: -122.4094 },
          { lat: 37.7649, lng: -122.4294 }
        ]
      },
      {
        areaId: "sf_mission",
        areaName: "Mission District",
        latitude: 37.7599,
        longitude: -122.4148,
        coordinates: [
          { lat: 37.7699, lng: -122.4248 },
          { lat: 37.7699, lng: -122.4048 },
          { lat: 37.7499, lng: -122.4048 },
          { lat: 37.7499, lng: -122.4248 }
        ]
      },
      {
        areaId: "sf_soma",
        areaName: "SOMA",
        latitude: 37.7749,
        longitude: -122.3994,
        coordinates: [
          { lat: 37.7849, lng: -122.4094 },
          { lat: 37.7849, lng: -122.3894 },
          { lat: 37.7649, lng: -122.3894 },
          { lat: 37.7649, lng: -122.4094 }
        ]
      },
      // New York Areas
      {
        areaId: "ny_manhattan",
        areaName: "Manhattan",
        latitude: 40.7831,
        longitude: -73.9712,
        coordinates: [
          { lat: 40.7931, lng: -73.9812 },
          { lat: 40.7931, lng: -73.9612 },
          { lat: 40.7731, lng: -73.9612 },
          { lat: 40.7731, lng: -73.9812 }
        ]
      },
      {
        areaId: "ny_brooklyn",
        areaName: "Brooklyn",
        latitude: 40.6782,
        longitude: -73.9442,
        coordinates: [
          { lat: 40.6882, lng: -73.9542 },
          { lat: 40.6882, lng: -73.9342 },
          { lat: 40.6682, lng: -73.9342 },
          { lat: 40.6682, lng: -73.9542 }
        ]
      },
      // Los Angeles Areas
      {
        areaId: "la_downtown",
        areaName: "Downtown Los Angeles",
        latitude: 34.0522,
        longitude: -118.2437,
        coordinates: [
          { lat: 34.0622, lng: -118.2537 },
          { lat: 34.0622, lng: -118.2337 },
          { lat: 34.0422, lng: -118.2337 },
          { lat: 34.0422, lng: -118.2537 }
        ]
      },
      {
        areaId: "la_hollywood",
        areaName: "Hollywood",
        latitude: 34.0928,
        longitude: -118.3287,
        coordinates: [
          { lat: 34.1028, lng: -118.3387 },
          { lat: 34.1028, lng: -118.3187 },
          { lat: 34.0828, lng: -118.3187 },
          { lat: 34.0828, lng: -118.3387 }
        ]
      }
    ];

    areas.forEach(area => {
      const moodData: MoodData = {
        id: this.currentMoodId++,
        areaId: area.areaId,
        areaName: area.areaName,
        latitude: area.latitude,
        longitude: area.longitude,
        overallScore: 0,
        weatherScore: null,
        healthScore: null,
        safetyScore: null,
        hygieneScore: null,
        socialScore: null,
        contributors: null,
        coordinates: area.coordinates,
        lastUpdated: new Date(),
      };
      this.moodDataMap.set(area.areaId, moodData);
    });
  }

  async getMoodData(): Promise<MoodData[]> {
    return Array.from(this.moodDataMap.values());
  }

  async getMoodDataByArea(areaId: string): Promise<MoodData | undefined> {
    return this.moodDataMap.get(areaId);
  }

  async createMoodData(insertData: InsertMoodData): Promise<MoodData> {
    const id = this.currentMoodId++;
    const moodData: MoodData = {
      ...insertData,
      id,
      lastUpdated: new Date(),
      weatherScore: insertData.weatherScore ?? null,
      healthScore: insertData.healthScore ?? null,
      safetyScore: insertData.safetyScore ?? null,
      hygieneScore: insertData.hygieneScore ?? null,
      socialScore: insertData.socialScore ?? null,
      contributors: (insertData.contributors as Array<{
        type: 'positive' | 'negative';
        category: string;
        description: string;
        timestamp: string;
        impact: number;
      }>) ?? null,
      coordinates: insertData.coordinates as Array<{ lat: number; lng: number }>,
    };
    this.moodDataMap.set(insertData.areaId, moodData);
    return moodData;
  }

  async updateMoodData(areaId: string, updateData: Partial<InsertMoodData>): Promise<MoodData | undefined> {
    const existing = this.moodDataMap.get(areaId);
    if (!existing) return undefined;

    const updated: MoodData = {
      ...existing,
      ...updateData,
      lastUpdated: new Date(),
      weatherScore: updateData.weatherScore ?? existing.weatherScore,
      healthScore: updateData.healthScore ?? existing.healthScore,
      safetyScore: updateData.safetyScore ?? existing.safetyScore,
      hygieneScore: updateData.hygieneScore ?? existing.hygieneScore,
      socialScore: updateData.socialScore ?? existing.socialScore,
      contributors: (updateData.contributors as Array<{
        type: 'positive' | 'negative';
        category: string;
        description: string;
        timestamp: string;
        impact: number;
      }>) ?? existing.contributors,
      coordinates: (updateData.coordinates as Array<{ lat: number; lng: number }>) ?? existing.coordinates,
    };
    this.moodDataMap.set(areaId, updated);
    return updated;
  }

  async getDataSources(): Promise<DataSource[]> {
    return Array.from(this.dataSourceMap.values());
  }

  async updateDataSource(name: string, status: string, errorMessage?: string): Promise<DataSource | undefined> {
    const existing = this.dataSourceMap.get(name);
    if (!existing) return undefined;

    const updated: DataSource = {
      ...existing,
      status,
      errorMessage: errorMessage || null,
      lastSync: new Date(),
    };
    this.dataSourceMap.set(name, updated);
    return updated;
  }

  async createDataSource(insertData: InsertDataSource): Promise<DataSource> {
    const id = this.currentSourceId++;
    const dataSource: DataSource = {
      ...insertData,
      id,
      lastSync: new Date(),
      errorMessage: insertData.errorMessage ?? null,
    };
    this.dataSourceMap.set(insertData.name, dataSource);
    return dataSource;
  }
}

export const storage = new MemStorage();
