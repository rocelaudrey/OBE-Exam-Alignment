import type { Patient } from './types';

const KEY = 'doctor_census_patients';

export function loadPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePatients(patients: Patient[]): void {
  localStorage.setItem(KEY, JSON.stringify(patients));
}
