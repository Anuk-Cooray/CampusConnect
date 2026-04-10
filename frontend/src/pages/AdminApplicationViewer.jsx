import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  Briefcase,
  Clock,
  Search,
  ArrowLeft,
  LayoutGrid,
} from 'lucide-react';
import { API_BASE } from '../utils/apiBase';

const VIVA_KEY = 'vivaApplications';

const DEFAULT_INTERNSHIPS = [
  {
    id: 'mock-int-1',
    name: 'Anuk Cooray',
    role: 'Full Stack Trainee',
    type: 'Internship',
    company: 'Arimac IT',
    atsScore: 92,
    status: 'Pending',
    skills: 'React, Node, MongoDB',
    category: 'Full stack',
    _source: 'mock',
  },
  {
    id: 'mock-int-2',
    name: 'Sarah Perera',
    role: 'UI/UX Intern',
    type: 'Internship',
    company: 'WSO2',
    atsScore: 78,
    status: 'Pending',
    skills: 'Figma, Tailwind, React',
    category: 'UI/UX',
    _source: 'mock',
  },
  {
    id: 'mock-int-3',
    name: 'Nimali Fernando',
    role: 'Frontend Intern',
    type: 'Internship',
    company: 'Sysco LABS',
    atsScore: 88,
    status: 'Pending',
    skills: 'React, TypeScript',
    category: 'Frontend',
    _source: 'mock',
  },
];

const DEFAULT_PART_TIME = [
  {
    id: 'mock-pt-4',
    name: 'Kamal Silva',
    role: 'IT Lab Assistant',
    type: 'Part-Time',
    company: 'Campus IT Services',
    atsScore: 85,
    status: 'Pending',
    skills: 'Networking, Hardware setup',
    category: 'IT & Hardware',
    _source: 'mock',
  },
];

