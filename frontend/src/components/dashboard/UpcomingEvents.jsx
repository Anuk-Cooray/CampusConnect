import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight, MapPin, Video } from 'lucide-react';

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

export default function UpcomingEvents({ sessions, loading }) {
  const top = Array.isArray(sessions) ? sessions.slice(0, 5) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <CalendarClock className="w-4 h-4" strokeWidth={2.25} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Upcoming kuppi</h3>
            <p className="text-xs text-slate-500">From live /api/kuppi-sessions</p>
          </div>
        </div>
        <Link
          to="/study-support/kuppi/upcoming"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500 font-medium">Loading sessions…</div>
      ) : top.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No kuppi sessions yet.{' '}
          <Link to="/study-support/kuppi/create" className="font-bold text-blue-600 hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <motion.ul variants={listVariants} initial="hidden" animate="show" className="divide-y divide-slate-100">
          {top.map((s) => (
            <motion.li key={s._id} variants={rowVariants} className="px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
              <p className="font-bold text-slate-900 text-sm line-clamp-1">{s.topic}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  {s.date} · {s.time}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  {s.sessionType === 'online' ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
                      Online
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
                      {s.location || 'On campus'}
                    </>
                  )}
                </span>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.div>
  );
}
