import React, { useState } from 'react';
import type { Consultation } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
  patientName: string;
  initial?: Consultation;
  onSave: (data: Omit<Consultation, 'id'>) => void;
  onBack: () => void;
}

export default function ConsultationForm({ patientName, initial, onSave, onBack }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    dateOfConsult: initial?.dateOfConsult ?? today,
    chiefComplaint: initial?.chiefComplaint ?? '',
    diagnosis: initial?.diagnosis ?? '',
    laboratory: initial?.treatment.laboratory ?? '',
    pharmacologic: initial?.treatment.pharmacologic ?? '',
    nonPharmacologic: initial?.treatment.nonPharmacologic ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.dateOfConsult) e.dateOfConsult = 'Required';
    if (!form.chiefComplaint.trim()) e.chiefComplaint = 'Required';
    if (!form.diagnosis.trim()) e.diagnosis = 'Required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      dateOfConsult: form.dateOfConsult,
      chiefComplaint: form.chiefComplaint,
      diagnosis: form.diagnosis,
      treatment: {
        laboratory: form.laboratory,
        pharmacologic: form.pharmacologic,
        nonPharmacologic: form.nonPharmacologic,
      },
    });
  }

  function textArea(label: string, key: keyof typeof form, required = true, rows = 3, placeholder = '') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={rows}
          placeholder={placeholder}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold">{initial ? 'Edit Consultation' : 'New Consultation'}</h2>
          <p className="text-sm text-gray-500">Patient: {patientName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Consult<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="date"
            value={form.dateOfConsult}
            onChange={e => setForm(f => ({ ...f, dateOfConsult: e.target.value }))}
            className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfConsult ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.dateOfConsult && <p className="text-red-500 text-xs mt-1">{errors.dateOfConsult}</p>}
        </div>

        {textArea('Chief Complaint', 'chiefComplaint', true, 2, 'What brought the patient in?')}
        {textArea('Diagnosis', 'diagnosis', true, 2, 'Clinical diagnosis')}

        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-800 mb-4">Treatment Plan</h3>
          <div className="space-y-4">
            {textArea('Laboratory', 'laboratory', false, 3, 'CBC, Urinalysis, X-ray, etc.')}
            {textArea('Pharmacologic', 'pharmacologic', false, 3, 'Medications, dosage, frequency')}
            {textArea('Non-Pharmacologic', 'nonPharmacologic', false, 3, 'Diet, exercise, lifestyle changes, referrals')}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {initial ? 'Save Changes' : 'Save Consultation'}
          </button>
        </div>
      </form>
    </div>
  );
}
