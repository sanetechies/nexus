interface SocialPost {
  text: string;
  source: 'twitter' | 'reddit';
  timestamp: Date;
  location?: { lat: number; lng: number };
}

export class SentimentService {
  private twitterApiKey: string;
  private redditApiKey: string;

  constructor() {
    this.twitterApiKey = process.env.TWITTER_API_KEY || process.env.X_API_KEY || "";
    this.redditApiKey = process.env.REDDIT_API_KEY || "";
  }

  async getSocialPosts(lat: number, lon: number, radius: number = 5): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];

    try {
      // Twitter API integration would go here
      // For now, return sample data structure
      if (this.twitterApiKey) {
        // const twitterPosts = await this.fetchTwitterPosts(lat, lon, radius);
        // posts.push(...twitterPosts);
      }

      // Reddit API integration would go here
      if (this.redditApiKey) {
        // const redditPosts = await this.fetchRedditPosts(lat, lon, radius);
        // posts.push(...redditPosts);
      }
    } catch (error) {
      console.error("Social media fetch error:", error);
    }

    return posts;
  }

  analyzeSentiment(text: string): number {
    // Simple sentiment analysis
    // In production, use services like AWS Comprehend, Azure Text Analytics, or Google Cloud Natural Language
    
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'beautiful', 'perfect',
      'happy', 'excited', 'thrilled', 'grateful', 'blessed', 'joy', 'celebration', 'success', 'achievement', 'win'
    ];

    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'angry', 'frustrated', 'disappointed', 'sad',
      'depressed', 'worried', 'concerned', 'problem', 'issue', 'crisis', 'disaster', 'failure', 'loss', 'broken'
    ];

    const words = text.toLowerCase().split(/\W+/);
    let score = 5; // Neutral baseline

    words.forEach(word => {
      if (positiveWords.includes(word)) {
        score += 0.5;
      } else if (negativeWords.includes(word)) {
        score -= 0.5;
      }
    });

    return Math.max(0, Math.min(10, score));
  }

  calculateSocialMood(posts: SocialPost[]): number {
    if (posts.length === 0) return 5;

    const sentiments = posts.map(post => this.analyzeSentiment(post.text));
    const average = sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / sentiments.length;
    
    return average;
  }

  generateSocialContributors(posts: SocialPost[], mood: number): Array<{
    type: 'positive' | 'negative';
    category: string;
    description: string;
    timestamp: string;
    impact: number;
  }> {
    const contributors = [];
    
    // Analyze trending topics/themes
    const positiveThemes = this.extractPositiveThemes(posts);
    const negativeThemes = this.extractNegativeThemes(posts);

    positiveThemes.forEach(theme => {
      contributors.push({
        type: 'positive' as const,
        category: 'Social Sentiment',
        description: theme.description,
        timestamp: new Date().toISOString(),
        impact: theme.impact,
      });
    });

    negativeThemes.forEach(theme => {
      contributors.push({
        type: 'negative' as const,
        category: 'Social Sentiment',
        description: theme.description,
        timestamp: new Date().toISOString(),
        impact: theme.impact,
      });
    });

    return contributors;
  }

  private extractPositiveThemes(posts: SocialPost[]): Array<{ description: string; impact: number }> {
    // Simple theme extraction
    const themes = [];
    const eventKeywords = ['festival', 'concert', 'celebration', 'party', 'event'];
    const eventPosts = posts.filter(post => 
      eventKeywords.some(keyword => post.text.toLowerCase().includes(keyword))
    );

    if (eventPosts.length > posts.length * 0.1) {
      themes.push({
        description: "Community events driving positive sentiment",
        impact: 1.5
      });
    }

    return themes;
  }

  private extractNegativeThemes(posts: SocialPost[]): Array<{ description: string; impact: number }> {
    const themes = [];
    const crimeKeywords = ['crime', 'theft', 'robbery', 'dangerous', 'unsafe'];
    const crimePosts = posts.filter(post => 
      crimeKeywords.some(keyword => post.text.toLowerCase().includes(keyword))
    );

    if (crimePosts.length > posts.length * 0.1) {
      themes.push({
        description: "Safety concerns mentioned in social media",
        impact: -1.5
      });
    }

    return themes;
  }
}
