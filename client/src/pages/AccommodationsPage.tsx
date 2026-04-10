import { useState } from "react";
import { Link } from "react-router-dom";
import AccommodationList from "../components/accommodation/AccommodationList";
import AIChatBot from "../components/accommodation/AIChatBot";

export default function AccommodationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // AI Bot එකෙන් එවන filter data store කරගන්නා state එක
  const [aiFilters, setAiFilters] = useState<any>(null);

  /**
   * AI Bot එකෙන් filters ලැබුණු විට ක්‍රියාත්මක වේ.
   * මෙහි 'filters' යනු { maxPrice: 20000, location: 'Colombo' } වැනි object එකකි.
   */
  const handleAIFilter = (filters: any) => {
    console.log("AI Filters Received from Bot:", filters);
    setAiFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-slate-800">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">C</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-700">
              Campus<span className="text-slate-800">Connect</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* AI Filter එකක් තිබේ නම් එය Clear කිරීමට button එකක් */}
            {aiFilters && (
              <button 
                onClick={() => setAiFilters(null)}
                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                Reset AI Filters ✕
              </button>
            )}
            <Link
              to="/dashboard"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              ← Back to Hub
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Student{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Accommodation
          </span>
        </h2>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Discover verified rooms, hostels, and apartments near your campus with smart AI-powered assistance.
        </p>

        {user?.role === "admin" && (
          <div className="mt-6">
            <Link
              to="/accommodations/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
            >
              + Post Listing
            </Link>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* AccommodationList එකට aiFilters prop එක ලබා දීම */}
        <AccommodationList aiFilters={aiFilters} />
      </div>

      {/* AI Chatbot Component */}
      {/* වැදගත්: ඔබේ Bot එකේ prop එක 'onFiltersApplied' නිසා එය මෙසේ භාවිතා කරන්න */}
      <AIChatBot onFiltersApplied={handleAIFilter} />

    </div>
  );
}