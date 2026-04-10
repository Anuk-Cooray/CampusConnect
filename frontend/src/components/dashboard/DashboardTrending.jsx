import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const trends = [
  { tag: '#SLIIT Final Year Project Defenses', count: '120 recent posts' },
  { tag: 'MERN Stack Debugging Session', count: '45 recent posts' },
  { tag: 'Internship Hunting Tips 2026', count: '89 recent posts' },
];

export default function DashboardTrending() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-4"
    >
      <h3 className="font-bold text-slate-900 mb-3 px-1 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.25} />
          Trending on campus
        </span>
      </h3>
      <ul className="space-y-1">
        {trends.map((t) => (
          <li key={t.tag} className="hover:bg-slate-50 p-2 rounded-xl cursor-default transition-colors group">
            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
              {t.tag}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t.count}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="w-full text-center text-sm font-bold text-blue-600 hover:text-blue-700 mt-2 p-2 hover:bg-blue-50 rounded-xl transition-colors"
      >
        Show more
      </button>
    </motion.div>
  );
}
