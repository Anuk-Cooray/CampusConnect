import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const adminModules = [
    {
      title: 'Manage Jobs & Internships',
      description: 'Create, Edit, and Delete job postings.',
      path: '/admin/jobs',
      color: 'bg-slate-700',
      icon: '⚙️',
    },
    {
      title: 'Manage Accommodations',
      description: 'Review and remove boarding listings.',
      path: '/admin/accommodation',
      color: 'bg-slate-700',
      icon: '⚙️',
    },
    {
      title: 'Manage Marketplace',
      description: 'Monitor student marketplace items.',
      path: '/admin/marketplace',
      color: 'bg-slate-700',
      icon: '⚙️',
    },
    {
      title: 'Manage Study Support',
      description: 'Moderate Q&A forum and study sessions.',
      path: '/admin/study-support',
      color: 'bg-slate-700',
      icon: '⚙️',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center border-b-4 border-red-500">
        <h1 className="text-xl font-bold tracking-wider">
          CampusConnect <span className="text-red-400 text-sm ml-2">ADMIN PORTAL</span>
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-300">Welcome, System Admin</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition font-bold"
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-300 pb-4">
          <h2 className="text-3xl font-bold text-gray-900">System Administration</h2>
          <p className="text-gray-600 mt-2">Select a module to perform CRUD operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminModules.map((module, index) => (
            <Link
              to={module.path}
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-xl hover:border-slate-400 transition-all group"
            >
              <div
                className={`${module.color} w-14 h-14 rounded-md flex items-center justify-center text-2xl mb-4 text-white shadow-inner`}
              >
                {module.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{module.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">{module.description}</p>
              <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                Open Manager &rarr;
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

