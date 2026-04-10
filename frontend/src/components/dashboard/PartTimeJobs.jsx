import React, { useState } from 'react';
import { Clock, Moon, Sun, Banknote, Users, MapPin, X } from 'lucide-react';

const PART_TIME_JOBS = [
  {
    id: 101,
    title: 'Night Shift Data Entry',
    company: 'TechFlow Logistics',
    description:
      'Entering shipping manifest data into the central database. Requires basic typing speed.',
    salary: 'Rs. 35,000 / Month',
    hours: '6 Hours',
    shift: 'Night',
    gender: 'Any',
    location: 'Remote',
  },
  {
    id: 102,
    title: 'Event Promo Staff',
    company: 'RedBull Sri Lanka',
    description: 'Representing the brand at weekend gaming tournaments and campus events.',
    salary: 'Rs. 3,500 / Day',
    hours: '8 Hours (Weekends)',
    shift: 'Morning/Day',
    gender: 'Female',
    location: 'Colombo 07',
  },
  {
    id: 103,
    title: 'IT Lab Assistant',
    company: 'Campus IT Services',
    description: 'Helping set up networking cables and troubleshooting basic PC issues.',
    salary: 'Rs. 2,000 / Day',
    hours: '4 Hours',
    shift: 'Evening',
    gender: 'Male',
    location: 'On-Campus',
  },
];

export function PartTimeJobs() {
  const [applyingJob, setApplyingJob] = useState(null);
  const [formData, setFormData] = useState({
    name: typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Anuk Cooray' : 'Anuk Cooray',
    phone: '',
    availability: '',
  });

  const getShiftBadge = (shift) => {
    if (shift === 'Night') {
      return (
        <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
          <Moon className="w-3 h-3" strokeWidth={2.5} />
          Night Shift
        </span>
      );
    }
    if (shift === 'Morning/Day') {
      return (
        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
          <Sun className="w-3 h-3" strokeWidth={2.5} />
          Day Shift
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
        <Clock className="w-3 h-3" strokeWidth={2.5} />
        Evening Shift
      </span>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applyingJob) return;

    const newApplication = {
      id: Date.now(),
      name: formData.name.trim(),
      role: applyingJob.title,
      company: applyingJob.company,
      atsScore: Math.floor(Math.random() * 15) + 80,
      status: 'Pending',
      skills: `Available: ${formData.availability.trim()} | Phone: ${formData.phone.trim()}`,
    };

    let existingApps = [];
    try {
      const raw = localStorage.getItem('vivaApplications');
      const parsed = raw ? JSON.parse(raw) : [];
      existingApps = Array.isArray(parsed) ? parsed : [];
    } catch {
      existingApps = [];
    }

    localStorage.setItem('vivaApplications', JSON.stringify([...existingApps, newApplication]));

    window.alert(`Success! Your application for ${applyingJob.company} has been sent to the Admin.`);
    setApplyingJob(null);
    setFormData((prev) => ({
      ...prev,
      phone: '',
      availability: '',
    }));
  };

  return (
    <div className="w-full animate-fade-in-up font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student part-time roles</h2>
          <p className="text-sm text-slate-500">Flexible jobs to help you earn while you learn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PART_TIME_JOBS.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-3 gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-blue-600 font-medium">{job.company}</p>
              </div>
              <div className="flex-shrink-0">{getShiftBadge(job.shift)}</div>
            </div>
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{job.description}</p>
            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
                <Banknote className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2.25} />
                <span className="font-semibold truncate">{job.salary}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" strokeWidth={2.25} />
                <span className="truncate">{job.hours}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
                <Users className="w-4 h-4 text-purple-600 flex-shrink-0" strokeWidth={2.25} />
                <span>
                  Gender: <span className="font-semibold">{job.gender}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
                <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" strokeWidth={2.25} />
                <span className="truncate">{job.location}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApplyingJob(job)}
              className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Quick apply
            </button>
          </div>
        ))}
      </div>

      {applyingJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 truncate">Apply for {applyingJob.title}</h3>
                <p className="text-xs text-blue-600 font-bold truncate">{applyingJob.company}</p>
              </div>
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-500" strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact number</label>
                <input
                  required
                  type="tel"
                  placeholder="07X XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">When can you work?</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Weekends only, After 5 PM"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors mt-2"
              >
                Submit application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
