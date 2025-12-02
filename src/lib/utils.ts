import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const TOKEN_EXPIRY_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

/**
 * Saves token with expiry timestamp (1 week from now)
 */
export function saveTokenWithExpiry(token: string): void {
  localStorage.setItem('token', token);
  const expiryTime = Date.now() + TOKEN_EXPIRY_DURATION;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

/**
 * Checks if the token has expired
 */
export function isTokenExpired(): boolean {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) {
    return true; // No expiry time means token is invalid
  }
  return Date.now() > parseInt(expiryTime, 10);
}

/**
 * Clears token and expiry from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}
