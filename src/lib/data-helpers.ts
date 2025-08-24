
import { VACCINATION_NAMES } from './constants';
import type { Vaccination, Dose } from './types';


export const getDefaultVaccinations = (): Vaccination[] => {
  const vaccineSchedules: Record<typeof VACCINATION_NAMES[number], number> = {
    'Hepatitis B': 4,
    'Pneumococcal': 2,
    'Influenza': 1,
    'Covid': 2,
    'Varicella': 2,
  };

  return VACCINATION_NAMES.map(name => ({
    name: name,
    totalDoses: vaccineSchedules[name] || 1,
    nextDoseDate: null,
    doses: Array.from({ length: vaccineSchedules[name] || 1 }, (_, i): Dose => ({
      id: `${name.replace(/\s/g, '')}-${i + 1}`,
      doseNumber: i + 1,
      administered: false,
      date: null,
    }))
  }));
};
