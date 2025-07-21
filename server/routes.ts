import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { MoodAggregator } from "./services/mood-aggregator";
import { categorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const moodAggregator = new MoodAggregator();

  // Get all mood data
  app.get("/api/mood-data", async (req, res) => {
    try {
      const filters = req.query as any;
      const categoryFilters = categorySchema.parse({
        weather: filters.weather === 'true',
        health: filters.health === 'true',
        safety: filters.safety === 'true',
        hygiene: filters.hygiene === 'true',
        social: filters.social === 'true',
      });

      const moodData = await storage.getMoodData();
      
      // Apply category filters to calculate filtered scores
      const filteredData = moodData.map(area => {
        const scores = {
          weatherScore: area.weatherScore || 0,
          healthScore: area.healthScore || 0,
          safetyScore: area.safetyScore || 0,
          hygieneScore: area.hygieneScore || 0,
          socialScore: area.socialScore || 0,
        };

        const filteredScore = moodAggregator.calculateFilteredScore(scores, categoryFilters);

        return {
          ...area,
          filteredScore,
        };
      });

      res.json(filteredData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood data" });
    }
  });

  // Get mood data for specific area
  app.get("/api/mood-data/:areaId", async (req, res) => {
    try {
      const { areaId } = req.params;
      const moodData = await storage.getMoodDataByArea(areaId);
      
      if (!moodData) {
        return res.status(404).json({ message: "Area not found" });
      }

      res.json(moodData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch area data" });
    }
  });

  // Refresh mood data for all areas
  app.post("/api/mood-data/refresh", async (req, res) => {
    try {
      await moodAggregator.updateAllAreas();
      res.json({ message: "Mood data refreshed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh mood data" });
    }
  });

  // Refresh mood data for specific area
  app.post("/api/mood-data/:areaId/refresh", async (req, res) => {
    try {
      const { areaId } = req.params;
      await moodAggregator.updateMoodData(areaId);
      
      const updatedData = await storage.getMoodDataByArea(areaId);
      res.json(updatedData);
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh area data" });
    }
  });

  // Get data sources status
  app.get("/api/data-sources", async (req, res) => {
    try {
      const dataSources = await storage.getDataSources();
      res.json(dataSources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  // Get mood data near coordinates
  app.get("/api/mood-data/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 50 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const searchRadius = parseFloat(radius as string);

      const allMoodData = await storage.getMoodData();
      
      // Find mood data within radius (simple distance calculation)
      const nearbyData = allMoodData.filter(area => {
        const distance = Math.sqrt(
          Math.pow(area.latitude - latitude, 2) + 
          Math.pow(area.longitude - longitude, 2)
        ) * 111; // Rough conversion to km
        
        return distance <= searchRadius;
      });

      res.json(nearbyData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby mood data" });
    }
  });

  // Calculate overall regional mood
  app.get("/api/overall-mood", async (req, res) => {
    try {
      const filters = req.query as any;
      const categoryFilters = categorySchema.parse({
        weather: filters.weather === 'true',
        health: filters.health === 'true',
        safety: filters.safety === 'true',
        hygiene: filters.hygiene === 'true',
        social: filters.social === 'true',
      });

      const moodData = await storage.getMoodData();
      
      if (moodData.length === 0) {
        return res.json({ overallScore: 0, activeCategories: 0 });
      }

      let totalScore = 0;
      let validAreas = 0;

      moodData.forEach(area => {
        const scores = {
          weatherScore: area.weatherScore || 0,
          healthScore: area.healthScore || 0,
          safetyScore: area.safetyScore || 0,
          hygieneScore: area.hygieneScore || 0,
          socialScore: area.socialScore || 0,
        };

        const filteredScore = moodAggregator.calculateFilteredScore(scores, categoryFilters);
        if (filteredScore > 0) {
          totalScore += filteredScore;
          validAreas++;
        }
      });

      const overallScore = validAreas > 0 ? totalScore / validAreas : 0;
      const activeCategories = Object.values(categoryFilters).filter(Boolean).length;

      res.json({ 
        overallScore: parseFloat(overallScore.toFixed(1)), 
        activeCategories 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate overall mood" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
