import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const JobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs');
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      alert('Business Rule: CV must be in PDF format');
      e.target.value = null;
      setCvFile(null);
    } else {
      setCvFile(file);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      alert('Please upload your CV before applying.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('cvFile', cvFile);
    formData.append('jobId', selectedJob._id);
    formData.append('studentId', 'IT23328020');

    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      alert('Application submitted successfully! 🚀');
      setIsModalOpen(false);
      setSelectedJob(null);
      setCvFile(null);
    } catch (err) {
      console.error('Application error:', err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-slate-800">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-700">
              Campus<span className="text-slate-800">Connect</span>
            </h1>
            <Link
              to="/dashboard"
              className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              &larr; Back to Hub
            </Link>
          </div>
          <div className="flex items-center space-x-5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">Anuk Cooray</span>
              <span className="text-xs font-medium text-slate-500">IT23328020</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
              AC
            </div>
            <Link
              to="/login"
              onClick={() => localStorage.clear()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              Log Out
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Discover Opportunities
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              Find the perfect job or internship to kickstart your career.
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
            </span>
            <span className="text-sm font-bold text-slate-700">{jobs.length} Active Postings</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <span className="text-4xl mb-4 block">📭</span>
              <h3 className="text-xl font-bold text-slate-700">
                No opportunities available right now.
              </h3>
              <p className="text-slate-500 mt-2">Check back later for new postings!</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job._id}
                className="group bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-5">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full tracking-wide ${
                      job.jobType === 'Internship'
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : 'bg-green-50 text-green-700 border border-green-100'
                    }`}
                  >
                    {job.jobType}
                  </span>
                  <button className="text-slate-300 hover:text-blue-500 transition-colors">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-2">{job.title}</h3>
                <p className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {job.company}
                </p>
                <p className="text-sm text-slate-500 mb-8 flex-grow line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                <button
                  onClick={() => handleApplyClick(job)}
                  className="w-full bg-slate-50 group-hover:bg-blue-600 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-transparent font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-sm group-hover:shadow-md active:scale-95"
                >
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  Apply for {selectedJob.title}
                </h3>
                <p className="text-sm font-medium text-blue-600 mt-1">{selectedJob.company}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={submitApplication}>
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Upload Resume / CV <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="pointer-events-none text-slate-500">
                    <svg
                      className="w-8 h-8 mx-auto mb-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    {cvFile ? (
                      <span className="font-bold text-blue-700">{cvFile.name}</span>
                    ) : (
                      <span className="font-medium text-sm">Click to browse or drag PDF here</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 font-bold rounded-xl text-white transition-all shadow-md active:scale-95 ${
                    isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPortal;

