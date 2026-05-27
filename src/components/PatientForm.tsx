import React, { useState } from 'react';
import type { Patient, Sex } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
  initial?: Patient;
  onSave: (data: Omit<Patient, 'id' | 'consultations' | 'createdAt'>) => void;
  onBack: () => void;
}

export default function PatientForm({ initial, onSave, onBack }: Props) {
  const [form, setForm] = useState({
    firstName: initial?.firstName ?? '',
    middleName: initial?.middleName ?? '',
    lastName: initial?.lastName ?? '',
    age: initial?.age ?? '' as number | '',
    address: initial?.address ?? '',
    sex: initial?.sex ?? 'Male' as Sex,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (form.age === '' || Number(form.age) <= 0) e.age = 'Must be a positive number';
    if (!form.address.trim()) e.address = 'Required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, age: Number(form.age) });
  }

  function field(label: string, key: keyof typeof form, type = 'text', required = true) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type={type}
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
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
        <h2 className="text-xl font-semibold">{initial ? 'Edit Patient' : 'New Patient'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h3 className="font-medium text-gray-800 border-b pb-2">Basic Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {field('First Name', 'firstName')}
          {field('Middle Name', 'middleName', 'text', false)}
          {field('Last Name', 'lastName')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value === '' ? '' : Number(e.target.value) }))}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.age ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex<span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              value={form.sex}
              onChange={e => setForm(f => ({ ...f, sex: e.target.value as Sex }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address<span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            rows={2}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.address ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {initial ? 'Save Changes' : 'Add Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
