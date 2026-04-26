import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, Home, Brain, ShoppingCart, ArrowUpRight } from 'lucide-react';

const actions = [
  { label: 'Job portal', path: '/jobs', desc: 'Internships & roles', icon: Briefcase, tone: 'from-indigo-500 to-blue-600' },
  { label: 'Accommodation', path: '/accommodations', desc: 'Rooms near campus', icon: Home, tone: 'from-blue-500 to-indigo-600' },
  { label: 'Study & Q&A', path: '/study-support', desc: 'Materials & help', icon: Brain, tone: 'from-amber-500 to-orange-600' },
  { label: 'Marketplace', path: '/marketplace', desc: 'Buy & sell', icon: ShoppingCart, tone: 'from-violet-500 to-purple-600' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function QuickActions() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <motion.div key={a.path} variants={item}>
            <Link
              to={a.path}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${a.tone} text-white shadow-md`}
              >
                <Icon className="w-4.5 h-4.5" strokeWidth={2.25} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  {a.label}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-blue-600" />
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{a.desc}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
