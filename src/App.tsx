import { useState } from 'react';
import type { Patient, Consultation, AppView } from './types';
import { loadPatients, savePatients } from './storage';
import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import PatientView from './components/PatientView';
import ConsultationForm from './components/ConsultationForm';
import Reports from './components/Reports';
import { Stethoscope } from 'lucide-react';
import './index.css';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(loadPatients);
  const [view, setView] = useState<AppView>('list');
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeConsultId, setActiveConsultId] = useState<string | null>(null);

  function persist(updated: Patient[]) {
    setPatients(updated);
    savePatients(updated);
  }

  const activePatient = patients.find(p => p.id === activePatientId) ?? null;
  const activeConsult = activePatient?.consultations.find(c => c.id === activeConsultId) ?? null;

  function handleAddPatient(data: Omit<Patient, 'id' | 'consultations' | 'createdAt'>) {
    const newPatient: Patient = { ...data, id: uid(), consultations: [], createdAt: new Date().toISOString() };
    persist([...patients, newPatient]);
    setActivePatientId(newPatient.id);
    setView('view-patient');
  }

  function handleEditPatient(data: Omit<Patient, 'id' | 'consultations' | 'createdAt'>) {
    persist(patients.map(p => p.id === activePatientId ? { ...p, ...data } : p));
    setView('view-patient');
  }

  function handleDeletePatient(id: string) {
    if (!confirm('Delete this patient and all their consultations? This cannot be undone.')) return;
    persist(patients.filter(p => p.id !== id));
  }

  function handleAddConsult(data: Omit<Consultation, 'id'>) {
    const newC: Consultation = { ...data, id: uid() };
    persist(patients.map(p =>
      p.id === activePatientId ? { ...p, consultations: [...p.consultations, newC] } : p
    ));
    setView('view-patient');
  }

  function handleEditConsult(data: Omit<Consultation, 'id'>) {
    persist(patients.map(p =>
      p.id === activePatientId
        ? { ...p, consultations: p.consultations.map(c => c.id === activeConsultId ? { ...c, ...data } : c) }
        : p
    ));
    setView('view-patient');
  }

  function handleDeleteConsult(consultId: string) {
    if (!confirm('Delete this consultation? This cannot be undone.')) return;
    persist(patients.map(p =>
      p.id === activePatientId
        ? { ...p, consultations: p.consultations.filter(c => c.id !== consultId) }
        : p
    ));
  }

  function fullName(p: Patient) {
    const mn = p.middleName ? ` ${p.middleName}` : '';
    return `${p.firstName}${mn} ${p.lastName}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Doctor's Census</h1>
            <p className="text-xs text-gray-500">Patient Management System</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {view === 'list' && (
          <PatientList
            patients={patients}
            onAdd={() => setView('add-patient')}
            onView={id => { setActivePatientId(id); setView('view-patient'); }}
            onEdit={id => { setActivePatientId(id); setView('edit-patient'); }}
            onDelete={handleDeletePatient}
            onReports={() => setView('reports')}
          />
        )}

        {view === 'add-patient' && (
          <PatientForm
            onSave={handleAddPatient}
            onBack={() => setView('list')}
          />
        )}

        {view === 'edit-patient' && activePatient && (
          <PatientForm
            initial={activePatient}
            onSave={handleEditPatient}
            onBack={() => setView('view-patient')}
          />
        )}

        {view === 'view-patient' && activePatient && (
          <PatientView
            patient={activePatient}
            onBack={() => setView('list')}
            onEdit={() => setView('edit-patient')}
            onAddConsult={() => { setActiveConsultId(null); setView('add-consult'); }}
            onEditConsult={id => { setActiveConsultId(id); setView('edit-consult'); }}
            onDeleteConsult={handleDeleteConsult}
          />
        )}

        {view === 'add-consult' && activePatient && (
          <ConsultationForm
            patientName={fullName(activePatient)}
            onSave={handleAddConsult}
            onBack={() => setView('view-patient')}
          />
        )}

        {view === 'edit-consult' && activePatient && activeConsult && (
          <ConsultationForm
            patientName={fullName(activePatient)}
            initial={activeConsult}
            onSave={handleEditConsult}
            onBack={() => setView('view-patient')}
          />
        )}

        {view === 'reports' && (
          <Reports
            patients={patients}
            onBack={() => setView('list')}
          />
        )}
      </main>
    </div>
  );
}
