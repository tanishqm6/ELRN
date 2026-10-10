import type { AppData } from './types';
import { getDemoData } from './demo-data';

const STORAGE_KEY = 'elrn-demo-data';

export function loadData(): AppData {
  if (typeof window === 'undefined') return getDemoData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const demo = getDemoData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      return demo;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (
      !parsed ||
      !Array.isArray(parsed.incidents) ||
      !Array.isArray(parsed.nodes) ||
      !Array.isArray(parsed.logs) ||
      !parsed.settings
    ) {
      const demo = getDemoData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      return demo;
    }
    return parsed;
  } catch {
    return getDemoData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function resetData(): AppData {
  const demo = getDemoData();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  }
  return demo;
}

export function clearLogs(data: AppData): AppData {
  const updated = { ...data, logs: [] };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}
