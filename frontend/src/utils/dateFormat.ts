/**
 * Format date string to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else {
      return 'Recently';
    }
  } catch (error) {
    return 'Recently';
  }
}

/**
 * Get color for news source badge
 */
export function getSourceColor(source: string): string {
  const sourceLower = source.toLowerCase();

  // Major financial sources
  if (sourceLower.includes('economic times') || sourceLower.includes('et')) {
    return '#5b8ef4'; // Primary blue
  }
  if (sourceLower.includes('moneycontrol')) {
    return '#00d395'; // Success green
  }
  if (sourceLower.includes('mint') || sourceLower.includes('livemint')) {
    return '#ffa502'; // Warning orange
  }
  if (sourceLower.includes('business standard')) {
    return '#2962ff'; // Dark blue
  }
  if (sourceLower.includes('reuters')) {
    return '#ff6b6b'; // Light red
  }
  if (sourceLower.includes('bloomberg')) {
    return '#a55eea'; // Purple
  }

  // Default color for unknown sources
  return '#787b86'; // Muted gray
}

/**
 * Sort news items by date (newest first)
 */
export function sortByDate<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    try {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Newest first
    } catch {
      return 0;
    }
  });
}

/**
 * Get unique sources from news items
 */
export function getUniqueSources<T extends { source: string }>(items: T[]): string[] {
  const sources = new Set(items.map(item => item.source));
  return Array.from(sources).sort();
}
