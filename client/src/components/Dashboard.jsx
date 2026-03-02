import React, { useState } from 'react';

const JobPortal = () => {
  const [jobs] = useState([
    {
      _id: '1',
      title: 'Software Engineering Intern',
      company: 'WSO2',
      jobType: 'Internship',
      description:
        'Looking for a passionate 3rd-year student to join our cloud team. Must have basic knowledge of React and Node.js.',
      postedDate: '2 Days Ago',
    },
    {
      _id: '2',
      title: 'Junior QA Engineer',
      company: 'IFS',
      jobType: 'Job',
      description:
        'Entry-level Quality Assurance role. Experience with automated testing tools like Selenium or Cypress is a plus.',
      postedDate: '1 Week Ago',
    },
    {
      _id: '3',
      title: 'UI/UX Design Intern',
      company: 'Sysco LABS',
      jobType: 'Internship',
      description:
        'Assist in designing user-friendly interfaces for our enterprise applications. Figma experience required.',
      postedDate: 'Just Now',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);

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

  const submitApplication = (e) => {
    e.preventDefault();
    if (!cvFile) {
      alert('Please upload your CV before applying.');
      return;
    }

    console.log(`Applying for ${selectedJob.title} with CV:`, cvFile.name);

    setIsModalOpen(false);
    setSelectedJob(null);
    setCvFile(null);
    alert('Application submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider">CampusConnect</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-100">Welcome, Student</span>
          <button className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded text-sm transition">
            Log Out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Job & Internship Feed</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
            {jobs.length} Available
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    job.jobType === 'Internship'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {job.jobType}
                </span>
                <span className="text-xs text-gray-400 font-medium">{job.postedDate}</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
              <p className="text-sm text-blue-600 font-medium mb-3">{job.company}</p>
              <p className="text-sm text-gray-600 mb-6 flex-grow">{job.description}</p>

              <button
                onClick={() => handleApplyClick(job)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Apply for {selectedJob.title}</h3>
            <p className="text-sm text-gray-500 mb-6">at {selectedJob.company}</p>

            <form onSubmit={submitApplication}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CV (Mandatory)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="mt-1 text-xs text-red-500">* PDF format only.</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Submit Application
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

