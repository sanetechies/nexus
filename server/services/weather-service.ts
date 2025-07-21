interface WeatherData {
  temperature: number;
  condition: string;
  airQuality: number;
  humidity: number;
  windSpeed: number;
}

export class WeatherService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "";
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      if (!this.apiKey) {
        throw new Error("Weather API key not configured");
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        temperature: data.main.temp,
        condition: data.weather[0].main,
        airQuality: data.main.pressure / 10, // Simplified calculation
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };
    } catch (error) {
      console.error("Weather service error:", error);
      return null;
    }
  }

  calculateWeatherMood(weather: WeatherData): number {
    let score = 5; // Base neutral score

    // Temperature impact (ideal range 18-25°C)
    if (weather.temperature >= 18 && weather.temperature <= 25) {
      score += 1.5;
    } else if (weather.temperature < 10 || weather.temperature > 35) {
      score -= 2;
    } else {
      score -= 0.5;
    }

    // Weather condition impact
    const goodConditions = ["Clear", "Sunny"];
    const neutralConditions = ["Clouds", "Partly Cloudy"];
    const badConditions = ["Rain", "Snow", "Storm", "Thunderstorm"];

    if (goodConditions.includes(weather.condition)) {
      score += 1;
    } else if (badConditions.includes(weather.condition)) {
      score -= 1.5;
    }

    // Air quality impact
    if (weather.airQuality > 80) {
      score += 0.5;
    } else if (weather.airQuality < 50) {
      score -= 1;
    }

    // Humidity impact (ideal range 40-60%)
    if (weather.humidity >= 40 && weather.humidity <= 60) {
      score += 0.5;
    } else if (weather.humidity > 80 || weather.humidity < 20) {
      score -= 0.5;
    }

    return Math.max(0, Math.min(10, score));
  }

  generateWeatherContributors(weather: WeatherData, mood: number): Array<{
    type: 'positive' | 'negative';
    category: string;
    description: string;
    timestamp: string;
    impact: number;
  }> {
    const contributors = [];
    const now = new Date().toISOString();

    if (weather.temperature >= 18 && weather.temperature <= 25) {
      contributors.push({
        type: 'positive' as const,
        category: 'Weather',
        description: `Comfortable temperature (${weather.temperature.toFixed(1)}°C)`,
        timestamp: now,
        impact: 1.5,
      });
    }

    if (weather.condition === "Clear" || weather.condition === "Sunny") {
      contributors.push({
        type: 'positive' as const,
        category: 'Weather',
        description: `${weather.condition} skies`,
        timestamp: now,
        impact: 1.0,
      });
    } else if (["Rain", "Snow", "Storm"].includes(weather.condition)) {
      contributors.push({
        type: 'negative' as const,
        category: 'Weather',
        description: `${weather.condition} conditions`,
        timestamp: now,
        impact: -1.5,
      });
    }

    return contributors;
  }
}
