import { useState } from 'react';
import type { Patient } from '../types';
import { ArrowLeft, Printer, FileBarChart2 } from 'lucide-react';

interface Props {
  patients: Patient[];
  onBack: () => void;
}

type ReportType = 'census' | 'diagnosis' | 'patient';

export default function Reports({ patients, onBack }: Props) {
  const [reportType, setReportType] = useState<ReportType>('census');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  function fullName(p: Patient) {
    const mn = p.middleName ? ` ${p.middleName}` : '';
    return `${p.firstName}${mn} ${p.lastName}`;
  }

  function filteredConsults(p: Patient) {
    return p.consultations.filter(c => {
      if (dateFrom && c.dateOfConsult < dateFrom) return false;
      if (dateTo && c.dateOfConsult > dateTo) return false;
      return true;
    });
  }

  const allConsults = patients.flatMap(p =>
    filteredConsults(p).map(c => ({ ...c, patient: p }))
  ).sort((a, b) => b.dateOfConsult.localeCompare(a.dateOfConsult));

  const diagnosisCounts = allConsults.reduce<Record<string, number>>((acc, c) => {
    acc[c.diagnosis] = (acc[c.diagnosis] ?? 0) + 1;
    return acc;
  }, {});

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 no-print">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <FileBarChart2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Reports</h2>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 no-print space-y-4">
        <div className="flex flex-wrap gap-3">
          {([
            { id: 'census', label: 'Patient Census' },
            { id: 'diagnosis', label: 'Diagnosis Summary' },
            { id: 'patient', label: 'Individual Patient' },
          ] as { id: ReportType; label: string }[]).map(r => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${reportType === r.id ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {reportType === 'patient' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Patient</label>
              <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{fullName(p)}</option>
                ))}
              </select>
            </div>
          )}
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline">
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Printable report area */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 print-page">
        <div className="mb-5 border-b pb-4">
          <h1 className="text-xl font-bold text-gray-900">
            {reportType === 'census' && 'Patient Census Report'}
            {reportType === 'diagnosis' && 'Diagnosis Summary Report'}
            {reportType === 'patient' && `Patient Record: ${selectedPatient ? fullName(selectedPatient) : ''}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {dateFrom && ` | From: ${new Date(dateFrom + 'T00:00:00').toLocaleDateString()}`}
            {dateTo && ` | To: ${new Date(dateTo + 'T00:00:00').toLocaleDateString()}`}
          </p>
        </div>

        {reportType === 'census' && <CensusReport patients={patients} fullName={fullName} filteredConsults={filteredConsults} />}
        {reportType === 'diagnosis' && <DiagnosisReport diagnosisCounts={diagnosisCounts} total={allConsults.length} />}
        {reportType === 'patient' && selectedPatient && (
          <PatientReport patient={selectedPatient} fullName={fullName} filteredConsults={filteredConsults} />
        )}
        {reportType === 'patient' && !selectedPatient && (
          <p className="text-gray-500 text-sm">No patient selected.</p>
        )}
      </div>
    </div>
  );
}

function CensusReport({ patients, fullName, filteredConsults }: {
  patients: Patient[];
  fullName: (p: Patient) => string;
  filteredConsults: (p: Patient) => Patient['consultations'];
}) {
  const stats = {
    total: patients.length,
    male: patients.filter(p => p.sex === 'Male').length,
    female: patients.filter(p => p.sex === 'Female').length,
    consults: patients.reduce((n, p) => n + filteredConsults(p).length, 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: stats.total },
          { label: 'Male', value: stats.male },
          { label: 'Female', value: stats.female },
          { label: 'Consultations', value: stats.consults },
        ].map(s => (
          <div key={s.label} className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{s.value}</p>
            <p className="text-xs text-blue-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border border-gray-200">#</th>
            <th className="text-left p-2 border border-gray-200">Patient Name</th>
            <th className="text-left p-2 border border-gray-200">Age</th>
            <th className="text-left p-2 border border-gray-200">Sex</th>
            <th className="text-left p-2 border border-gray-200">Address</th>
            <th className="text-left p-2 border border-gray-200">Consults</th>
            <th className="text-left p-2 border border-gray-200">Last Consult</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p, i) => {
            const consults = filteredConsults(p);
            const last = consults.length
              ? [...consults].sort((a, b) => b.dateOfConsult.localeCompare(a.dateOfConsult))[0]
              : null;
            return (
              <tr key={p.id} className="even:bg-gray-50">
                <td className="p-2 border border-gray-200">{i + 1}</td>
                <td className="p-2 border border-gray-200 font-medium">{fullName(p)}</td>
                <td className="p-2 border border-gray-200">{p.age}</td>
                <td className="p-2 border border-gray-200">{p.sex}</td>
                <td className="p-2 border border-gray-200">{p.address}</td>
                <td className="p-2 border border-gray-200 text-center">{consults.length}</td>
                <td className="p-2 border border-gray-200">
                  {last ? new Date(last.dateOfConsult + 'T00:00:00').toLocaleDateString() : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DiagnosisReport({ diagnosisCounts, total }: { diagnosisCounts: Record<string, number>; total: number }) {
  const sorted = Object.entries(diagnosisCounts).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return <p className="text-gray-500 text-sm">No consultations found for the selected period.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Total consultations: <strong>{total}</strong></p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border border-gray-200">#</th>
            <th className="text-left p-2 border border-gray-200">Diagnosis</th>
            <th className="text-left p-2 border border-gray-200">Count</th>
            <th className="text-left p-2 border border-gray-200">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([diag, count], i) => (
            <tr key={diag} className="even:bg-gray-50">
              <td className="p-2 border border-gray-200">{i + 1}</td>
              <td className="p-2 border border-gray-200">{diag}</td>
              <td className="p-2 border border-gray-200 font-semibold">{count}</td>
              <td className="p-2 border border-gray-200">{total > 0 ? ((count / total) * 100).toFixed(1) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatientReport({ patient, fullName, filteredConsults }: {
  patient: Patient;
  fullName: (p: Patient) => string;
  filteredConsults: (p: Patient) => Patient['consultations'];
}) {
  const consults = [...filteredConsults(patient)].sort((a, b) => b.dateOfConsult.localeCompare(a.dateOfConsult));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4">
        {[
          { label: 'Full Name', value: fullName(patient) },
          { label: 'Age', value: `${patient.age} years old` },
          { label: 'Sex', value: patient.sex },
          { label: 'Address', value: patient.address },
        ].map(f => (
          <div key={f.label}>
            <p className="text-xs font-semibold text-gray-500 uppercase">{f.label}</p>
            <p className="text-sm text-gray-900 mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Consultation History ({consults.length})</h3>
        {consults.length === 0 ? (
          <p className="text-gray-500 text-sm">No consultations for this period.</p>
        ) : (
          <div className="space-y-4">
            {consults.map((c, i) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-sm">#{i + 1}</span>
                  <span className="text-blue-700 font-medium text-sm">
                    {new Date(c.dateOfConsult + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-500 text-xs uppercase">Chief Complaint</p>
                    <p>{c.chiefComplaint}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500 text-xs uppercase">Diagnosis</p>
                    <p className="font-medium">{c.diagnosis}</p>
                  </div>
                </div>
                {(c.treatment.laboratory || c.treatment.pharmacologic || c.treatment.nonPharmacologic) && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {c.treatment.laboratory && (
                      <div>
                        <p className="font-semibold text-gray-500 text-xs uppercase">Laboratory</p>
                        <p className="whitespace-pre-wrap">{c.treatment.laboratory}</p>
                      </div>
                    )}
                    {c.treatment.pharmacologic && (
                      <div>
                        <p className="font-semibold text-gray-500 text-xs uppercase">Pharmacologic</p>
                        <p className="whitespace-pre-wrap">{c.treatment.pharmacologic}</p>
                      </div>
                    )}
                    {c.treatment.nonPharmacologic && (
                      <div>
                        <p className="font-semibold text-gray-500 text-xs uppercase">Non-Pharmacologic</p>
                        <p className="whitespace-pre-wrap">{c.treatment.nonPharmacologic}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
