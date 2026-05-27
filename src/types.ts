export type Sex = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  address: string;
  sex: Sex;
  consultations: Consultation[];
  createdAt: string;
}

export interface Consultation {
  id: string;
  dateOfConsult: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: Treatment;
}

export interface Treatment {
  laboratory: string;
  pharmacologic: string;
  nonPharmacologic: string;
}

export type AppView = 'list' | 'add-patient' | 'edit-patient' | 'view-patient' | 'add-consult' | 'edit-consult' | 'reports';
