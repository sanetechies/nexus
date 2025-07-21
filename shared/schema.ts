import { pgTable, text, serial, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const moodData = pgTable("mood_data", {
  id: serial("id").primaryKey(),
  areaId: text("area_id").notNull(),
  areaName: text("area_name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  overallScore: real("overall_score").notNull(),
  weatherScore: real("weather_score"),
  healthScore: real("health_score"),
  safetyScore: real("safety_score"),
  hygieneScore: real("hygiene_score"),
  socialScore: real("social_score"),
  contributors: jsonb("contributors").$type<Array<{
    type: 'positive' | 'negative';
    category: string;
    description: string;
    timestamp: string;
    impact: number;
  }>>(),
  coordinates: jsonb("coordinates").$type<Array<{ lat: number; lng: number }>>().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const dataSource = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  lastSync: timestamp("last_sync").defaultNow().notNull(),
  errorMessage: text("error_message"),
});

export const insertMoodDataSchema = createInsertSchema(moodData).omit({
  id: true,
  lastUpdated: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSource).omit({
  id: true,
  lastSync: true,
});

export type MoodData = typeof moodData.$inferSelect;
export type InsertMoodData = z.infer<typeof insertMoodDataSchema>;
export type DataSource = typeof dataSource.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;

export const categorySchema = z.object({
  weather: z.boolean(),
  health: z.boolean(),
  safety: z.boolean(),
  hygiene: z.boolean(),
  social: z.boolean(),
});

export type CategoryFilters = z.infer<typeof categorySchema>;
