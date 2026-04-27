import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Briefcase, Home, Brain, ShoppingCart, Clock } from 'lucide-react';

const LINKS = [
  { name: 'Study Support Feed', path: '/dashboard', icon: BookOpen, chip: 'bg-blue-100 text-blue-600' },
  { name: 'Job & Internship Portal', path: '/jobs', icon: Briefcase, chip: 'bg-indigo-100 text-indigo-600' },
  { name: 'Accommodation', path: '/accommodations', icon: Home, chip: 'bg-blue-100 text-blue-600' },
  { name: 'Study Support & Q&A', path: '/study-support', icon: Brain, chip: 'bg-orange-100 text-orange-600' },
  { name: 'Student Marketplace', path: '/marketplace', icon: ShoppingCart, chip: 'bg-purple-100 text-purple-600' },
  { name: 'Student TimeTable Management', path: '/time-management', icon: Clock, chip: 'bg-purple-100 text-purple-600' },

];

export default function DashboardSidebar({ userName, studentId = 'IT23328020' }) {
  const location = useLocation();

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-3 flex items-center gap-3 hover:shadow-md transition-shadow cursor-default">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md shadow-blue-600/20">
          {userName ? userName.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-[13px] truncate" title={userName}>
            {userName}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">IT Undergraduate</p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{studentId}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-1.5 space-y-0.5">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-semibold text-[13px] transition-all border-l-4 ${
                active ? 'bg-blue-50 text-blue-700 border-blue-600' : 'border-transparent hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active ? link.chip : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
              </div>
              <span className="truncate">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
