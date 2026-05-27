import type { Patient, Consultation } from '../types';
import { ArrowLeft, PlusCircle, Pencil, Trash2, FlaskConical, Pill, Heart } from 'lucide-react';

interface Props {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
  onAddConsult: () => void;
  onEditConsult: (id: string) => void;
  onDeleteConsult: (id: string) => void;
}

export default function PatientView({ patient, onBack, onEdit, onAddConsult, onEditConsult, onDeleteConsult }: Props) {
  const sorted = [...patient.consultations].sort((a, b) => b.dateOfConsult.localeCompare(a.dateOfConsult));

  function fullName(p: Patient) {
    const mn = p.middleName ? ` ${p.middleName}` : '';
    return `${p.firstName}${mn} ${p.lastName}`;
  }

  function InfoRow({ label, value }: { label: string; value: string | number }) {
    return (
      <div>
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
        <dd className="text-sm text-gray-900 mt-0.5">{value}</dd>
      </div>
    );
  }

  function TreatmentSection({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    if (!value.trim()) return null;
    return (
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap mt-0.5">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{fullName(patient)}</h2>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h3 className="font-semibold text-gray-700 mb-3">Patient Information</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="Last Name" value={patient.lastName} />
          <InfoRow label="First Name" value={patient.firstName} />
          <InfoRow label="Middle Name" value={patient.middleName || '—'} />
          <InfoRow label="Age" value={`${patient.age} years old`} />
          <InfoRow label="Sex" value={patient.sex} />
          <InfoRow label="Address" value={patient.address} />
        </dl>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">
          Consultations <span className="text-gray-400 font-normal">({patient.consultations.length})</span>
        </h3>
        <button
          onClick={onAddConsult}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Consult
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <p>No consultations recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((c: Consultation) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {new Date(c.dateOfConsult + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditConsult(c.id)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Edit consult"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteConsult(c.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete consult"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chief Complaint</p>
                  <p className="text-sm text-gray-800 mt-0.5">{c.chiefComplaint}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Diagnosis</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{c.diagnosis}</p>
                </div>
              </div>

              {(c.treatment.laboratory || c.treatment.pharmacologic || c.treatment.nonPharmacologic) && (
                <div className="border-t pt-3 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Treatment Plan</p>
                  <TreatmentSection
                    icon={<FlaskConical className="w-4 h-4 text-purple-500" />}
                    label="Laboratory"
                    value={c.treatment.laboratory}
                  />
                  <TreatmentSection
                    icon={<Pill className="w-4 h-4 text-green-500" />}
                    label="Pharmacologic"
                    value={c.treatment.pharmacologic}
                  />
                  <TreatmentSection
                    icon={<Heart className="w-4 h-4 text-red-400" />}
                    label="Non-Pharmacologic"
                    value={c.treatment.nonPharmacologic}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
