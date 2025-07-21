import { storage } from "../storage";
import { WeatherService } from "./weather-service";
import { SentimentService } from "./sentiment-service";
import type { CategoryFilters } from "@shared/schema";

export class MoodAggregator {
  private weatherService: WeatherService;
  private sentimentService: SentimentService;

  constructor() {
    this.weatherService = new WeatherService();
    this.sentimentService = new SentimentService();
  }

  async updateMoodData(areaId: string): Promise<void> {
    try {
      const area = await storage.getMoodDataByArea(areaId);
      if (!area) return;

      await storage.updateDataSource("Weather API", "active");
      await storage.updateDataSource("Twitter API", "active");
      await storage.updateDataSource("Reddit Feed", "active");

      // Fetch weather data
      const weatherData = await this.weatherService.getWeatherData(area.latitude, area.longitude);
      let weatherScore = 5;
      let weatherContributors = [];

      if (weatherData) {
        weatherScore = this.weatherService.calculateWeatherMood(weatherData);
        weatherContributors = this.weatherService.generateWeatherContributors(weatherData, weatherScore);
      } else {
        await storage.updateDataSource("Weather API", "error", "Failed to fetch weather data");
      }

      // Fetch social sentiment data
      const socialPosts = await this.sentimentService.getSocialPosts(area.latitude, area.longitude);
      const socialScore = this.sentimentService.calculateSocialMood(socialPosts);
      const socialContributors = this.sentimentService.generateSocialContributors(socialPosts, socialScore);

      // Generate mock health, safety, and hygiene scores
      const healthScore = this.generateHealthScore(area.areaId);
      const safetyScore = this.generateSafetyScore(area.areaId);
      const hygieneScore = this.generateHygieneScore(area.areaId);

      const healthContributors = this.generateHealthContributors(healthScore);
      const safetyContributors = this.generateSafetyContributors(safetyScore);
      const hygieneContributors = this.generateHygieneContributors(hygieneScore);

      // Calculate overall score
      const scores = [weatherScore, healthScore, safetyScore, hygieneScore, socialScore];
      const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      // Combine all contributors
      const allContributors = [
        ...weatherContributors,
        ...socialContributors,
        ...healthContributors,
        ...safetyContributors,
        ...hygieneContributors,
      ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

      // Update mood data
      await storage.updateMoodData(areaId, {
        overallScore: parseFloat(overallScore.toFixed(1)),
        weatherScore: parseFloat(weatherScore.toFixed(1)),
        healthScore: parseFloat(healthScore.toFixed(1)),
        safetyScore: parseFloat(safetyScore.toFixed(1)),
        hygieneScore: parseFloat(hygieneScore.toFixed(1)),
        socialScore: parseFloat(socialScore.toFixed(1)),
        contributors: allContributors,
      });

    } catch (error) {
      console.error(`Error updating mood data for ${areaId}:`, error);
    }
  }

  async updateAllAreas(): Promise<void> {
    const allAreas = await storage.getMoodData();
    await Promise.all(allAreas.map(area => this.updateMoodData(area.areaId)));
  }

  calculateFilteredScore(scores: { [key: string]: number }, filters: CategoryFilters): number {
    const activeScores = [];
    
    if (filters.weather && scores.weatherScore !== undefined) activeScores.push(scores.weatherScore);
    if (filters.health && scores.healthScore !== undefined) activeScores.push(scores.healthScore);
    if (filters.safety && scores.safetyScore !== undefined) activeScores.push(scores.safetyScore);
    if (filters.hygiene && scores.hygieneScore !== undefined) activeScores.push(scores.hygieneScore);
    if (filters.social && scores.socialScore !== undefined) activeScores.push(scores.socialScore);

    if (activeScores.length === 0) return 0;
    return activeScores.reduce((sum, score) => sum + score, 0) / activeScores.length;
  }

  private generateHealthScore(areaId: string): number {
    // Mock health data based on area characteristics
    const healthFactors = {
      'sf_downtown': 6.2, // Urban area, mixed health factors
      'sf_mission': 5.8,  // Diverse area
      'sf_soma': 6.5,     // Business district
    };
    
    const baseScore = healthFactors[areaId] || 6.0;
    const variance = (Math.random() - 0.5) * 1.0; // Add some randomness
    return Math.max(0, Math.min(10, baseScore + variance));
  }

  private generateSafetyScore(areaId: string): number {
    const safetyFactors = {
      'sf_downtown': 6.8,
      'sf_mission': 5.2,
      'sf_soma': 7.1,
    };
    
    const baseScore = safetyFactors[areaId] || 6.0;
    const variance = (Math.random() - 0.5) * 1.2;
    return Math.max(0, Math.min(10, baseScore + variance));
  }

  private generateHygieneScore(areaId: string): number {
    const hygieneFactors = {
      'sf_downtown': 6.5,
      'sf_mission': 5.5,
      'sf_soma': 7.2,
    };
    
    const baseScore = hygieneFactors[areaId] || 6.0;
    const variance = (Math.random() - 0.5) * 0.8;
    return Math.max(0, Math.min(10, baseScore + variance));
  }

  private generateHealthContributors(score: number) {
    const contributors = [];
    const now = new Date().toISOString();

    if (score < 5) {
      contributors.push({
        type: 'negative' as const,
        category: 'Health',
        description: "Increased flu cases reported in local hospitals",
        timestamp: now,
        impact: -1.2,
      });
    } else if (score > 7) {
      contributors.push({
        type: 'positive' as const,
        category: 'Health',
        description: "Low disease rates and good air quality",
        timestamp: now,
        impact: 1.0,
      });
    }

    return contributors;
  }

  private generateSafetyContributors(score: number) {
    const contributors = [];
    const now = new Date().toISOString();

    if (score < 5) {
      contributors.push({
        type: 'negative' as const,
        category: 'Safety',
        description: "Recent uptick in petty crime reports",
        timestamp: now,
        impact: -1.5,
      });
    } else if (score > 7) {
      contributors.push({
        type: 'positive' as const,
        category: 'Safety',
        description: "Increased police presence and community safety programs",
        timestamp: now,
        impact: 1.2,
      });
    }

    return contributors;
  }

  private generateHygieneContributors(score: number) {
    const contributors = [];
    const now = new Date().toISOString();

    if (score < 5) {
      contributors.push({
        type: 'negative' as const,
        category: 'Hygiene',
        description: "Sanitation concerns in public areas",
        timestamp: now,
        impact: -1.0,
      });
    } else if (score > 7) {
      contributors.push({
        type: 'positive' as const,
        category: 'Hygiene',
        description: "Enhanced cleaning protocols and waste management",
        timestamp: now,
        impact: 0.8,
      });
    }

    return contributors;
  }
}
