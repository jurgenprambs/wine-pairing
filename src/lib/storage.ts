import { Pairing } from './types';

const STORAGE_KEY = 'terroir_pairings';
const MAX_PAIRINGS = 50;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getAllPairings(): Pairing[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePairing(pairing: Pairing): void {
  if (!isBrowser()) return;
  const pairings = getAllPairings();
  pairings.unshift(pairing);
  if (pairings.length > MAX_PAIRINGS) {
    pairings.length = MAX_PAIRINGS;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pairings));
}

export function deletePairing(id: string): void {
  if (!isBrowser()) return;
  const pairings = getAllPairings().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pairings));
}

export function clearAllPairings(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
