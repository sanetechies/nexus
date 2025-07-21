export function getMoodColor(score: number): string {
  if (score >= 8) return '#4CAF50'; // Very positive - green
  if (score >= 6) return '#8BC34A'; // Positive - light green
  if (score >= 4) return '#FF9800'; // Neutral - orange
  if (score >= 2) return '#FF7043'; // Negative - light red
  return '#F44336'; // Very negative - red
}

export function getMoodColorWithOpacity(score: number, opacity: number = 0.6): string {
  const color = getMoodColor(score);
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getMoodLabel(score: number): string {
  if (score >= 8) return 'Very Positive';
  if (score >= 6) return 'Positive';
  if (score >= 4) return 'Neutral';
  if (score >= 2) return 'Negative';
  return 'Very Negative';
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  
  return date.toLocaleDateString();
}

export function getCategoryIcon(category: string): string {
  const icons = {
    Weather: 'fas fa-cloud-sun',
    Health: 'fas fa-heartbeat',
    Safety: 'fas fa-shield-alt',
    Hygiene: 'fas fa-soap',
    'Social Sentiment': 'fas fa-comments',
  };
  return icons[category] || 'fas fa-circle';
}

export function getCategoryColor(category: string): string {
  const colors = {
    Weather: 'text-blue-500',
    Health: 'text-red-500',
    Safety: 'text-green-500',
    Hygiene: 'text-purple-500',
    'Social Sentiment': 'text-indigo-500',
  };
  return colors[category] || 'text-gray-500';
}
