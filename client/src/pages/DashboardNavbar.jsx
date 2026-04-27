import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';

export default function DashboardNavbar({
  showNotifDropdown,
  setShowNotifDropdown,
  notifications,
  unreadCount,
  markAsRead,
  handleLogout,
}) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-2 shadow-sm flex justify-between items-center h-16">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
          <span className="text-white font-black text-xl tracking-tight">C</span>
        </div>
        <div className="hidden relative w-72 md:block">
          <input
            type="text"
            placeholder="Search posts, jobs, or students..."
            className="w-full bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2 pl-10 pr-4 text-sm transition-all outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" strokeWidth={2} />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="flex flex-col items-center text-slate-500 hover:text-blue-600 cursor-pointer transition-colors relative"
          >
            <Bell className="w-6 h-6" strokeWidth={2} />
            <span className="text-[10px] font-bold mt-0.5 hidden sm:block">Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 right-0 sm:right-2 min-w-[1.25rem] h-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500 font-medium">No new notifications.</div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      type="button"
                      key={notif._id}
                      onClick={() => markAsRead(notif._id)}
                      className={`w-full text-left p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3 ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                          notif.type === 'Job'
                            ? 'bg-indigo-100'
                            : notif.type === 'Accommodation'
                              ? 'bg-emerald-100'
                              : 'bg-blue-100'
                        }`}
                      >
                        {notif.type === 'Job' ? '💼' : notif.type === 'Accommodation' ? '🏠' : '🔔'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wide">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50">
                <span className="text-xs font-bold text-blue-600">CampusConnect</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center border-l border-slate-200 pl-5">
          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
