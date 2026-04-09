import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminApplicationViewer = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatFileUrl = (path) => {
    if (!path) return '#';
    const formattedPath = path.replace(/\\/g, '/');
    return `http://localhost:5000/${formattedPath}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Application Review Matrix</h2>
            <p className="text-sm text-slate-500 mt-1">
              Review student CVs and update candidate statuses.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/admin/jobs"
              className="flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg"
            >
              &larr; Back to Jobs
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No applications have been submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-bold">
                      <th className="p-5">Applicant ID</th>
                      <th className="p-5">Applied Position</th>
                      <th className="p-5">Resume / CV</th>
                      <th className="p-5">Current Status</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-5 font-bold text-white">{app.studentId}</td>
                        <td className="p-5">
                          {app.jobId ? (
                            <div>
                              <div className="font-bold text-blue-400">{app.jobId.title}</div>
                              <div className="text-xs text-slate-500">{app.jobId.company}</div>
                            </div>
                          ) : (
                            <span className="text-red-400 italic text-sm">
                              Job no longer exists
                            </span>
                          )}
                        </td>
                        <td className="p-5">
                          <a
                            href={formatFileUrl(app.cvUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-colors text-sm font-bold"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            View PDF
                          </a>
                        </td>
                        <td className="p-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                              app.status === 'Shortlisted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : app.status === 'Rejected'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-5 text-right space-x-2">
                          <button
                            onClick={() => updateStatus(app._id, 'Shortlisted')}
                            disabled={app.status === 'Shortlisted'}
                            className="px-3 py-1.5 bg-slate-800 text-emerald-400 font-bold text-xs rounded hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(app._id, 'Rejected')}
                            disabled={app.status === 'Rejected'}
                            className="px-3 py-1.5 bg-slate-800 text-red-400 font-bold text-xs rounded hover:bg-red-900/30 border border-slate-700 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplicationViewer;

