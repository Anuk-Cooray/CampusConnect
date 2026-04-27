import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function WelcomeBanner({ userName }) {
  const first = userName?.split(' ')?.[0] || 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-5 sm:p-6 text-white shadow-lg shadow-blue-900/20"
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm mb-2.5">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            CampusConnect Dashboard
          </div>
          <h1 className="text-[28px] sm:text-[30px] leading-tight font-black tracking-tight">Welcome back, {first}</h1>
          <p className="mt-1.5 text-[13px] text-blue-100/90 max-w-2xl leading-relaxed">
            Your study feed, alerts, and campus shortcuts in one place. Share questions, catch kuppi sessions, and stay
            ahead of deadlines.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
