import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const StudySupportDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Navigation tabs for sub-pages
  const navTabs = [
    { label: 'Overview', path: '/study-support', icon: '📚' },
    { label: 'Study Rooms', path: '/study-support/bookings', icon: '🏫' },
    { label: 'Materials', path: '/study-support/materials', icon: '📄' },
    { label: 'Kuppi Sessions', path: '/study-support/kuppi', icon: '👥' },
    { label: 'Q&A Forum', path: '/study-support/qna', icon: '❓' },
  ];

  const modules = [
    {
      title: 'Study Room Booking',
      description: 'Reserve study rooms for group sessions. Book up to 2 hours with conflict-free scheduling.',
      path: '/study-support/bookings',
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
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Back & Branding */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-semibold">Back</span>
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm leading-none">S</span>
                </div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Study Support</h1>
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center space-x-5">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-900">{userName}</span>
                <span className="text-xs font-medium text-slate-500">{userRole}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="border-t border-slate-100 flex overflow-x-auto">
            {navTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Academic Support Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Your Complete{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Study Toolkit
            </span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Book study rooms, access lecture materials, join peer sessions, and get academic help from the community—all in one place.
          </p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <Link
              to={module.path}
              key={index}
              className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300" />

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                {module.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                {module.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 font-medium mb-4 flex-grow leading-relaxed">
                {module.description}
              </p>

              {/* CTA */}
              <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                Explore
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
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

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {/* Quick Tips Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Quick Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <span className="text-slate-800 font-medium">Book study rooms early</span> - they fill up quickly</li>
              <li>• <span className="text-slate-800 font-medium">Check material uploads</span> regularly for new resources</li>
              <li>• <span className="text-slate-800 font-medium">Join Kuppi sessions</span> to study with peers</li>
            </ul>
          </div>

          {/* Support Info Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Need Help?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Can't find what you need? Post a question in the Q&A forum or reach out to a senior student through Kuppi sessions.
            </p>
            <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-200">
              Ask a Question
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudySupportDashboard;
