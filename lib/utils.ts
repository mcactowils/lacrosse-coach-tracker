import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatPlayerName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function formatPlayerNameWithNumber(
  firstName: string,
  lastName: string,
  jerseyNumber: number | null
): string {
  const name = formatPlayerName(firstName, lastName);
  return jerseyNumber ? `#${jerseyNumber} ${name}` : name;
}

export function calculateImpactScore(
  groundBalls: number,
  screens: number,
  effortPlays: number
): number {
  return groundBalls + screens + effortPlays;
}

export function roundToDecimal(value: number, decimals: number = 1): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateJerseyNumber(number: string | number): boolean {
  const num = typeof number === 'string' ? parseInt(number) : number;
  return !isNaN(num) && num > 0 && num <= 99;
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function validateStatValue(value: string | number): boolean {
  const num = typeof value === 'string' ? parseInt(value) : value;
  return !isNaN(num) && num >= 0 && num <= 50; // Reasonable upper limit
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function sortPlayersByName(players: Array<{ first_name: string; last_name: string }>) {
  return players.sort((a, b) => {
    const lastNameCompare = a.last_name.localeCompare(b.last_name);
    if (lastNameCompare !== 0) return lastNameCompare;
    return a.first_name.localeCompare(b.first_name);
  });
}

export function sortPlayersByJerseyNumber(players: Array<{ jersey_number: number | null }>) {
  return players.sort((a, b) => {
    if (a.jersey_number === null && b.jersey_number === null) return 0;
    if (a.jersey_number === null) return 1;
    if (b.jersey_number === null) return -1;
    return a.jersey_number - b.jersey_number;
  });
}

export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // If it's January-July, assume Spring season
  // If it's August-December, assume Fall season
  if (month <= 6) {
    return `${year} Spring`;
  } else {
    return `${year} Fall`;
  }
}

export function isValidGameDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  return date >= oneYearAgo && date <= oneYearFromNow;
}

export function getStatColor(statType: 'ground_balls' | 'screens' | 'effort_plays'): string {
  switch (statType) {
    case 'ground_balls':
      return 'bg-blue-500';
    case 'screens':
      return 'bg-green-500';
    case 'effort_plays':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}

export function getStatColorLight(statType: 'ground_balls' | 'screens' | 'effort_plays'): string {
  switch (statType) {
    case 'ground_balls':
      return 'bg-blue-100 text-blue-700';
    case 'screens':
      return 'bg-green-100 text-green-700';
    case 'effort_plays':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}