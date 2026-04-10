import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bell, CalendarDays, Activity } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Feed posts',
      value: stats.postCount,
      hint: 'Live from /api/posts',
      icon: MessageSquare,
    },
    {
      label: 'Unread alerts',
      value: stats.unreadCount,
      hint: 'Notification center',
      icon: Bell,
    },
    {
      label: 'Kuppi sessions',
      value: stats.kuppiCount,
      hint: 'Listed on campus',
      icon: CalendarDays,
    },
    {
      label: 'Total alerts',
      value: stats.notificationCount,
      hint: 'All notifications',
      icon: Activity,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            variants={item}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{c.label}</p>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">{c.value}</p>
                <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Icon className="w-5 h-5" strokeWidth={2.25} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
