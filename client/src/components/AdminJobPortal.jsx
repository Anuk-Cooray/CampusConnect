import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminJobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    jobType: 'Job',
  });
  const [editingId, setEditingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, postedBy: '65e4a3b2c1f8d900123abcde' };
    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/jobs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('http://localhost:5000/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setFormData({ title: '', company: '', description: '', jobType: 'Job' });
      setEditingId(null);
      fetchJobs();
    } catch (err) {
      console.error('Error saving job', err);
    }
  };

  const handleEdit = (job) => {
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      jobType: job.jobType,
    });
    setEditingId(job._id);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'WARNING: Are you sure you want to permanently delete this listing from the database?',
      )
    ) {
      try {
        await fetch(`http://localhost:5000/api/jobs/${id}`, { method: 'DELETE' });
        fetchJobs();
      } catch (err) {
        console.error('Error deleting job', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Job Database Management</h2>
            <p className="text-sm text-slate-500 mt-1">
              Live Database Connection:{' '}
              <span className="text-emerald-500 font-bold">● Active</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/applications"
              className="flex items-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
            >
              Review Applications &rarr;
            </Link>
            <Link
              to="/admin-dashboard"
              className="flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-lg"
            >
              Return to Root
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 h-fit sticky top-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {editingId ? 'Modify Record' : 'Inject New Record'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Listing Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="Job">Job</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  {editingId ? 'Commit Update' : 'Execute Insert'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        title: '',
                        company: '',
                        description: '',
                        jobType: 'Job',
                      });
                    }}
                    className="bg-slate-800 text-slate-300 font-bold px-4 py-3 rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors active:scale-95"
                  >
                    Abort
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">Active Database Entries</h3>

            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-10 text-center">
                  <span className="text-slate-500">Database collection is currently empty.</span>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex-1 pr-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-lg text-white leading-tight">{job.title}</h4>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-sm ${
                            job.jobType === 'Internship'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {job.jobType}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-blue-400 mb-2">{job.company}</p>
                      <p className="text-sm text-slate-400 line-clamp-2">{job.description}</p>
                    </div>

                    <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 mt-4 sm:mt-0 min-w-[100px]">
                      <button
                        onClick={() => handleEdit(job)}
                        className="w-full flex justify-center items-center bg-slate-800 text-blue-400 font-bold text-xs uppercase tracking-wide py-2 rounded-lg hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/50 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="w-full flex justify-center items-center bg-slate-800 text-red-400 font-bold text-xs uppercase tracking-wide py-2 rounded-lg hover:bg-red-900/30 border border-slate-700 hover:border-red-500/50 transition-all"
                      >
                        Drop
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobPortal;

