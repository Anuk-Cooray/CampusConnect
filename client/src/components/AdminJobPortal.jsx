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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      postedBy: '65e4a3b2c1f8d900123abcde',
    };

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
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await fetch(`http://localhost:5000/api/jobs/${id}`, {
          method: 'DELETE',
        });
        fetchJobs();
      } catch (err) {
        console.error('Error deleting job', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Job Portal Management</h2>
          <Link to="/admin-dashboard" className="text-blue-600 hover:underline font-medium">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-fit">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Listing' : 'Post New Listing'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded p-2"
                >
                  <option value="Job">Job</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="mt-1 w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-800 text-white py-2 rounded hover:bg-slate-900 transition"
                >
                  {editingId ? 'Update Listing' : 'Post Listing'}
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
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Active Postings</h3>
            {jobs.length === 0 ? (
              <p className="text-gray-500 italic">No jobs posted yet.</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-lg text-blue-700">{job.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${
                          job.jobType === 'Internship'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {job.jobType}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4 min-w-[80px]">
                    <button
                      onClick={() => handleEdit(job)}
                      className="bg-blue-100 text-blue-700 text-sm py-1 rounded hover:bg-blue-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="bg-red-100 text-red-700 text-sm py-1 rounded hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobPortal;

