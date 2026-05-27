import { useState } from 'react';
import type { Patient } from '../types';
import { Search, UserPlus, Eye, Pencil, Trash2, FileText, ChevronRight } from 'lucide-react';

interface Props {
  patients: Patient[];
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReports: () => void;
}

export default function PatientList({ patients, onAdd, onView, onEdit, onDelete, onReports }: Props) {
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p => {
    const full = `${p.lastName} ${p.firstName} ${p.middleName}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  function fullName(p: Patient) {
    return `${p.lastName}, ${p.firstName}${p.middleName ? ' ' + p.middleName.charAt(0) + '.' : ''}`;
  }

  function latestConsult(p: Patient) {
    if (!p.consultations.length) return null;
    return [...p.consultations].sort((a, b) => b.dateOfConsult.localeCompare(a.dateOfConsult))[0];
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Census</h1>
          <p className="text-sm text-gray-500 mt-0.5">{patients.length} patient{patients.length !== 1 ? 's' : ''} on record</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReports}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            Reports
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">{search ? 'No results found' : 'No patients yet'}</p>
          {!search && (
            <p className="text-sm mt-1">Click <strong>Add Patient</strong> to get started.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const latest = latestConsult(p);
            return (
              <div
                key={p.id}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onView(p.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{fullName(p)}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.sex}</span>
                    <span className="text-xs text-gray-500">{p.age} yrs</span>
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-0.5">
                    {p.address}
                    {latest && (
                      <span className="ml-3 text-xs text-blue-600">
                        Last consult: {new Date(latest.dateOfConsult + 'T00:00:00').toLocaleDateString()}
                        {' — '}{latest.diagnosis}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onView(p.id)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(p.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
