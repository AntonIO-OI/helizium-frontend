import { Task, SortConfig } from "../types/search";

export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }
  return matrix[b.length][a.length];
}

function findBestMatch(searchWord: string, text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let bestDistance = Infinity;
  
  for (const word of words) {
    const distance = levenshteinDistance(searchWord.toLowerCase(), word);
    const normalizedDistance = distance / Math.max(searchWord.length, word.length);
    bestDistance = Math.min(bestDistance, normalizedDistance);
  }
  
  return bestDistance;
}

export function searchTasks(query: string, tasks: Task[]): Task[] {
  if (!query.trim()) return tasks;

  const searchWords = query.toLowerCase().split(/\s+/);
  const scoreThreshold = 0.3; 

  return tasks.filter(task => {
    const searchText = `${task.title} ${task.content}`.toLowerCase();
    
    const scores = searchWords.map(word => findBestMatch(word, searchText));
    
    return scores.some(score => score <= scoreThreshold);
  });
}

export function sortTasks(tasks: Task[], sortConfig: SortConfig): Task[] {
  return [...tasks].sort((a, b) => {
    const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
    
    switch (sortConfig.field) {
      case 'title':
        return multiplier * a.title.localeCompare(b.title);
      case 'date':
        return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'price':
        return multiplier * (a.price - b.price);
      default:
        return 0;
    }
  });
}
