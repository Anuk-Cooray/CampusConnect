import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const StudySupportNav = ({ userName, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navTabs = [
    { label: 'Overview', path: '/study-support', icon: '📚' },
    { label: 'Study Rooms', path: '/study-support/bookings', icon: '🏫' },
    { label: 'Materials', path: '/study-support/materials', icon: '📄' },
    { label: 'Kuppi Sessions', path: '/study-support/kuppi', icon: '👥' },
    { label: 'Q&A Forum', path: '/study-support/qna', icon: '❓' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
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
  );
};

export default StudySupportNav;
