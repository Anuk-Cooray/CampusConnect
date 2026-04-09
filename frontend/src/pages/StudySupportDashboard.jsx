import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const StudySupportDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Student');
  const [userRole, setUserRole] = useState('Student');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const modules = [
    {
      title: 'Study Room Booking',
      description: 'Reserve study rooms for group sessions. Book up to 2 hours with conflict-free scheduling.',
      path: '/study-support/bookings',
      color: 'from-amber-400 to-orange-500',
      shadow: 'hover:shadow-amber-200',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Lecture Materials',
      description: 'Access lecture notes, slides and study materials uploaded by your lecturers.',
      path: '/study-support/materials',
      color: 'from-teal-400 to-emerald-500',
      shadow: 'hover:shadow-teal-200',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Kuppi Sessions',
      description: 'Join or create student-led peer learning sessions to study together.',
      path: '/study-support/kuppi',
      color: 'from-violet-400 to-purple-500',
      shadow: 'hover:shadow-violet-200',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Q&A Forum',
      description: 'Ask academic questions, share knowledge, and get answers from senior students.',
      path: '/study-support/qna',
      color: 'from-rose-400 to-pink-500',
      shadow: 'hover:shadow-rose-200',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 font-sans text-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-1 text-slate-500 hover:text-orange-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-semibold">Dashboard</span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-md flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">S</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">
                <span className="text-orange-600">Study</span>
                <span className="text-slate-800">Support</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">{userName}</span>
              <span className="text-xs font-medium text-slate-500">{userRole}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Study Support & Q&A
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Your Academic{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Toolkit
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Book study rooms, access lecture materials, join peer sessions, and get help from the community.
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((module, index) => (
            <Link
              to={module.path}
              key={index}
              className={`group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl ${module.shadow} hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden`}
            >
              <div
                className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {module.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                {module.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-8 flex-grow leading-relaxed">
                {module.description}
              </p>

              <div className="mt-auto flex items-center text-sm font-bold text-slate-400 group-hover:text-orange-600 transition-colors">
                Open
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudySupportDashboard;