function inferJobCategory(role, skills = '') {
  const r = `${role || ''} ${skills || ''}`.toLowerCase();
  if (/\b(ui\/ux|ux designer|ui designer|figma|user experience|user interface)\b/.test(r)) return 'UI/UX';
  if (/\b(qa|quality assurance|test engineer|selenium|cypress|stlc)\b/.test(r)) return 'QA & Testing';
  if (/\b(devops|sre|site reliability|kubernetes|docker|ci\/cd)\b/.test(r)) return 'DevOps & SRE';
  if (/\b(data scientist|data science|machine learning|ml engineer|tensorflow|pytorch|pandas|data engineer)\b/.test(r)) {
    return 'Data & ML';
  }
  if (/\b(mobile|flutter|react native|ios developer|android|swift|kotlin)\b/.test(r)) return 'Mobile';
  if (/\b(full.?stack|fullstack|mern|mean)\b/.test(r)) return 'Full stack';
  if (/\b(frontend|front-end|front end)\b/.test(r) || (/\b(react|angular|vue)\b/.test(r) && !/\b(backend|node\.js|spring)\b/.test(r))) {
    return 'Frontend';
  }
  if (/\b(backend|back-end|back end|node\.js|express|spring|\.net|c#|java developer)\b/.test(r)) return 'Backend';
  if (/\b(cyber|security|penetration|infosec)\b/.test(r)) return 'Cybersecurity';
  if (/\b(network|it lab|hardware|lab assistant|desktop support|networking)\b/.test(r)) return 'IT & Hardware';
  if (/\b(game|unity|unreal)\b/.test(r)) return 'Game development';
  if (/\b(product manager|project management|business analyst|scrum)\b/.test(r)) return 'Product & BA';
  if (/\b(writer|technical writer|documentation)\b/.test(r)) return 'Technical writing';
  if (/\b(cloud|aws|azure|gcp)\b/.test(r)) return 'Cloud';
  return 'Software & engineering';
}

function withResolvedCategory(app) {
  return {
    ...app,
    category: app.category || inferJobCategory(app.role, app.skills),
  };
}

function pseudoAtsScore(doc) {
  const str = String(doc._id || doc.studentId || '0');
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return 55 + (Math.abs(h) % 36);
}

function mapApiApplication(app) {
  return {
    id: `mongo-${app._id}`,
    name: app.studentId || 'Student',
    role: app.jobId?.title || 'Unknown role',
    type: 'Internship',
    company: (app.jobId?.company || 'Unknown company').trim() || 'Unknown company',
    atsScore: pseudoAtsScore(app),
    status: app.status || 'Pending',
    skills: app.cvUrl ? 'CV on file (PDF) — internship application' : 'No CV path',
    category: inferJobCategory(app.jobId?.title, ''),
    _source: 'api',
    _mongoId: app._id,
  };
}

function parseVivaFromStorage() {
  try {
    const raw = localStorage.getItem(VIVA_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.map((v) => ({
      id: `viva-${v.id}`,
      name: v.name,
      role: v.role,
      type: 'Part-Time',
      company: (v.company || 'Unknown company').trim() || 'Unknown company',
      atsScore: typeof v.atsScore === 'number' ? v.atsScore : 82,
      status: v.status || 'Pending',
      skills: v.skills || '',
      _source: 'viva',
      _vivaNumericId: v.id,
    }));
  } catch {
    return [];
  }
}

function updateVivaStatus(vivaNumericId, newStatus) {
  let arr = [];
  try {
    const raw = localStorage.getItem(VIVA_KEY) || '[]';
    arr = JSON.parse(raw);
    if (!Array.isArray(arr)) arr = [];
  } catch {
    arr = [];
  }
  const next = arr.map((a) => (a.id === vivaNumericId ? { ...a, status: newStatus } : a));
  localStorage.setItem(VIVA_KEY, JSON.stringify(next));
}

function isApprovedStatus(s) {
  return s === 'Approved' || s === 'Shortlisted';
}

function getCategoryBadge(score) {
  if (score >= 85) {
    return (
      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
        ⭐ Top match
      </span>
    );
  }
  if (score >= 70) {
    return (
      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
        👍 Good fit
      </span>
    );
  }
  return (
    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
        👀 Review needed
    </span>
  );
}

export default function AdminApplicationViewer() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobTypeFilter, setJobTypeFilter] = useState('Internship');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const loadMergedApplications = useCallback(async () => {
    setIsLoading(true);
    let apiRows = [];
    try {
      const res = await fetch(`${API_BASE}/api/applications`);
      const data = await res.json();
      if (Array.isArray(data)) {
        apiRows = data.map(mapApiApplication);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
    }

    const vivaRows = parseVivaFromStorage();
    setApplications([...DEFAULT_INTERNSHIPS, ...apiRows, ...DEFAULT_PART_TIME, ...vivaRows]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadMergedApplications();
  }, [loadMergedApplications]);

  useEffect(() => {
    const refresh = () => loadMergedApplications();
    const onStorage = (e) => {
      if (e.key === VIVA_KEY) refresh();
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadMergedApplications]);

  useEffect(() => {
    setCategoryFilter('All');
  }, [jobTypeFilter]);

  const jobCategoryOptions = useMemo(() => {
    const inQueue = applications.filter((app) =>
      jobTypeFilter === 'Internship' ? app.type === 'Internship' : app.type === 'Part-Time',
    );
    const cats = new Set(inQueue.map((a) => a.category || inferJobCategory(a.role, a.skills)));
    return ['All', ...Array.from(cats).sort((a, b) => a.localeCompare(b))];
  }, [applications, jobTypeFilter]);

  const handleAction = async (id, newStatus) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return;

    if (app._source === 'api' && app._mongoId) {
      try {
        const res = await fetch(`${API_BASE}/api/applications/${app._mongoId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error(err.message || 'Update failed');
          return;
        }
        await loadMergedApplications();
      } catch (err) {
        console.error(err);
      }
      return;
    }

    if (app._source === 'viva' && app._vivaNumericId != null) {
      updateVivaStatus(app._vivaNumericId, newStatus);
      await loadMergedApplications();
      return;
    }

    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
  };

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesJobType =
        jobTypeFilter === 'Internship' ? app.type === 'Internship' : app.type === 'Part-Time';
      let matchesStatus = false;
      if (statusFilter === 'All') {
        matchesStatus = app.status === 'Pending';
      } else if (statusFilter === 'Approved') {
        matchesStatus = isApprovedStatus(app.status);
      } else {
        matchesStatus = app.status === 'Rejected';
      }
      if (!matchesJobType || !matchesStatus) return false;
      const cat = app.category || inferJobCategory(app.role, app.skills);
      if (categoryFilter !== 'All' && cat !== categoryFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (app.name || '').toLowerCase().includes(q) ||
        (app.role || '').toLowerCase().includes(q) ||
        (app.company || '').toLowerCase().includes(q) ||
        (app.skills || '').toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q)
      );
    });
  }, [applications, jobTypeFilter, categoryFilter, statusFilter, search]);

  const groupedApplications = useMemo(() => {
    const acc = filteredApps.reduce((groups, app) => {
      const key = app.company || 'Unknown company';
      if (!groups[key]) groups[key] = [];
      groups[key].push(app);
      return groups;
    }, {});
    return Object.entries(acc).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredApps]);

  const queueLabel =
    jobTypeFilter === 'Internship' ? 'internship' : 'part-time';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto p-6 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner w-full max-w-md sm:max-w-none sm:w-auto">
            <button
              type="button"
              onClick={() => setJobTypeFilter('Internship')}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                jobTypeFilter === 'Internship'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Briefcase className="w-4 h-4 flex-shrink-0" strokeWidth={2.25} />
              Internships
            </button>
            <button
              type="button"
              onClick={() => setJobTypeFilter('Part-Time')}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                jobTypeFilter === 'Part-Time'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Clock className="w-4 h-4 flex-shrink-0" strokeWidth={2.25} />
              Part-time jobs
            </button>
          </div>

          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2.25} />
              Job category
            </div>
            <div className="bg-slate-100/90 rounded-2xl border border-slate-200/80 p-2 shadow-inner overflow-x-auto">
              <div className="flex flex-wrap justify-center gap-1.5 min-w-min px-1">
                {jobCategoryOptions.map((cat) => {
                  const active = categoryFilter === cat;
                  const isAll = cat === 'All';
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                        active
                          ? jobTypeFilter === 'Internship'
                            ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                            : 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      {isAll ? 'All categories' : cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-t border-slate-200 pt-6">
          <div>
            <Link
              to="/admin/jobs"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-2"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.25} />
              Back to jobs
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              {jobTypeFilter === 'Internship' ? 'Internship placements' : 'Part-time recruitment'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Review and route candidates by partner company. Live API internships and part-time
              submissions merge into the right queue.
            </p>
          </div>
          <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl w-full md:w-auto">
            {['All', 'Approved', 'Rejected'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === f
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'All' ? 'Pending review' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, role, company, or notes…"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-300/60"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {groupedApplications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 shadow-sm flex flex-col items-center">
                <FileText className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.5} />
                <p className="text-lg font-medium text-slate-600">
                  No {queueLabel} candidates found.
                </p>
                <p className="text-sm">Try another job category, status filter, or search.</p>
              </div>
            ) : (
              groupedApplications.map(([companyName, apps]) => (
                <div
                  key={companyName}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg text-white flex-shrink-0 ${
                          jobTypeFilter === 'Internship' ? 'bg-blue-600' : 'bg-indigo-600'
                        }`}
                      >
                        <Building2 className="w-5 h-5" strokeWidth={2.25} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 truncate">{companyName}</h2>
                      <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                        {apps.length} candidate{apps.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {apps.map((app) => (
                      <div
                        key={app.id}
                        className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 w-full md:w-auto min-w-0 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border flex-shrink-0 ${
                              jobTypeFilter === 'Internship'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {(app.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">{app.name}</h3>
                              {app._source === 'viva' && (
                                <span className="text-[10px] font-bold uppercase tracking-wide bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                                  Live apply
                                </span>
                              )}
                              {getCategoryBadge(app.atsScore)}
                              <span
                                className={`text-sm font-black tabular-nums ${
                                  jobTypeFilter === 'Internship' ? 'text-blue-600' : 'text-indigo-600'
                                }`}
                              >
                                {app.atsScore}%
                              </span>
                            </div>
                            <p
                              className={`text-sm font-semibold mt-0.5 ${
                                jobTypeFilter === 'Internship' ? 'text-blue-600' : 'text-indigo-600'
                              }`}
                            >
                              {app.role}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500 mt-1">
                              <span className="text-slate-400 font-semibold">Category · </span>
                              {app.category || inferJobCategory(app.role, app.skills)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                              <FileText className="w-3 h-3 flex-shrink-0 mt-0.5" strokeWidth={2} />
                              <span>{app.skills}</span>
                            </p>
                          </div>
                        </div>

                        {app.status === 'Pending' ? (
                          <div className="flex gap-2 w-full md:w-auto">
                            <button
                              type="button"
                              onClick={() => handleAction(app.id, 'Approved')}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-bold transition-all shadow-sm"
                            >
                              <CheckCircle className="w-4 h-4" strokeWidth={2} />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(app.id, 'Rejected')}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-sm font-bold transition-all shadow-sm"
                            >
                              <XCircle className="w-4 h-4" strokeWidth={2} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 border ${
                              isApprovedStatus(app.status)
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                : 'text-rose-700 bg-rose-50 border-rose-100'
                            }`}
                          >
                            {isApprovedStatus(app.status) ? (
                              <CheckCircle className="w-4 h-4" strokeWidth={2} />
                            ) : (
                              <XCircle className="w-4 h-4" strokeWidth={2} />
                            )}
                            {app.status === 'Shortlisted' ? 'Approved' : app.status}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
