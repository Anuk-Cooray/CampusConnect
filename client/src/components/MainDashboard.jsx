import React from 'react';
import { Link } from 'react-router-dom';

const MainDashboard = () => {
  const modules = [
    {
      title: 'Job & Internship Portal',
      description: 'Find and apply for career opportunities.',
      path: '/jobs',
      color: 'bg-blue-600',
      icon: '💼',
    },
    {
      title: 'Accommodation & Timetable',
      description: 'Manage boarding and your academic schedule.',
      path: '/accommodation',
      color: 'bg-green-600',
      icon: '🏠',
    },
    {
      title: 'Student Marketplace',
      description: 'Buy and sell academic items securely.',
      path: '/marketplace',
      color: 'bg-purple-600',
      icon: '🛒',
    },
    {
      title: 'Study Support & Q&A',
      description: 'Share notes, book sessions, and ask questions.',
      path: '/study-support',
      color: 'bg-orange-600',
      icon: '📚',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider">CampusConnect</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-100">Welcome, Student</span>
          <button className="bg-blue-900 hover:bg-blue-950 px-4 py-2 rounded text-sm transition">
            Log Out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Student Hub</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access all your academic and campus life tools in one secure platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <Link
              to={module.path}
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div
                className={`${module.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 text-white shadow-inner group-hover:scale-110 transition-transform`}
              >
                {module.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{module.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">{module.description}</p>
              <span
                className={`text-sm font-semibold ${module.color.replace(
                  'bg-',
                  'text-',
                )} group-hover:underline`}
              >
                Enter Portal &rarr;
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;

